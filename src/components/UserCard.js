import React, { Component } from 'react';
import "../styles/user-card.scss";

class UserCard extends Component {
    
    userCardClick = () => {
        //const userId = this.props.user.id;
        this.props.userCardClick(this.props.user)
    }
    
    render() {
        const user = this.props.user;
        const avatarUrl = `url('${user.avatarUrl}')`;

        return (
            <div className="user-card-wrapper" onClick={this.userCardClick}>
                <div className="user-card__left">
                    <div className="user-avatar" style={{backgroundImage: avatarUrl}}></div>
                </div>
                <div className="user-card__right">
                    <h3 className="full-name">{user.fullName}</h3>
                    <p className="latest-message">{user.latestMessage}</p>
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