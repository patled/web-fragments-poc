import type { ShowcaseMessage, ShowcaseSettings } from "../types";

interface ShowcaseStatusContentProps {
  lastMessage: ShowcaseMessage | null;
  settings: ShowcaseSettings | null;
}

export function ShowcaseStatusContent({
  lastMessage,
  settings,
}: ShowcaseStatusContentProps) {
  const displaySettings = settings || lastMessage?.payload;
  return (
    <>
      <strong style={{ color: "var(--color-text)" }}>Last event:</strong>{" "}
      {lastMessage?.type || "loaded from storage"}
      {displaySettings?.accent ? ` • ${displaySettings.accent}` : ""}
      {displaySettings?.density ? ` • ${displaySettings.density}` : ""}
      {displaySettings?.motion ? ` • ${displaySettings.motion}` : ""}
      {typeof displaySettings?.counter === "number"
        ? ` • counter ${displaySettings.counter}`
        : ""}
      {lastMessage?.timestamp
        ? ` • ${new Date(lastMessage.timestamp).toLocaleTimeString()}`
        : ""}
    </>
  );
}
