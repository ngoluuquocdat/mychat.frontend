import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Lobby from './components/Lobby';
import Chat from './components/Chat';
import Login from './components/Login';
import MainPage from './components/MainPage';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useState } from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";

const App = () => {

  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);

  const joinRoom = async (user, room) => {
    try {
      const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7138/chat")
      .configureLogging(LogLevel.Information)
      .build();

      // method to receive message from our server
      connection.on("ReceiveMessage", (user, message) => {
        console.log('message received:', message);
        setMessages(messages => [...messages, {user, message}]);
      });

      // connection stop handler
      connection.onclose(e => {
        setConnection();
        setMessages([]);
      });

      await connection.start();

      // invoke JoinRoom method in the server
      await connection.invoke("JoinRoom", {user, room})
      setConnection(connection);
    } catch(e) {
      console.log(e);
    }
  }

  const closeConnection = async () => {
    try {
      await connection.stop();
    } catch(e) {
      console.log(e)
    }
  }

  const sendMessage = async(message) => {
    try {
      // invoke SendMessage method in the server
      await connection.invoke("SendMessage", message);
    } catch(e) {
      console.log(e);
    }
  }

  return <BrowserRouter>
    <div className='app'>
    <Switch>
      <Route path="/" exact >
        <Login />
      </Route >
      <Route path="/main" exact>
        {/* <h2>MyChat</h2>
        {
          !connection
          ? <Lobby joinRoom={joinRoom} />
          : <Chat messages={messages} sendMessage={sendMessage}/>
        } */}
        <MainPage />
      </Route>
    </Switch>
      
    </div>
  </BrowserRouter>
}

export default App;
