from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps user_id to a list of active websocket connections (Sentinels watching)
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"📡 WebSocket Connected: Sentinel watching user {user_id}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        print(f"🔌 WebSocket Disconnected: Sentinel stopped watching user {user_id}")

    async def broadcast_location(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending websocket message: {e}")

manager = ConnectionManager()

@router.websocket("/ws/track/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Wait for any incoming message, though sentinels generally only receive
            data = await websocket.receive_text()
            # If the user themselves connects to broadcast their location
            # they can send JSON which is broadcast to all sentinels
            import json
            try:
                payload = json.loads(data)
                await manager.broadcast_location(user_id, payload)
            except:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@router.post("/api/track/update/{user_id}")
async def update_location(user_id: str, payload: dict):
    # This endpoint allows the user's phone to POST their location
    # and the server will broadcast it via websockets to any Sentinels
    await manager.broadcast_location(user_id, payload)
    return {"status": "broadcasted", "watchers": len(manager.active_connections.get(user_id, []))}
