import React, { Component } from 'react';
import "../styles/message-card.scss";

class MessageCard extends Component {
    
    
    render() {
        const { userId, withUserId } = this.props
        const message = this.props.message;

        return (
            <div className="message-card-wrapper">                             
                <div className={message.senderId == userId ? "message-card--right" : "message-card--left"}>
                    {
                        message.content.length > 0 &&
                        <p className="message__content">{message.content}</p>
                    }
                    {
                        message.imageUrl.length > 0 &&
                        <img className='message__image' src={message.imageUrl} onClick={() => window.open(message.imageUrl, '_blank')}/>
                    }
                </div>               
            </div>
        )
    }
}

export default MessageCard;