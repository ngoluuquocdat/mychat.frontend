import React, { Component } from 'react';
import UserCard from './UserCard';
import ChatBox from './ChatBox';
import { ENV } from "../env";
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import axios from "axios";
import { withRouter } from "react-router-dom";
import "../styles/main-page.scss";

class MainPage extends Component {

    state = {
        withUser: {},
        current_user: {
            id: localStorage.getItem('anonymous-guid')
        },
        list_users: [],
        messages: [],
        connection: null,
        pickingUserId: '',
        unseenSenderIds: []
    }

    baseUrl = ENV.BASE_URL;

    async componentDidMount() {
        console.log('run did mount')
        // call api get user info
        await this.getUserInfo();
        // call api get list chat users
        await this.getChatUsers();
        // connect user to chat hub
        await this.connectToChatHub();
    }

    async componentDidUpdate(prevProps, prevState) {
        // connect signal R again if current_user change
        // if(prevState.current_user.id !== this.state.current_user.id) {
        //     // connect user to chat hub
        //     await this.connectToChatHub();
        // }
        // get list messages
        if(prevState.withUser !== this.state.withUser) {
            await this.getMessages();
        }
    }

    getUserInfo = async () => {
        const token = localStorage.getItem('user-token');
        if(!token) {     
            return;
        }
        try {
            let res = await axios.get(
                `${this.baseUrl}/api/Users/me`,
                {
                    headers: { Authorization:`Bearer ${token}` }
                }
            );  
            this.setState({
                current_user: res.data
            })      

        } catch(e) {
            console.log(e)
            if(e.response.status === 401) {
                this.props.history.push('/');   
            }
        }
    }

    getUsers = async () => {
        const token = localStorage.getItem('user-token');
        if(!token) {
            return;
        }
        try {
            let res = await axios.get(
                `${this.baseUrl}/api/Users?page=1&perPage=10`,
                {
                    headers: { Authorization:`Bearer ${token}` }
                }
            );  
            this.setState({
                list_users: res.data
            })      

        } catch(e) {
            console.log(e)
        }
    }

    getChatUsers = async () => {
        const token = localStorage.getItem('user-token');
        if(!token) {
            return;
        }
        try {
            let res = await axios.get(
                `${this.baseUrl}/api/Users/me/chats-list`,
                {
                    headers: { Authorization:`Bearer ${token}` }
                }
            );  
            this.setState({
                list_users: res.data
            })      
        } catch(e) {
            console.log(e)
        }
    }

    getMessages = async () => {
        const token = localStorage.getItem('user-token');
        if(!token) {
            try {
                const current_user_id = this.state.current_user.id;
                const withUserId = this.state.withUser.id;
                let res = await axios.get(
                    `${this.baseUrl}/api/Messages/for-guests?userId=${current_user_id}&withUserId=${withUserId}`
                );  
                this.setState({
                    messages: res.data
                })      
            } catch(e) {
                console.log(e)
            }
        } else {
            try {
                const withUserId = this.state.withUser.id;
                let res = await axios.get(
                    `${this.baseUrl}/api/Messages?withUserId=${withUserId}`,
                    {
                        headers: { Authorization:`Bearer ${token}` }
                    }
                );  
                this.setState({
                    messages: res.data
                })      
    
            } catch(e) {
                console.log(e)
            }
        }
    }

    sendMessage = async (message_content) => {
        const connection = this.state.connection;
        const messageDto = {
            senderId: this.state.current_user.id.toString(),
            receiverId: this.state.withUser.id.toString(),
            content: message_content
        }
        //console.log('message dto to send', messageDto);
        try {
            // invoke SendMessage method in the server
            await connection.invoke("SendMessage", messageDto);
        } catch(e) {
            console.log(e);
        }
    }   

    // ket noi signal R
    connectToChatHub = async () => {
        console.log("connect to chat hub")
        let current_user_id = this.state.current_user.id ? this.state.current_user.id : '';
        const connection = this.state.connection;
        // if(!current_user_id) {
        //     current_user_id = '';
        // }
        
        if(connection) {
            console.log("connection exist")
            return;
        }

        try {
          const connection = new HubConnectionBuilder()
          .withUrl(`${this.baseUrl}/chat`)
          .configureLogging(LogLevel.Information)
          .build();
    
          // method to receive message from our server
          connection.on("ShakeHandMessage", (message) => {
            console.log('message received:', message);
            if(current_user_id === '') {
                // current_user_id == 0 means anonymous mode, so message is guid, save the guid to current user id
                localStorage.setItem('anonymous-guid', message)
                this.setState({
                    current_user: {
                        id: message
                    }
                })
            }
          });
          // method to receive message from our server
          connection.on("ReceiveMessage", (message) => {
            //console.log('message received 2:', message);
            if(!this.state.list_users.find(e => e.id === message.senderId)) {
                console.log('reload list users')
                this.getChatUsers();
            }
            // update messages list logic
            let messages = this.state.messages;
            let unseenSenderIds = this.state.unseenSenderIds;
            if(message.senderId === this.state.withUser.id || message.senderId === this.state.current_user.id) {
                messages = [...messages, message]
            }
            // update list unseen logic
            if(message.senderId !== this.state.withUser.id && message.senderId !== this.state.current_user.id) {
                unseenSenderIds = [...unseenSenderIds, message.senderId];
            }
            this.setState({
                messages: messages,
                unseenSenderIds: unseenSenderIds
            })
          });
    
          // connection stop handler
          connection.onclose(e => {
            //setConnection();
            //setMessages([]);
          });
    
          await connection.start();
    
          // invoke JoinRoom method in the server
        //   console.log("invoke connect")
        //   console.log("")
          await connection.invoke("ConnectUserToChatHub", current_user_id.toString())
          this.setState({
            connection: connection
          })
        } catch(e) {
          console.log(e);
        }
    }

    // handle user card click
    userCardClick = (withUser) => {
        this.setState({
            withUser: withUser,
            unseenSenderIds: this.state.unseenSenderIds.filter((item) => item !== withUser.id)
        })
    }

    // handle input user id (anonymous mode)
    inputUserId = (e) => {
        this.setState({
            pickingUserId: e.target.value
        })
    }

    // handle pick user (anonymous mode)
    pickUser = async () => {
        try {
            const pickingUserId = this.state.pickingUserId;
            let res = await axios.get(
                `${this.baseUrl}/api/Users/${pickingUserId}`
            );  
            this.setState({
                withUser: res.data
            })      
        } catch(e) {
            console.log(e)
        }
    }

    // handle cancel conversation (anonymous mode)
    cancelConversation = () => {
        localStorage.removeItem('anonymous-guid');
        this.props.history.push('/');
        // this.setState({
        //     current_user: {},
        //     withUser: {},
        //     pickingUserId: 0
        // })
    }
    
    render() {
        const { current_user, withUser, list_users, messages } = this.state;
        const { pickingUserId } = this.state;
        const { unseenSenderIds } = this.state;
        const anonymous_mode = !localStorage.getItem('user-token');

        return (
            <div className="main-page-wrapper">
                <div className="main-page__left">
                    {
                        anonymous_mode ?
                        <div className="user-picking">
                            <input 
                                placeholder='user id ...' 
                                value={pickingUserId}
                                onChange={this.inputUserId}
                            />
                            <button onClick={this.pickUser}>Pick</button>
                            <br />
                            <br />
                            <button onClick={this.cancelConversation}>End conversation</button>
                        </div>
                        :
                        <div className="user-list">
                            {
                                list_users.map((item, index) => {
                                    return(
                                        <UserCard key={'user-card'+item.id} user={item} userCardClick={this.userCardClick} highlight={unseenSenderIds.includes(item.id)}/>
                                    )
                                })
                            }
                        </div>  
                    }
                </div>
                <div className="main-page__right">
                    {
                        withUser.id !== 0 &&
                        <ChatBox userId={current_user.id} withUser={withUser} messages={messages} sendMessage={this.sendMessage}/>
                    }
                </div>
            </div>
        )
    }
}

export default withRouter(MainPage);