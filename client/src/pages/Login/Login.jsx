import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const [inputValue, setInputValue] = useState("");
  const [password, setPassword] = useState("");
  const [chatAvailabilty, setChatAvailabilty] = useState(""); // options should be ["chat", "video", "ambos"]
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleInputValue = (e) => setInputValue(e.target.value);
  const handleChatAvailabilty = (e) => setChatAvailabilty(e.target.value);
  const handlePassword = (e) => setPassword(e.target.value);
  const handleButton = () => {
    if (inputValue.length < 4) return;
    if (chatAvailabilty.length === 0) return;
    localStorage.setItem("username", inputValue);
    localStorage.setItem("chatAvailabilty", chatAvailabilty);
    setUser({ username: inputValue, chatAvailabilty: chatAvailabilty });
    navigate("/rooms");
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen flex-col gap-3 bg-slate-950">
      <h1 className="text-3xl font-bold text-white">Insert your username</h1>
      <input
        value={inputValue}
        onChange={handleInputValue}
        placeholder="Nome de usuário"
        type="text"
        className="bg-slate-900 text-lg text-white py-2 px-2 w-[350px] rounded-md"
      />
      <input
        value={password}
        onChange={handlePassword}
        placeholder="Senha"
        type="password"
        className="bg-slate-900 text-lg text-white py-2 px-2 w-[350px] rounded-md"
      />
      <select
        onChange={handleChatAvailabilty}
        placeholder="Disponibilidade"
        type="text"
        className="bg-slate-900 text-lg text-white py-2 px-2 w-[350px] rounded-md"
        value={chatAvailabilty}
      >
        <option value="" disabled>
          Disponibilidade
        </option>
        <option value="chat">Chat</option>
        <option value="video">Video</option>
        <option value="ambos">Os dois</option>
      </select>
      <p className="text-white text-sm">*Voce pode mudar as opções depois</p>
      <button
        onClick={handleButton}
        className="hover:bg-teal-400 focus:bg-teal-400 transition-all duration-100 bg-teal-500 py-2 w-[350px] rounded-md text-white font-medium"
      >
        Login
      </button>
    </div>
  );
}
