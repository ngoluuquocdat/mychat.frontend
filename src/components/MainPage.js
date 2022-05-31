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
        const list_users = await this.getChatUsers();
        this.setState({
            list_users: list_users
        })   
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

    componentWillUnmount() {
        window.removeEventListener('onbeforeunload', this.onBeforeUnloadHandler);
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
            return [];
        }
        try {
            let res = await axios.get(
                `${this.baseUrl}/api/Users/me/chats-list`,
                {
                    headers: { Authorization:`Bearer ${token}` }
                }
            );  
            // this.setState({
            //     list_users: res.data
            // })    
            return res.data  
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
        console.log('cur user id', current_user_id)
        const connection = this.state.connection;
        
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
          connection.on("ReceiveMessage", async (message) => {
            console.log('message received 2:', message);
            //console.log(`current: ${this.state.current_user.id}, sender: ${message.senderId}`)
            //console.log('current != sender ?', this.state.current_user.id !== message.senderId)

            // update list chat users logic
            let list_users = [];
            if(this.state.list_users.length > 0) {
                list_users=[...this.state.list_users];
                if((this.state.current_user.id !== message.senderId) && (!this.state.list_users.find(e => e.id === message.senderId))) {
                    // console.log(`current: ${this.state.current_user.id}, sender: ${message.senderId}`);
                    // console.log('sender not in list ?', !this.state.list_users.find(e => e.id === message.senderId));
                    console.log('reload list users');
                    list_users = await this.getChatUsers();
                }
            }
            // update messages list logic
            let messages = this.state.messages;
            let unseenSenderIds = this.state.unseenSenderIds;
            if(message.senderId === this.state.withUser.id || message.senderId === this.state.current_user.id) {
                messages = [...messages, message]
                console.log('update list messages')
            }
            // update list unseen logic
            if(message.senderId !== this.state.withUser.id && message.senderId !== this.state.current_user.id) {
                unseenSenderIds = [...unseenSenderIds, message.senderId];
            }
            // move latest unseen user to top
            //let list_users = this.state.list_users;
            if(list_users.length > 0) {
                if(this.state.current_user.id !== message.senderId) {
                    const foundIndex = list_users.findIndex(el => el.id === message.senderId);
                    const latestUser = list_users.splice(foundIndex, 1)[0];
                    list_users.unshift(latestUser);
                }
            }

            this.setState({
                list_users: list_users,
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
          console.log('started connection')
          await connection.invoke("ConnectUserToChatHub", current_user_id.toString());
          console.log('invoked connect')
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

    // delete anonymous conversation
    deleteAnonymousConversation = async(deleteUserId) => {
        const token = localStorage.getItem('user-token');
        if(!token) {     
            return;
        }
        // delete messages in database
        try {
            let res = await axios.delete(
                `${this.baseUrl}/api/Users/me/conversation?withUserId=${deleteUserId}`,
                {
                    headers: { Authorization:`Bearer ${token}` }
                }
            );  
            this.setState({
                list_users: this.state.list_users.filter(el => el.id !== deleteUserId)
            })      
        } catch(e) {
            console.log(e)
            if(e.response.status === 401) {
                this.props.history.push('/');   
            }
        }
        // if chatting with this user, 
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
                                        <UserCard 
                                            key={'user-card'+item.id} 
                                            user={item} 
                                            userCardClick={this.userCardClick} 
                                            highlight={unseenSenderIds.includes(item.id)}
                                            deleteAnonymousConversation={this.deleteAnonymousConversation}
                                            isChattingWith={item.id === withUser.id}
                                        />
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