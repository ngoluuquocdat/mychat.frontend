import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Lobby from './components/Lobby';
import Chat from './components/Chat';
import Login from './components/Login';
import TestPage from './components/TestPage';
import MainPage from './components/MainPage';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Component, useState } from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";

class App extends Component {

  // const [connection, setConnection] = useState();
  // const [messages, setMessages] = useState([]);

  // joinRoom = async (user, room) => {
  //   try {
  //     const connection = new HubConnectionBuilder()
  //     .withUrl("https://207f-2402-800-6205-73ac-eddc-47b3-2f3f-faaa.ngrok.io/chat")
  //     .configureLogging(LogLevel.Information)
  //     .build();

  //     // method to receive message from our server
  //     connection.on("ReceiveMessage", (user, message) => {
  //       console.log('message received:', message);
  //       setMessages(messages => [...messages, {user, message}]);
  //     });

  //     // connection stop handler
  //     connection.onclose(e => {
  //       setConnection();
  //       setMessages([]);
  //     });

  //     await connection.start();

  //     // invoke JoinRoom method in the server
  //     await connection.invoke("JoinRoom", {user, room})
  //     setConnection(connection);
  //   } catch(e) {
  //     console.log(e);
  //   }
  // }

  // closeConnection = async () => {
  //   try {
  //     await connection.stop();
  //   } catch(e) {
  //     console.log(e)
  //   }
  // }

  // sendMessage = async(message) => {
  //   try {
  //     // invoke SendMessage method in the server
  //     await connection.invoke("SendMessage", message);
  //   } catch(e) {
  //     console.log(e);
  //   }
  // }

  render() {
    return (
      <BrowserRouter>
        <div className='app'>
          <Switch>
            <Route path="/" exact >
              {/* <Login /> */}
              <TestPage />
            </Route >
            <Route path="/main" exact>      
              <MainPage />
            </Route>
          </Switch>
        {/* <h2>MyChat</h2>
        {
          !connection
          ? <Lobby joinRoom={joinRoom} />
          : <Chat messages={messages} sendMessage={sendMessage}/>
        } */}
          
        </div>
      </BrowserRouter>
    )
  }

}

export default App;
