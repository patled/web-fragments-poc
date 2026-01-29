import { useEffect, useState } from "react";
import { ANGULAR_WIDGET_CHANNEL } from "../constants";

export function useAngularWidgetMessage() {
  const [message, setMessage] = useState<{
    type?: string;
    timestamp?: string;
    payload?: { clickCount?: number };
  } | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(ANGULAR_WIDGET_CHANNEL);
    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type) return;
      setMessage(event.data);
    };
    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  return message;
}
