from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection",
            "message": "Connected to Team Builder",
            "timestamp": datetime.utcnow().isoformat()
        }, user_id)
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    async def broadcast(self, message: dict):
        for user_id in self.active_connections:
            await self.send_personal_message(message, user_id)
    
    async def notify_match(self, user_id: str, project_title: str, match_score: float):
        await self.send_personal_message({
            "type": "match_notification",
            "project": project_title,
            "score": match_score,
            "message": f"You're a {match_score}% match for {project_title}!",
            "timestamp": datetime.utcnow().isoformat()
        }, user_id)
    
    async def notify_team_invitation(self, user_id: str, project_title: str, inviter_name: str):
        await self.send_personal_message({
            "type": "team_invitation",
            "project": project_title,
            "inviter": inviter_name,
            "message": f"{inviter_name} invited you to join {project_title}",
            "timestamp": datetime.utcnow().isoformat()
        }, user_id)

manager = ConnectionManager()
