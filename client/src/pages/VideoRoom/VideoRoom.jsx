import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { VideoPlayer } from "./VideoPlayer";
import { API_DNS } from "../../index";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";

const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const TOKEN = process.env.REACT_APP_AGORA_TOKEN;
const CHANNEL = process.env.REACT_APP_AGORA_CHANNEL;

AgoraRTC.setLogLevel(2);

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);
  const clientId = user?.userId;
  const [localTracks, setLocalTracks] = useState([]);
  const [chatSocket, setChatSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleUserJoined = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      setUsers((previousUsers) => [...previousUsers, user]);
    }

    if (mediaType === "audio") {
      user.audioTrack.play();
    }
  };

  const handleUserLeft = (user) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  };

  const { roomId } = useParams();

  useEffect(() => {
    if (!clientId) return;
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);

    client
      .join(APP_ID, CHANNEL, TOKEN, null)
      .then((uid) =>
        Promise.all([AgoraRTC.createMicrophoneAndCameraTracks(), uid])
      )
      .then(([tracks, uid]) => {
        const [audioTrack, videoTrack] = tracks;
        setLocalTracks(tracks);
        setUsers((previousUsers) => [
          ...previousUsers,
          {
            uid,
            videoTrack,
            audioTrack,
          },
        ]);
        client.publish(tracks);
      });

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${protocol}://${API_DNS}/ws/video/${roomId}/${clientId}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      ws.send(`User ${clientId} connected`);
    };

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      setMessages((previousMessages) => [...previousMessages, message]);
    };

    setChatSocket(ws);

    return () => {
      for (let localTrack of localTracks) {
        localTrack.stop();
        localTrack.close();
      }
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.unpublish().then(() => client.leave());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeave = () => {
    for (let localTrack of localTracks) {
      localTrack.stop();
      localTrack.close();
    }
    client.unpublish().then(() => client.leave());
    chatSocket.send(`User ${clientId} disconnected`);
    chatSocket.close();
    window.location.href = "/rooms";
  };

  return (
    <div className="w-screen md:h-fit h-screen bg-slate-950">
      <button
        className="bg-red-500 hover:bg-red-600 focus:bg-red-600 transition-all duration-100 w-[80%] py-2 rounded-md text-white font-medium"
        onClick={handleLeave}
      >
        Sair da Sala
      </button>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "100px",
        }}
      >
        {users.map((user) => (
          <VideoPlayer key={user.uid} user={user} />
        ))}
      </div>
      <div className="chat-container">
        <div
          className="chat"
          style={{
            color: `white`,
          }}
        >
          {messages.map((value, index) => {
            if (value.clientId === clientId) {
              return (
                <div key={index} className="my-message-container">
                  <div className="my-message">
                    <p className="client">
                      client id({clientId}): {value.message}
                    </p>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={index} className="another-message-container">
                  <div className="another-message">
                    <p className="client" style={{ color: `white` }}>
                      client id({clientId}): {value.message}
                    </p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};
