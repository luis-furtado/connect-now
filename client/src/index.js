import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./pages/Login/Login";
import Rooms from "./pages/Rooms/Rooms";
import ChatRoom from "./pages/ChatRoom/ChatRoom";
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
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthContextProvider>
    <RouterProvider router={router} />
  </AuthContextProvider>
);
