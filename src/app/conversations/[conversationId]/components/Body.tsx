"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";

import useConversation from "@/app/hooks/useConversation";
import { find } from "lodash";

import useWebSocket from "../../../hooks/useWebSocket";
import { wsEvents } from "../../../libs/wsServer";

import { FullMessageType } from "../../../types";
import MessageBox from "./MessageBox";

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body: React.FC<BodyProps> = ({ initialMessages = [] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);
  const { conversationId } = useConversation();
  const { messages: wsMessages, sendMessage } = useWebSocket();

  useEffect(() => {
    axios.post(`/api/conversations/${conversationId}/seen`);
  }, [conversationId]);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const messageHandler = (message: FullMessageType) => {
      axios.post(`/api/conversations/${conversationId}/seen`);
      setMessages((current) => {
        if (find(current, { id: message.id })) {
          return current;
        }
        return [...current, message];
      });
    };

    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) =>
          currentMessage.id === newMessage.id ? newMessage : currentMessage
        )
      );
    };

    // Listen for WebSocket events
    wsMessages.forEach((msg) => {
      if (msg.event === wsEvents.NEW_MESSAGE) {
        messageHandler(msg.data);
      } else if (msg.event === wsEvents.UPDATE_MESSAGE) {
        updateMessageHandler(msg.data);
      }
    });

    return () => {
      // Cleanup WebSocket listeners if needed
    };
  }, [conversationId, wsMessages]);

  const handleSend = (message: string) => {
    sendMessage(wsEvents.NEW_MESSAGE, { text: message });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox isLast={i === messages.length - 1} key={message.id} data={message} />
      ))}
      <div className="pt-1" ref={bottomRef} />
    </div>
  );
};

export default Body;
