import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_DNS } from "../../index";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

export default function ChatRoom() {
  const { user } = useContext(AuthContext);
  const clientId = user?.userId;

  const [websckt, setWebsckt] = useState();
  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const { roomId } = useParams();

  useEffect(() => {
    if (!clientId) return;
    const url = `ws://${API_DNS}/ws/chat/${roomId}/${clientId}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      ws.send("Connect");
    };

    // recieve message every start page
    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      setMessages((messages) => [...messages, message]);
    };

    setWebsckt(ws);
    //clean up function when we close page
    return () => ws.close();
  }, [user]);

  const sendMessage = () => {
    websckt.send(message);
    // recieve message every send message
    websckt.onmessage = (e) => {
      const message = JSON.parse(e.data);
      setMessages((messages) => [...messages, message]);
    };
    setMessage([]);
  };

  if (!clientId) return null;

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
          })}
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
  );
}
