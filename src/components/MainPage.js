import React, { Component } from 'react';
import UserCard from './UserCard';
import ChatBox from './ChatBox';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import axios from "axios";
import "../styles/main-page.scss";

class MainPage extends Component {

    state = {
        withUser: 0,
        current_user: {},
        list_users: [],
        messages: [],
        connection: null
    }

    baseUrl = "https://localhost:7138";

    async componentDidMount() {
        console.log('run did mount')
        // call api get user info
        await this.getUserInfo();
        // call api get list users
        await this.getUsers();
    }

    async componentDidUpdate(prevProps, prevState) {
        // connect signal R again if current_user change
        if(prevState.current_user.id !== this.state.current_user.id) {
            // connect user to chat hub
            await this.connectToChatHub();
        }
        // get list messages
        if(prevState.withUser.id !== this.state.withUser.id) {
            await this.getMessages();
        }
    }

    getUserInfo = async () => {
        const token = localStorage.getItem('user-token');
        if(!token) {
            this.props.history.push('/');     
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

    getMessages = async () => {
        const token = localStorage.getItem('user-token');
        if(!token) {
            return;
        }
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

    sendMessage = async (message_content) => {
        const connection = this.state.connection;
        const messageDto = {
            senderId: this.state.current_user.id,
            receiverId: this.state.withUser.id,
            content: message_content
        }
        try {
            // invoke SendMessage method in the server
            await connection.invoke("SendMessage", messageDto);
        } catch(e) {
            console.log(e);
        }
    }   

    // ket noi signal R
    connectToChatHub = async () => {
        const current_user_id = this.state.current_user.id;
        const connection = this.state.connection;
        if(!current_user_id) {
            return;
        }
        
        if(connection) {
            return;
        }

        try {
          const connection = new HubConnectionBuilder()
          .withUrl("https://localhost:7138/chat")
          .configureLogging(LogLevel.Information)
          .build();
    
          // method to receive message from our server
          connection.on("ShakeHandMessage", (message) => {
            console.log('message received:', message);
            //setMessages(messages => [...messages, {user, message}]);
          });
          // method to receive message from our server
          connection.on("ReceiveMessage", (message) => {
            console.log('message received 2:', message);
            this.setState({
                messages: [...this.state.messages, message]
            })
            //setMessages(messages => [...messages, {user, message}]);
          });
    
          // connection stop handler
          connection.onclose(e => {
            //setConnection();
            //setMessages([]);
          });
    
          await connection.start();
    
          // invoke JoinRoom method in the server
          await connection.invoke("ConnectUserToChatHub", current_user_id)
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
            withUser: withUser
        })
    }
    
    render() {
        const { current_user, withUser, list_users, messages } = this.state;

        return (
            <div className="main-page-wrapper">
                <div className="main-page__left">
                    <div className="user-list">
                        {
                            list_users.map((item, index) => {
                                return(
                                    <UserCard key={'user-card'+item.id} user={item} userCardClick={this.userCardClick}/>
                                )
                            })
                        }
                    </div>  
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

const user_me = {
    id: 1, 
    fullName: 'Ngo Luu Quoc Dat',
    avatarUrl: 'https://res.cloudinary.com/quocdatcloudinary/image/upload/v1653112714/ChatService/dat_fxyboy.jpg',
    latestMessage: 'hello cong tai.'
}

const list_users_temp = [
    {
        id: 1, 
        fullName: 'Ngo Luu Quoc Dat',
        avatarUrl: 'https://res.cloudinary.com/quocdatcloudinary/image/upload/v1653112714/ChatService/dat_fxyboy.jpg',
        latestMessage: 'hello cong tai.'
    },
    {
        id: 2, 
        fullName: 'Dinh Cong Tai',
        avatarUrl: 'https://res.cloudinary.com/quocdatcloudinary/image/upload/v1653112714/ChatService/dat_fxyboy.jpg',
        latestMessage: 'Same as always.'
    }
]

export default MainPage;