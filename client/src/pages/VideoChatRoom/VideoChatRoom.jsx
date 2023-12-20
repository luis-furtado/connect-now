import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { VideoPlayer } from "../VideoRoom/VideoPlayer";
import { API_DNS } from "../../index";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";

const APP_ID = process.env.REACT_APP_AGORA_APP_ID;
const TOKEN = process.env.REACT_APP_AGORA_VIDEO_TOKEN;
const CHANNEL = process.env.REACT_APP_AGORA_VIDEO_CHANNEL;

AgoraRTC.setLogLevel(2);

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

export const VideoChatRoom = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const [chatSocket, setChatSocket] = useState(null);
  const [message, setMessage] = useState([]);
  const [messages, setMessages] = useState([]);
  const { user } = useContext(AuthContext);
  const clientId = user?.userId;

  const { roomId } = useParams();

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
    const url = `${protocol}://${API_DNS}/ws/video-chat/${roomId}/${clientId}`;
    const ws = new WebSocket(url);

    ws.onopen = (event) => {
      ws.send("Connect");
    };

    // recieve message every start page
    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log(messages);
      setMessages((messages) => [...messages, message]);
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
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeave = () => {
    for (let localTrack of localTracks) {
      localTrack.stop();
      localTrack.close();
    }
    client.unpublish().then(() => client.leave());
    chatSocket.close();
  };

  const sendMessage = () => {
    chatSocket.send(message);
    console.log(messages);
    chatSocket.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log(message);
      setMessages((messages) => [...messages, message]);
    };
    setMessage([]);
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", color: `white` }}
      className="w-screen md:h-fit h-screen bg-slate-950"
    >
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
      <div className="chat-container" style={{marginLeft: `30px`}}>
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
          <button className="submit-chat" onClick={sendMessage} style={{ backgroundColor: `blue` }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
