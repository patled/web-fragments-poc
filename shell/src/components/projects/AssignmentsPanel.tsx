import { ASSIGNMENTS_FRAGMENT_ID } from "./types";
import { styles } from "./styles";

interface AssignmentsPanelProps {
  projectId: string;
  onClose: () => void;
}

export function AssignmentsPanel({
  projectId,
  onClose,
}: AssignmentsPanelProps) {
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
        <web-fragment
          key={`${projectId}-assignments`}
          fragment-id={ASSIGNMENTS_FRAGMENT_ID}
        ></web-fragment>
      </div>
    </div>
  );
}
