
import React, { Component } from 'react';
import MessageCard from './MessageCard';
import "../styles/chat-box.scss";

class ChatBox extends Component {
    
    // call api get user info va messages


    
    render() {
        const avatarUrl = `url('${user.avatarUrl}')`;

        const { userId, withUserId } = this.props
        return (
            <div className="chat-box-wrapper">
                <div className="chat-box__header">
                    {/* <span>{userId}</span>
                    with
                    <span>{withUserId}</span> */}
                    <div className="user-info">
                        <div className="user-avatar" style={{backgroundImage: avatarUrl}}></div>
                        <span className="full-name">{user.fullName}</span>
                    </div>
                </div>
                <div className="chat-box__message-list">
                    {
                        messages_temp.map(item => {
                            return (
                                <MessageCard key={item.id} userId={userId} withUserId={withUserId} message={item}/>
                            )
                        })
                    }
                </div>
                <div className="new-message-input">
                    <div className="input-controls">

                    </div>
                    <input className='input-field' placeholder='Your message...'/>
                    <button className='send-btn'>Send</button>
                </div>
            </div>
        )
    }
}

const user = {
        id: 1, 
        fullName: 'Ngo Luu Quoc Dat',
        avatarUrl: 'https://res.cloudinary.com/quocdatcloudinary/image/upload/v1653112714/ChatService/dat_fxyboy.jpg',
        latestMessage: 'hello cong tai.'
    }

const messages_temp = [
    {
        id: 1,
        senderId: 1,
        receiverId: 2,
        content: "Hello, you are you?"
    },
    {
        id: 2,
        senderId: 2,
        receiverId: 1,
        content: "I'm fine, thanks. How about you?"
    },
    {
        id: 3,
        senderId: 1,
        receiverId: 2,
        content: "I'm fine, thanks. How about you?"
    }
]

export default ChatBox;