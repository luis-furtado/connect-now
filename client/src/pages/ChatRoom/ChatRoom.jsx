import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";


// const socket = io(`${config.API_ROUTE}`);


export default function ChatRoom(){
// add random cliend id by date time
const [clientId, setClientId] = useState(
  Math.floor(new Date().getTime() / 1000)
);
const [websckt, setWebsckt] = useState();
const [message, setMessage] = useState([]);
const [messages, setMessages] = useState([]);
const {sala} = useParams();

useEffect(() => {
  const url = `ws://localhost:8000/ws/${sala}/${clientId}`;
  const ws = new WebSocket(url);

  ws.onopen = (event) => {
    ws.send("Connect");
  };

  // recieve message every start page
  ws.onmessage = (e) => {
    const message = JSON.parse(e.data);
    setMessages(messages=>[...messages, message]);
  };

  setWebsckt(ws);
  //clean up function when we close page
  return () => ws.close();
}, []);

const sendMessage = () => {
  websckt.send(message);
  // recieve message every send message
  websckt.onmessage = (e) => {
    const message = JSON.parse(e.data);
    setMessages(messages=>[...messages, message]);
  };
  setMessage([]);
};


return (
    <div className="container">
      <h1>Chat</h1>
      <h2>your client id: {clientId} </h2>
      <div className="chat-container">
        <div className="chat">
          {messages.map((value, index) => {
              return (
                <div key={index} className="my-message-container">
                <div className="my-message">
                  <p className="client">client id : {value.clientId}</p>
                  <p className="message">{value.message}</p>
                </div>
              </div>
              );
            }
          )}
        </div>
        <div className="input-chat-container">
        <input
            className="input-chat"
            type="text"
            placeholder="Chat message ..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          ></input>
          <button className="submit-chat" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
