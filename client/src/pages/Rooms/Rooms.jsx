import { useContext } from "react";
import RoomCard from "../../components/RoomCard";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Rooms() {
  const navigate = useNavigate();

  const { user, setUser } = useContext(AuthContext);

  const handleBack = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const handleChat = () => {
    navigate("/chatRoom/1");
  };

  const handleVideoCall = () => {
    navigate("/videoRoom/1");
  };

  const handleVideoChat = () => {
    navigate("/videoChat/1");
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
        <RoomCard
          roomName={"Chat"}
          roomId={1}
          theme={"Política"}
          chatType={"chat"}
          usersAllowed={user.chatAvailabilty === "chat"}
          handleEnterRoom={handleChat}
        />
        <RoomCard
          roomName={"Video"}
          roomId={2}
          theme={"Futebol"}
          chatType={"video"}
          usersAllowed={user.chatAvailabilty === "video"}
          handleEnterRoom={handleVideoCall}
        />
        <RoomCard
          roomName={"Video Chat"}
          roomId={3}
          theme={"Música"}
          chatType={"video chat"}
          usersAllowed={user.chatAvailabilty === "ambos"}
          handleEnterRoom={handleVideoChat}
        />
      </div>
    </div>
  );
}
