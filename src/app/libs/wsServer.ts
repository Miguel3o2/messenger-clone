import { WebSocketServer, WebSocket } from "ws";

export const wsEvents = {
  NEW_MESSAGE: "messages:new",
  UPDATE_MESSAGE: "message:update",
  NEW_CONVERSATION: "conversation:new",
  UPDATE_CONVERSATION: "conversation:update",
  DELETE_CONVERSATION: "conversation:remove",
};

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map<WebSocket, string>(); // Map to store clients

wss.on("connection", (ws) => {
  console.log("🔗 New WebSocket connection established");

  ws.on("message", (data) => {
    try {
      const parsedData = JSON.parse(data.toString());
      console.log("📩 Received data:", parsedData);

      if (parsedData.event && Object.values(wsEvents).includes(parsedData.event)) {
        broadcast(parsedData);
      } else {
        console.log("❌ Unknown event:", parsedData.event);
      }
    } catch (error) {
      console.error("❗ Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("🔌 Client disconnected");
    clients.delete(ws);
  });
});

// Broadcast message to all connected clients
const broadcast = (data: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (error) {
        console.error("❗ Error broadcasting message:", error);
      }
    }
  });
};

console.log("🚀 WebSocket Server running on ws://localhost:8080");

export default wss;
