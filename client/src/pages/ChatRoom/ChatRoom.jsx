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
const [visibleArrow, setVisibleArrow] = useState(true);

useEffect(() => {
  const url = "ws://localhost:8000/ws/" + clientId;
  const ws = new WebSocket(url);

  ws.onopen = (event) => {
    ws.send("Connect");
  };

  // recieve message every start page
  ws.onmessage = (e) => {
    const message = JSON.parse(e.data);
    setMessages([...messages, message]);
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
    setMessages([...messages, message]);
  };
  setMessage([]);
};
// const getMessages = async () => {
//   const { data } = await axios.get(`${config.API_ROUTE}/messages/${roomId}`);
//   setServerData(data.messages);
// };
// const postMessages = async () =>
//   await axios.post(`${config.API_ROUTE}/messages/${roomId}`, {
//     username: user?.username,
//     message: inputValue,
//   });

// const renderMessage = () => {
//   const arr = [];
//   serverData.map((data, i) =>
//     arr.push([
//       <div
//         key={i}
//         className="animate__animated  animate__fadeInUp md:flex-col md:items-start items-end flex  gap-2 w-full "
//       >
//         <div className="bg-slate-700 px-5 w-fit max-w-[92%] py-2 rounded-lg">
//           <h1 className="font-bold text-teal-400">{data[0].username}</h1>
//           <p className="text-white break-words">{data[0].message}</p>
//         </div>
//         <p className="text-white text-sm">{data[0].time}</p>
//       </div>,
//     ])
//   );

//   setMessages(arr);
// };

const handleArrow = () => {
  const container = document.querySelector("#scroll");
  if (
    container.scrollTop <=
    container.scrollHeight - container.clientHeight - 20
  )
    return setVisibleArrow(false);
  setVisibleArrow(true);
};

return (
    <div className="container">
      <h1>Chat</h1>
      <h2>your client id: {clientId} </h2>
      <div className="chat-container">
        <div className="chat">
          {messages.map((value, index) => {
            if (value.clientId === clientId) {
              return (
                <div key={index} className="my-message-container">
                <div className="my-message">
                  <p className="client">client id : {clientId}</p>
                  <p className="message">{value.message}</p>
                </div>
              </div>
              );
            } else {
              return (
                <div key={index} className="another-message-container">
                  <div className="another-message">
                    <p className="client">client id : {clientId}</p>
                    <p className="message">{value.message}</p>
                  </div>
                </div>
              );
            }
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
  )
}
