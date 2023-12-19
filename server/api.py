from typing import List, Tuple
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel
from fastapi.responses import JSONResponse

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
    users), "roomId": 1, "roomName": "Room 1", "theme": "Politica", "chatType": "chat"},]


@app.get("/rooms", response_model=List[Room])
def get_rooms():
    return rooms


class ConnectionManager:

    def __init__(self) -> None:
        self.active_connections: List[Tuple[WebSocket, str]] = []

    async def connect(self, websocket: WebSocket, room: str):
        await websocket.accept()
        self.active_connections.append([websocket, room])

    def disconnect(self, websocket: WebSocket):
        self.active_connections = [
            connection for connection in self.active_connections if connection[0] != websocket]

    async def broadcast(self, message: str, room: str):
        for connection in self.active_connections:
            if connection[1] == room:
                await connection[0].send_text(message)


manager = ConnectionManager()


def verify_user(username: str):
    for user in users:
        if user["username"] == username:
            return True
    return False


def getClientByUserName(username: str):
    for user in users:
        if user["username"] == username:
            return user
    return None


def getClientById(client_id: int):
    for user in users:
        if user["client_id"] == client_id:
            return user
    return None


@app.get("/", include_in_schema=False)
def Home():
    return "Welcome home"


# USUARIOS
@app.get("/users")
def Users():
    return JSONResponse(content={'users': users}, status_code=200)

@app.post("/login/{username}")
def login(username: str):
    userObject = {"username": username,
                  "status": "Online", "client_id": len(users)+1}
    users.append(userObject)
    return JSONResponse(content=userObject, status_code=200)


# SALAS
@app.websocket("/ws/chat/{room}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room: str, client_id: int):
    await manager.connect(websocket, room)
    client = getClientById(client_id)
    client = {"client_id": client_id, "status": "Online"}
    users.append(client)
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    try:
        while True:
            data = await websocket.receive_text()
            message = {"time": current_time,
                       "clientId": client_id, "message": data}
            await manager.broadcast(json.dumps(message), room)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        users.remove(client)
        users.append({"client_id": client_id, "status": "Status"})
        message = {"time": current_time,
                   "clientId": client_id, "message": "Offline"}
        await manager.broadcast(json.dumps(message), room)


@app.websocket("/ws/video/{room}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room: int, client_id: str):
    await manager.connect(websocket, room)
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
            await manager.broadcast(json.dumps(message), room)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        users.remove(client)
        users.append({"client_id": client_id, "status": "Status"})
        message = {"time": current_time,
                   "clientId": client_id, "message": "Offline"}
        await manager.broadcast(json.dumps(message), room)


@app.websocket("/ws/video-chat/{room}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room: int, client_id: int):
    await manager.connect(websocket, room)  
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
            await manager.broadcast(json.dumps(message), room)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        users.remove(client)
        users.append({"client_id": client_id, "status": "Status"})
        message = {"time": current_time,
                   "clientId": client_id, "message": "Offline"}
        await manager.broadcast(json.dumps(message), room)
