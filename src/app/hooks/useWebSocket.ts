import { useEffect, useState } from "react";

let socket: WebSocket | null = null; // Singleton pattern to avoid multiple connections

const useWebSocket = () => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) {
      socket = new WebSocket("ws://localhost:8080");

      socket.onopen = () => console.log("✅ Connected to WebSocket server");

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📩 New message from server:", data);
        setMessages((prev) => [...prev.slice(-49), data]); // Keep only the last 50 messages
      };

      socket.onerror = (error) => console.error("❗ WebSocket error:", error);

      socket.onclose = () => {
        console.log("❌ Disconnected from WebSocket server");
        socket = null;
      };
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = (event: string, message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event, message }));
    } else {
      console.warn("⚠️ WebSocket not connected");
    }
  };

  return { messages, sendMessage };
};

export default useWebSocket;
