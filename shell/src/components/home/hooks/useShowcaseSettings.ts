import { useEffect, useState } from "react";
import { STORAGE_KEY, SHOWCASE_CHANNEL } from "../constants";
import type { ShowcaseMessage, ShowcaseSettings } from "../types";

export function useShowcaseSettings() {
  const [lastMessage, setLastMessage] = useState<ShowcaseMessage | null>(null);
  const [settings, setSettings] = useState<ShowcaseSettings | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored) as ShowcaseSettings);
      }
    } catch (error) {
      console.warn("Failed to load showcase settings from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel(SHOWCASE_CHANNEL);
    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type) return;
      const message = event.data as ShowcaseMessage;
      setLastMessage(message);

      if (message.type === "showcase-settings" && message.payload) {
        const newSettings: ShowcaseSettings = {
          accent: message.payload.accent,
          density: message.payload.density,
          motion: message.payload.motion,
          counter: message.payload.counter,
        };
        setSettings(newSettings);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
          console.warn(
            "Failed to save showcase settings to localStorage",
            error,
          );
        }
      }
    };
    channel.addEventListener("message", handleMessage);
    return () => {
      channel.removeEventListener("message", handleMessage);
      channel.close();
    };
  }, []);

  return { lastMessage, settings };
}
