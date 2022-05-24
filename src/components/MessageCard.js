import React, { Component } from 'react';
import "../styles/message-card.scss";

class MessageCard extends Component {
    
    
    render() {
        const { userId, withUserId } = this.props
        const message = this.props.message;

        return (
            <div className="message-card-wrapper">
               <div className={message.senderId == userId ? "message-card--right" : "message-card--left"}>
                    <p className="message__content">{message.content}</p>
               </div>
            </div>
        )
    }
}

export default MessageCard;