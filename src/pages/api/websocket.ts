import { Server } from "ws";
import type { NextApiRequest, NextApiResponse } from "next";
import { Socket } from "net";
import { IncomingMessage } from "http";

declare module "http" {
  interface IncomingMessage {
    socket: Socket & { server: { ws?: Server } };
  }
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (res.socket && res.socket.server.ws) {
    console.log("WebSocket server is already running");
    res.end();
    return;
  }

  // Ensure res.socket is not null before accessing it
  if (!res.socket) {
    console.error("Socket is not available");
    res.status(500).end(); // Handle the error appropriately
    return;
  }

  console.log("🚀 Starting WebSocket server");
  const wss = new Server({ noServer: true });
  res.socket.server.ws = wss;

  wss.on("connection", (ws) => {
    console.log("🔗 New client connected");

    ws.on("message", (message) => {
      console.log("📩 Received:", message);
      // Handle incoming messages here
    });

    ws.on("close", () => {
      console.log("🔌 Client disconnected");
    });
  });

  res.end();
};

export default SocketHandler;
