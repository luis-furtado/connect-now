import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import io from "socket.io-client";
import config from "../../config.json";

const socket = io(`${config.API_ROUTE}`);

export default function ChatRoom() {
  const [serverData, setServerData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [visibleArrow, setVisibleArrow] = useState(true);
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getMessages = async () => {
    const { data } = await axios.get(`${config.API_ROUTE}/messages/${roomId}`);
    setServerData(data.messages);
  };
  const postMessages = async () =>
    await axios.post(`${config.API_ROUTE}/messages/${roomId}`, {
      username: user?.username,
      message: inputValue,
    });

  const renderMessage = () => {
    const arr = [];
    serverData.map((data, i) =>
      arr.push([
        <div
          key={i}
          className="animate__animated  animate__fadeInUp md:flex-col md:items-start items-end flex  gap-2 w-full "
        >
          <div className="bg-slate-700 px-5 w-fit max-w-[92%] py-2 rounded-lg">
            <h1 className="font-bold text-teal-400">{data[0].username}</h1>
            <p className="text-white break-words">{data[0].message}</p>
          </div>
          <p className="text-white text-sm">{data[0].time}</p>
        </div>,
      ])
    );

    setMessages(arr);
  };

  const handleScroll = () => {
    const container = document.querySelector("#scroll");
    container.scrollTop = container.scrollHeight - container.clientHeight;
  };

  const handleArrow = () => {
    const container = document.querySelector("#scroll");
    if (
      container.scrollTop <=
      container.scrollHeight - container.clientHeight - 20
    )
      return setVisibleArrow(false);
    setVisibleArrow(true);
  };

  const handleInput = (e) => setInputValue(e.target.value);

  const handleButton = () => {
    if (inputValue.length === 0) return;
    postMessages();
    setInputValue("");
  };

  const handleKeyEnter = (e) => {
    if (inputValue.length === 0) return;
    if (e.key !== "Enter") return;
    postMessages();
    setInputValue("");
  };

  useEffect(() => {
    getMessages();
    socket.on("message", (message) => {
      console.log("received message", message);
      setServerData(message);
    });
    socket.emit("roomEnter", roomId);

    window.addEventListener("beforeunload", () =>
      socket.emit("roomExit", roomId)
    );
    return () => {
      socket.emit("roomExit", roomId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    renderMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverData]);

  if (!user?.username) return navigate("/");

  return (
    <div className="flex items-center justify-center w-screen h-screen flex-col gap-3 bg-slate-950">
      <div className="w-[100%] md:w-[90%] flex items-center  justify-start relative">
        keivn2123123
      </div>
      <div
        onScroll={handleArrow}
        id="scroll"
        className="scroll-smooth w-[60%] md:w-[90%] h-[90%] md:h-[85%] overflow-y-auto overflow-x-hidden gap-2 flex flex-col "
      >
        {messages}
      </div>

      <div className="w-[60%] md:w-[90%] flex items-center  justify-center relative">
        {!visibleArrow && (
          <svg
            onClick={handleScroll}
            className="right-[5%] bottom-[55px] cursor-pointer w-10 hover:animate-bounce fill-teal-400 absolute "
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM13 12V8H11V12H8L12 16L16 12H13Z"></path>
          </svg>
        )}
        <input
          onKeyDown={handleKeyEnter}
          value={inputValue}
          onChange={handleInput}
          placeholder="Type your message here"
          className="bg-slate-900 placeholder:text-slate-600 w-full text-white pl-5 pr-16 py-3 rounded-lg"
          type="text"
        />
        <button
          onClick={handleButton}
          className={`${
            inputValue.length !== 0 && "bg-teal-400 fill-white"
          } transition-all duration-100 flex items-center absolute right-[10px] fill-slate-600 justify-center w-[40px] h-[40px] rounded-md`}
        >
          <svg
            className={`w-7`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path d="M3 13.0001H9V11.0001H3V1.8457C3 1.56956 3.22386 1.3457 3.5 1.3457C3.58425 1.3457 3.66714 1.36699 3.74096 1.4076L22.2034 11.562C22.4454 11.695 22.5337 11.9991 22.4006 12.241C22.3549 12.3241 22.2865 12.3925 22.2034 12.4382L3.74096 22.5925C3.499 22.7256 3.19497 22.6374 3.06189 22.3954C3.02129 22.3216 3 22.2387 3 22.1544V13.0001Z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
