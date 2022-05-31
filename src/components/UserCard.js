import React, { Component } from 'react';
import "../styles/user-card.scss";

class UserCard extends Component {

    // state = {
    //     highlight: this.props.highlight
    // }
    
    userCardClick = () => {
        //const userId = this.props.user.id;
        this.props.userCardClick(this.props.user)
    }

    deleteAnonymousConversation = (event, deleteUserId) => {
        event.stopPropagation();
        this.props.deleteAnonymousConversation(deleteUserId)
    }
    
    render() {
        const user = this.props.user;
        const isChattingWith = this.props.isChattingWith;
        const avatarUrl = `url('${user.avatarUrl}')`;
        const highlight = this.props.highlight;

        return (
            <div className="user-card-wrapper" onClick={this.userCardClick}>
                <div className="user-card__left">
                    <div className="user-avatar" style={{backgroundImage: avatarUrl}}></div>
                </div>
                <div className="user-card__right">
                    <h3 className={highlight ? "full-name--bold" : "full-name"}>{user.fullName}</h3>
                    <p className="latest-message">{user.latestMessage}</p>
                    {
                        user.isConversationDeletable && !isChattingWith &&
                        <button className='btn-delete' onClick={(event) => this.deleteAnonymousConversation(event, user.id)}>DELETE</button>
                    }
                </div>
            </div>
        )
    }
}

// const user_temp = {
//     id: 1, 
//     fullName: 'Ngo Luu Quoc Dat',
//     avatarUrl: 'https://res.cloudinary.com/quocdatcloudinary/image/upload/v1653112714/ChatService/dat_fxyboy.jpg',
//     latestMessage: 'hello cong tai.'
// }

export default UserCard;