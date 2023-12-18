import React, { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { VideoPlayer } from "../VideoRoom/VideoPlayer";

const APP_ID = "0294aae3dd5441f7b7a99385af5e556b";
const TOKEN =
  "007eJxTYOCSK/fi38ipJHd2n9Vd7WneJb+ybBdWf7vX/8roTYG2xzQFBgMjS5PExFTjlBRTExPDNPMk80RLS2ML08Q001RTU7Mkz4z61IZARgbllYuYGRkgEMRnYUgrSjZkYAAA1M0d3w==";
const CHANNEL = "frc1";

AgoraRTC.setLogLevel(2);

const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

export const VideoChatRoom = () => {
  const [users, setUsers] = useState([]);
  const [clientId] = useState(Math.floor(new Date().getTime() / 1000));
  const [localTracks, setLocalTracks] = useState([]);
  const [chatSocket, setChatSocket] = useState(null);
  const [message, setMessage] = useState([]);
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

  useEffect(() => {
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

    const ws = new WebSocket(`ws://localhost:8000/ws/video-chat/1/${clientId}`);

    ws.onopen = () => {
      ws.send("Connect");
    };

    // recieve message every start page
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

  const sendMessage = () => {
    chatSocket.send(message);
    setMessage("");
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 200px)",
        }}
      >
        {users.map((user) => (
          <VideoPlayer key={user.uid} user={user} />
        ))}
      </div>
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
  );
};
