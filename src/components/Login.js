import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import axios from 'axios';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineCloseCircle } from "react-icons/ai";
import { ENV } from "../env";
import "../styles/login-page.scss";

class Login extends Component {
    state = {
        username: '',
        password: '',
        showPassword: false,
        isUsernameValid: true,
        isPasswordValid: true,
        accountValid: true,
        isCreating: false
    };

    baseUrl = ENV.BASE_URL;

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    // toggle show password
    handleTogglePassword = (event) => {
        event.stopPropagation();
        const showPassword = this.state.showPassword;
        this.setState({
            showPassword: !showPassword
        })
    }

    // handle username input
    handleUsernameInput = (event) => {
        this.setState({
            username: event.target.value,
            isUsernameValid: event.target.value.length > 0
        })
    }

    // handle password input
    handlePasswordInput = (event) => {
        this.setState({
            password: event.target.value,
            isPasswordValid: event.target.value.length > 0
        })
    }

    // handle login 
    handleLogin = async () => {
        let {username, password} = this.state;
        username = username.trim();

        this.setState({
            isCreating: true
        })

        const data = {
            username: username,
            password: password
        }

        try {
            let res = await axios.post(
              `${this.baseUrl}/api/Users/login`,
              data
            );          
            console.log(res);
            const user = {
                username: res.data.username,
                fullName: res.data.fullName,
                phone: res.data.phone,
                email: res.data.email,
                avatarUrl: res.data.avatarUrl,
                providerId: res.data.providerId
            }
            // set token in local storage
            localStorage.setItem('user-token', res.data.token)
            
            this.props.history.push('/main');       
        } catch (error) {
            if (!error.response) {
              console.log(error)
              return;
            }
            if (error.response.status === 400) {
              console.log(error)
            }
            if (error.response.status === 401) {
              console.log(error);
              this.setState({
                accountValid: false
            })
            }
        } finally {
            setTimeout(() => {
                this.setState({
                    isCreating: false,
                });
            }, 1000);
        }  
    }


    render() {
        const { username, password } = this.state;
        const { showPassword, isUsernameValid, isPasswordValid, accountValid } = this.state;
        const { isCreating } = this.state;
        return (
            <div className="login-page-container">
                <div className="login-form">
                    <h3 className="form-header">Login</h3>
                    {
                        !accountValid &&
                        <div className="account-valid">
                            <AiOutlineCloseCircle />
                            <span>Your Username or Password is invalid, please try again.</span>
                        </div>
                    }
                    <div className={isUsernameValid ? "form-group" : "form-group invalid"}>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Username"
                                name="username"
                                value={username}
                                onChange={this.handleUsernameInput}
                            />
                    </div>                        
                    {
                        !isUsernameValid &&
                        <div className="valid-warning">
                            Please fill in this field.                     
                        </div>
                    }           
                    <div className={isPasswordValid ? "form-group" : "form-group invalid"}>
                        {
                            showPassword ? 
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Password"
                                name="password"
                                value={password}
                                onChange={this.handlePasswordInput}
                            />
                            :
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Password"
                                name="password"
                                value={password}
                                onChange={this.handlePasswordInput}
                            />
                        }
                        <button className="show-hide-btn" onClick={this.handleTogglePassword}>
                            {
                                showPassword ? 
                                <AiOutlineEyeInvisible />
                                :
                                <AiOutlineEye />
                            }
                        </button>
                    </div>
                    {
                        !isPasswordValid &&
                        <div className="valid-warning">
                            Please fill in this field.                     
                        </div>
                    }  
                    <button 
                    className={
                        (username != '' && password != '' && isUsernameValid && isPasswordValid) ? 
                        "login-btn" : "login-btn disabled"
                    }
                    disabled={!(username != '' && password != '' && isUsernameValid && isPasswordValid)}
                    onClick={this.handleLogin}
                    >
                        Login
                    </button>
                    <div className="form-footer">
                        New to Happy Vacation?
                        <Link className="link" to="/main">Go anonymously</Link>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        reduxData: state
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        saveUserRedux: (user) => dispatch({type: 'SAVE_USER', payload: user})
    }
}

export default withRouter(Login);