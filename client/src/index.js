import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./pages/Login/Login";
import Rooms from "./pages/Rooms/Rooms";
import ChatRoom from "./pages/ChatRoom/ChatRoom";
import { VideoRoom } from "./pages/VideoRoom/VideoRoom";
import { VideoChatRoom } from "./pages/VideoChatRoom/VideoChatRoom";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AuthContextProvider from "./context/AuthContext";

import "animate.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/rooms",
    element: <Rooms />,
  },
  {
    path: "/chatRoom/:roomId",
    element: <ChatRoom />,
  },
  {
    path: "/videoRoom/:roomId",
    element: <VideoRoom />,
  },
  {
    path: "/videoChat/:roomId",
    element: <VideoChatRoom />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthContextProvider>
    <RouterProvider router={router} />
  </AuthContextProvider>
);
