import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE } from "./config";

/**
 * WebSocket за лайв чат – при ново съобщение/отговор зареждаме съобщенията.
 * Работи с localhost и с Render (production).
 */
export function useWebSocketMessages(
  userEmail: string | null,
  onNewMessage: () => void,
  enabled: boolean
) {
  const onNewMessageRef = useRef(onNewMessage);
  onNewMessageRef.current = onNewMessage;

  useEffect(() => {
    if (!enabled || !userEmail) return;

    const wsUrl = API_BASE.replace(/\/$/, "") + "/ws";
    const topicEmail = userEmail.replace(/@/g, "_at_").replace(/\./g, "_");
    const topic = `/topic/messages/${topicEmail}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe(topic, () => onNewMessageRef.current());
      },
      onStompError: (frame) => {
        console.warn("WebSocket STOMP error:", frame.headers?.message);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userEmail, enabled]);
}
