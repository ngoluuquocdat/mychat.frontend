import React, { Component } from 'react';
import UserCard from './UserCard';
import ChatBox from './ChatBox';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import "../styles/main-page.scss";

class MainPage extends Component {

    state = {
        withUserId: 0,
        current_user: {},
        list_users: [],
        messages: [],
        connection: null
    }

    async componentDidMount() {
        console.log('run did mount')
        // call api get user info
        await this.getUserInfo();
    }

    async componentDidUpdate(prevProps, prevState) {
        // only run if current_user change
        if(prevState.current_user !== this.state.current_user) {
            // connect user to chat hub
            await this.connectToChatHub();
        }
    }

    getUserInfo = async () => {
        this.setState({
            current_user: {
                id: 1
            }
        })
    }

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
    
    // ket noi signal r o day

    // goi api get user info: id cac thu, ...


    // handle user card click
    userCardClick = (withUserId) => {
        this.setState({
            withUserId: withUserId
        })
    }
    
    render() {
        const { withUserId } = this.state;

        return (
            <div className="main-page-wrapper">
                <div className="main-page__left">
                    <div className="user-list">
                        {
                            list_users_temp.map((item, index) => {
                                return(
                                    <UserCard key={item.id} user={item} userCardClick={this.userCardClick}/>
                                )
                            })
                        }
                    </div>  
                </div>
                <div className="main-page__right">
                    {
                        withUserId !== 0 &&
                        <ChatBox userId={user_me.id} withUserId={withUserId} />
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