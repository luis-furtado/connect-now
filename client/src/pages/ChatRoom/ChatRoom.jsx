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
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${API_DNS}/ws/chat/${roomId}/${clientId}`;
    console.log(`url`, url);
    const ws = new WebSocket(url);
    console.log(`ws`, ws);

    ws.onopen = () => {
      ws.send("Connected");
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
    <div className="w-screen h-screen bg-slate-950" style={{ color: `white` }}>
      <h1>Chat</h1>
      <h2>your client id: {clientId} </h2>
      <div className="chat-container">
        <div className="chat">
          {messages.map((value, index) => {
            return (
              <div key={index} className="my-message-container">
                <div className="my-message">
                  <p className="client">
                    client id ({value.clientId}): {value.message}
                  </p>
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
            style={{ color: `black` }}
          ></input>
          <button className="submit-chat" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
