import { useEffect, useState, useContext } from "react";
import RoomCard from "../../components/RoomCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import config from "../../config.json";
import { AuthContext } from "../../context/AuthContext";

const socket = io(`${config.API_ROUTE}`);

export default function Rooms() {
  const [roomsRender, setRoomRender] = useState([]);
  const [serverData, setServerData] = useState([]);
  const navigate = useNavigate();

  const { user, setUser } = useContext(AuthContext);

  const getRooms = async () => {
    const { data } = await axios.get(`${config.API_ROUTE}/rooms`);
    setServerData(data);
  };

  const handleRenderRooms = async () => {
    const arr = [];
    console.log(user.chatAvailabilty);
    serverData.map((a, i) =>
      arr.push([
        <RoomCard
          key={i}
          online={a.online}
          roomId={a.id}
          roomName={a.name}
          theme={a.tema}
          chatType={a.tipoSala}
          usersAllowed={user?.chatAvailabilty === a.tipoSala}
        />,
      ])
    );
    setRoomRender(arr);
  };

  useEffect(() => {
    getRooms();
    socket.on("rooms", (rooms) => {
      console.log(rooms);
      setServerData(rooms);
    });
  }, []);

  useEffect(() => {
    handleRenderRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverData]);

  const handleBack = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  if (!user) return navigate("/");

  return (
    <div className="flex  items-center justify-center  md:gap-5 lg:py-10 md:py-10  w-screen md:h-fit h-screen flex-col gap-3 bg-slate-950">
      <div className="flex items-center justify-center w-screen flex-col gap-3 bg-slate-950">
        <button
          onClick={handleBack}
          className="hover:bg-teal-400 focus:bg-teal-400 transition-all duration-100 bg-red-500 py-2 w-[350px] rounded-md text-white font-medium"
        >
          Voltar para login
        </button>
      </div>
      <h1 className="text-white text-4xl font-bold">Salas disponíveis</h1>
      <div className="grid md:grid-cols-1 lg:grid-cols-2 grid-cols-3 gap-4">
        {roomsRender}
      </div>
    </div>
  );
}
