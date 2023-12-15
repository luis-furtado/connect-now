from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # add trabalho-frc.luisfurtadoaraujo.com domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def get():
    return "API está no ar :)"

class ConnectionManager:
    def __init__(self):
        self.socket_connections: List[WebSocket] = []

    def disconnect_from_socket(self, websocket: WebSocket):
        self.socket_connections.remove(websocket)

    async def connect_to_socket(self, websocket: WebSocket):
        await websocket.accept()
        self.socket_connections.append(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.socket_connections:
            await connection.send_text(message)

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

socket = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    now = datetime.now()
    time = now.strftime("%H:%M")
    await socket.connect_to_socket(websocket)

    try:
        while True:
            data = await websocket.receive_text()

            message = {
                "time": time,
                "clientId": user_id,
                "message": data
            }
            await socket.broadcast(json.dumps(message))
            
    except WebSocketDisconnect:
        socket.disconnect_from_socket(websocket)

        message = {
            "time": time,
            "clientId": user_id,
            "message": "Offline"
        }

        await socket.broadcast(json.dumps(message))