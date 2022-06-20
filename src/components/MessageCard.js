import React, { Component } from 'react';
import { ENV } from "../env";
import "../styles/message-card.scss";

class MessageCard extends Component {
    
    baseUrl = ENV.BASE_URL;

    render() {
        const { userId, withUserId } = this.props
        const message = this.props.message;

        return (
            <div className="message-card-wrapper">                             
                <div className={message.senderId == userId ? "message-card--right" : "message-card--left"}>
                    {
                        (message.content && message.content.length > 0) &&
                        <p className="message__content">{message.content}</p>
                    }
                    {
                        (message.imageUrl && message.imageUrl.length > 0) &&
                        <img className='message__image' src={this.baseUrl+message.imageUrl} onClick={() => window.open(this.baseUrl+message.imageUrl, '_blank')}/>
                        //<div className='message__image' style={{backgroundImage: `url('${message.imageUrl}')`}} onClick={() => window.open(message.imageUrl, '_blank')}/>
                    }
                </div>               
            </div>
        )
    }
}

export default MessageCard;