from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel

import json

app = FastAPI()
users = []
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Define your room model
class Room(BaseModel):
    key: int
    online: bool
    roomId: int
    roomName: str
    theme: str
    chatType: str
    # usersAllowed: bool  # This should be handled differently


# Samp
rooms = [{"key": 1, "online": len(
    users), "roomId": 1, "roomName": "Room 1", "theme": "Theme1", "chatType": "Type1"}]


@app.get("/rooms", response_model=List[Room])
def get_rooms():
    return rooms


class ConnectionManager:

    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.get("/")
def Home():
    return "Welcome home"

# Usuarios


@app.get("/users")
def Users():
    return json.dumps(users)


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    client = {"client_id": client_id, "status": "Online"}
    users.append(client)
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    try:
        while True:
            data = await websocket.receive_text()
            # await manager.send_personal_message(f"You wrote: {data}", websocket)
            message = {"time": current_time,
                       "clientId": client_id, "message": data}
            await manager.broadcast(json.dumps(message))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        users.remove(client)
        users.append({"client_id": client_id, "status": "Status"})
        message = {"time": current_time,
                   "clientId": client_id, "message": "Offline"}
        await manager.broadcast(json.dumps(message))


@app.websocket("/ws/video/{room}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room: int, client_id: int):
    await manager.connect(websocket)
    client = {"client_id": client_id, "status": "Online", "room": room}
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    try:
        while True:
            data = await websocket.receive_text()
            message = {"time": current_time, "clientId": client_id,
                       "message": data, "room": room}
            print(message)
            
            await manager.broadcast(json.dumps(message))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        users.remove(client)
        users.append({"client_id": client_id, "status": "Status"})
        message = {"time": current_time, "clientId": client_id,
                   "message": "Offline", "room": room}
        print(message)
        await manager.broadcast(json.dumps(message))


@app.websocket("/ws/video-chat/{room}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room: int, client_id: int):
    await manager.connect(websocket)
    client = {"client_id": client_id, "status": "Online", "room": room}
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    try:
        while True:
            data = await websocket.receive_text()
            message = {"time": current_time, "clientId": client_id,
                       "message": data, "room": room}
            print(message)
            
            await manager.broadcast(json.dumps(message))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        users.remove(client)
        users.append({"client_id": client_id, "status": "Status"})
        message = {"time": current_time, "clientId": client_id,
                   "message": "Offline", "room": room}
        print(message)
        await manager.broadcast(json.dumps(message))
