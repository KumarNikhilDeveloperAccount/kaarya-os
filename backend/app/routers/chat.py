from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
from app.services.websocket_manager import manager
import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            # Receive text from client
            data = await websocket.receive_text()
            logger.info(f"Received message from {client_id}: {data}")
            
            # For demonstration in the real-time chat, we will echo the message back
            # and if the message contains a target_id, we would route it there.
            # In a full production system, you'd parse JSON and route accordingly.
            import json
            try:
                payload = json.loads(data)
                target_id = payload.get("target_id")
                message = payload.get("message")
                
                msg_pkg = {
                    "sender_id": client_id,
                    "message": message,
                    "timestamp": str(datetime.datetime.now())
                }
                
                # Send to target if online
                if target_id:
                    await manager.send_personal_json(msg_pkg, target_id)
                
                # Also echo back to sender to confirm receipt (optional)
                await manager.send_personal_json({"status": "delivered", "message": message}, client_id)
                
            except json.JSONDecodeError:
                # Fallback to simple broadcast if not JSON
                await manager.broadcast_json({"sender_id": client_id, "message": data, "timestamp": str(datetime.datetime.now())})
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
        # Notify others (optional)
        # await manager.broadcast_json({"system": True, "message": f"Client #{client_id} left the chat"})
