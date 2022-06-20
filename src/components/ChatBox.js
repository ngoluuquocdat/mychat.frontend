import React, { Component } from 'react';
import axios from "axios";
import MessageCard from './MessageCard';
import { BsFillPlusCircleFill, BsCardImage, BsFillStickyFill } from 'react-icons/bs'
import { RiFileGifFill } from 'react-icons/ri';
import { ENV } from "../env";
import ReactLoading from "react-loading";
import "../styles/chat-box.scss";

class ChatBox extends Component {

    state = {
        message_content: '',
        image: { url: '', file: null },
        isSending: false,
        isTyping: true
    }

    baseUrl = ENV.BASE_URL;

    cloudinaryUrl = `https://api.cloudinary.com/v1_1/quocdatcloudinary/image/upload`;
    cloudinaryFolder = 'ChatService';
    cloudinaryApiKey = '637885451257679';
    cloudinaryUploadPreset = 'h7ctajnb'

    // input message
    inputMessage = (e) => {
        if(e.target.value.length === 0) {
            this.props.changeTypingState(false);
        } else {
            const message__content = this.state.message_content;
            if(message__content.length === 0) {
                this.props.changeTypingState(true);
            }
        }
        this.setState({
            message_content: e.target.value
        })
    }

    // on image change
    onImageChange = (event, index) => {
        if (event.target.files && event.target.files[0]) {
            let image = this.state.image;
            image.url = URL.createObjectURL(event.target.files[0]);
            image.file = event.target.files[0];
            this.setState({
                image: image
            });
        }
    }

     // remove image
    handleRemoveImageClick = () => {
        this.setState({
            image: { url: '', file: null }
        })
    }  
    
    // // click send button
    // sendMessage = async () => {
    //     const message_content = this.state.message_content;
    //     let image_url = '';    
    //     const image = this.state.image;

    //     if(message_content.trim().length > 0 || image.file !== null) {
    //         if(image.file !== null) {
    //             this.setState({
    //                 isSending: true
    //             });
    //             // upload file to cloudinary
    //             const formData = new FormData();
    //             formData.append("file", image.file);
    //             formData.append("folder", this.cloudinaryFolder);
    //             formData.append("upload_preset", this.cloudinaryUploadPreset)
    //             // formData.append("api_key", this.cloudinaryApiKey);
    //             let res = await axios.post(
    //                 this.cloudinaryUrl,
    //                 formData
    //             );   
    //             image_url = res.data.url;   
    //         }
    //         this.props.sendMessage(message_content, image_url);
    //         this.setState({
    //             message_content: '',
    //             image: { url: '', file: null }
    //         })
    //         this.setState({
    //             isSending: false
    //         })
    //     }
    // }

    // click send button
    sendMessage = async () => {
        const message_content = this.state.message_content;
        let image_url = '';    
        const image = this.state.image;

        // set isTyping to false
        

        if(message_content.trim().length > 0 || image.file !== null) {
            if(image.file !== null) {
                this.setState({
                    isSending: true
                });
                // upload file to my server
                const formData = new FormData();
                formData.append("image", image.file);
                let res = await axios.post(
                    `${this.baseUrl}/api/Messages/images`,
                    formData
                );   
                image_url = res.data.imageUrl;   
            }
            this.props.sendMessage(message_content, image_url);
            this.setState({
                message_content: '',
                image: { url: '', file: null }
            })
            this.setState({
                isSending: false
            })
        }
    }

    // change typing state
    changeTypingState = (isTyping) => {
        const message__content = this.state.message_content;
        if(isTyping === true && message__content.length === 0) {
            return;
        }
        if(isTyping === false && message__content.length === 0) {
            return;
        }
        this.props.changeTypingState(isTyping);
    }
    
    render() {
        const { userId, withUser, messages, userTyping } = this.props
        const avatarUrl = `url('${withUser.avatarUrl}')`;
        const { message_content, image, isSending } = this.state;

        const showTypingEffect = (userTyping.isTyping === true) && (withUser.id === userTyping.id);

        return (
            <div className="chat-box-wrapper">
                <div className="chat-box__header">
                    {/* <span>{userId}</span>
                    with
                    <span>{withUserId}</span> */}
                    <div className="user-info">
                        <div className="user-avatar" style={{backgroundImage: avatarUrl}}></div>
                        <span className="full-name">{withUser.fullName}</span>
                    </div>
                </div>
                <div className="chat-box__message-list">
                    {
                        showTypingEffect && 
                        <div className="typing-effect">
                            Typing
                            <ReactLoading
                                className="loading-component"
                                type={"bubbles"}
                                color={"#000"}
                                height={30}
                                width={40}
                                delay={5}
                                />
                        </div>
                    }
                    {
                        messages.length > 0 ?
                        messages.slice().reverse().map((item, index) => {
                            return (
                                <MessageCard key={index} userId={userId} withUserId={withUser.id} message={item}/>
                            )
                        })
                        :
                        <span>Nothing here yet! Say something!</span>
                    }                    
                </div>
                <div className="new-message-input">
                    <div className="input-controls">
                        <label className='control-label'>
                            <BsFillPlusCircleFill className='icon'/>
                        </label>
                        <label className='control-label' htmlFor='input-image'>
                            <BsCardImage className='icon' />
                        </label>
                        <label className='control-label'>
                            <BsFillStickyFill className='icon'/>
                        </label>
                        <label className='control-label'>
                            <RiFileGifFill className='icon'/>
                        </label>                                           
                    </div>
                    <input 
                        className='input-field' 
                        placeholder='Your message...'
                        value={message_content}
                        onChange={this.inputMessage}
                        onFocus={() => this.changeTypingState(true)}
                        onBlur={() => this.changeTypingState(false)}
                    />
                    <input
                        className='input-image'
                        id='input-image'
                        type='file'
                        onChange={(event)=>this.onImageChange(event)}
                    />
                    {
                        image.url.length > 0 &&
                        <div className='image-preview' style={{backgroundImage: `url('${image.url}')`}}>
                            <div className='image-overlay'></div>
                            <div className='remove-btn' onClick={this.handleRemoveImageClick}>X</div>
                        </div>
                    }
                    <button className='send-btn' onClick={this.sendMessage}>{isSending ? 'Sending...' : 'Send' }</button>
                </div>
            </div>
        )
    }
}

export default ChatBox;