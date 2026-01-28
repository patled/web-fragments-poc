import { useFragmentHealthCheck } from "../../hooks/useFragmentHealthCheck";
import { styles } from "./styles";
import { ASSIGNMENTS_FRAGMENT_ID } from "./types";

const ASSIGNMENTS_FRAGMENT_SRC = "/assignments/";

interface AssignmentsPanelProps {
  projectId: string;
  onClose: () => void;
}

export function AssignmentsPanel({
  projectId,
  onClose,
}: AssignmentsPanelProps) {
  const fragmentAvailable = useFragmentHealthCheck(
    ASSIGNMENTS_FRAGMENT_SRC,
    ASSIGNMENTS_FRAGMENT_ID,
    {
      onError: () => {
        console.warn("Assignments fragment not available");
      },
    },
  );

  return (
    <div style={styles.assignmentsPanel}>
      <div style={styles.assignmentsPanelHeader}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Assignments</h2>
        </div>
        <button onClick={onClose} style={styles.buttonClose}>
          Close
        </button>
      </div>
      <div style={styles.assignmentsPanelContent}>
        {fragmentAvailable === false && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--color-text-secondary)",
            }}
          >
            <div style={{ marginBottom: "0.5rem" }}>⚠️</div>
            <div>Assignments fragment not available</div>
          </div>
        )}
        {fragmentAvailable !== false && (
          <web-fragment
            key={`${projectId}-assignments`}
            fragment-id={ASSIGNMENTS_FRAGMENT_ID}
          ></web-fragment>
        )}
      </div>
    </div>
  );
}
