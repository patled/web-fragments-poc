import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface FragmentCommunicationProps {
  fragmentId: string;
  isActive: boolean;
}

export function FragmentCommunication({
  fragmentId,
  isActive,
}: FragmentCommunicationProps) {
  const [receivedData, setReceivedData] = useState<string | null>(null);
  const [shellData, setShellData] = useState("");
  const channelRef = useRef<BroadcastChannel | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Reset state when fragmentId changes
  useEffect(() => {
    setReceivedData(null);
    setShellData("");
  }, [fragmentId]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Create BroadcastChannel for communication with Fragment
    const channel = new BroadcastChannel("shell-fragment-communication");
    channelRef.current = channel;

    // Receive messages from Fragment
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "fragment-to-shell") {
        setReceivedData(event.data.payload);
      }

      // Keep the host URL in sync with the fragment's internal navigation.
      // This enables deep-linking and back/forward in the shell URL.
      if (
        event.data.type === "fragment-navigate" &&
        event.data.fragmentId === fragmentId &&
        typeof event.data.payload === "string"
      ) {
        const nextUrl = event.data.payload;
        const url = new URL(nextUrl, globalThis.location.origin);
        const currentUrl =
          location.pathname + location.search + location.hash;
        const nextPath = url.pathname + url.search + url.hash;

        if (nextPath !== currentUrl) {
          navigate(nextPath, { replace: false });
        }
      }
    };

    channel.addEventListener("message", handleMessage);

    const handlePopState = () => {
      if (!fragmentId) return;
      const url =
        globalThis.location.pathname +
        globalThis.location.search +
        globalThis.location.hash;
      channel.postMessage({
        type: "shell-navigate",
        fragmentId: fragmentId,
        payload: url,
        timestamp: new Date().toISOString(),
      });
    };

    globalThis.addEventListener("popstate", handlePopState);

    return () => {
      globalThis.removeEventListener("popstate", handlePopState);
      channel.removeEventListener("message", handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [fragmentId, isActive, navigate, location]);

  const sendDataToFragment = () => {
    if (channelRef.current && shellData.trim() && fragmentId) {
      channelRef.current.postMessage({
        type: "shell-to-fragment",
        fragmentId: fragmentId,
        payload: shellData,
        timestamp: new Date().toISOString(),
      });
      setShellData("");
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <section
      style={{
        marginBottom: "2rem",
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
      }}
    >
      <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
        Shell → Fragment Communication ({fragmentId})
      </h2>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          value={shellData}
          onChange={(e) => setShellData(e.target.value)}
          placeholder="Send data to Fragment..."
          style={{
            flex: 1,
            padding: "0.5rem",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "0.875rem",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendDataToFragment();
            }
          }}
        />
        <button
          onClick={sendDataToFragment}
          disabled={!shellData.trim() || !fragmentId}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              shellData.trim() && fragmentId ? "pointer" : "not-allowed",
            opacity: shellData.trim() && fragmentId ? 1 : 0.5,
          }}
        >
          Send
        </button>
      </div>
      {receivedData && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#dbeafe",
            border: "1px solid #93c5fd",
            borderRadius: "4px",
            marginTop: "1rem",
          }}
        >
          <strong>Received from Fragment:</strong>
          <div style={{ marginTop: "0.5rem", color: "#1e40af" }}>
            {receivedData}
          </div>
        </div>
      )}
    </section>
  );
}
