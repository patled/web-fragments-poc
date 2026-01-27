import type { DragEvent } from "react";
import type { Task, StaffMember } from "../../data/projectsStorage";
import { styles } from "./styles";

interface TaskItemProps {
  task: Task;
  projectId: string;
  staffById: Record<string, StaffMember>;
  isDragOver: boolean;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onRemoveAssignee: (taskId: string, staffId: string) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

export function TaskItem({
  task,
  projectId,
  staffById,
  isDragOver,
  onToggle,
  onDelete,
  onRemoveAssignee,
  onDragOver,
  onDragLeave,
  onDrop,
}: TaskItemProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={styles.taskCard(task.completed, isDragOver)}
    >
      <div style={styles.taskContent}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          style={{
            marginTop: "0.25rem",
            cursor: "pointer",
          }}
        />
        <div style={styles.taskDetails}>
          <h3 style={styles.taskTitle(task.completed)}>{task.title}</h3>
          {task.description && (
            <p style={styles.taskDescription}>{task.description}</p>
          )}
          {task.assigneeIds.length > 0 && (
            <div style={styles.assigneesSection}>
              <div style={styles.assigneesLabel}>Assigned to</div>
              <div style={styles.assigneesList}>
                {task.assigneeIds.map((assigneeId) => (
                  <button
                    key={assigneeId}
                    type="button"
                    onClick={() => onRemoveAssignee(task.id, assigneeId)}
                    style={styles.assigneeBadge}
                  >
                    {staffById[assigneeId]?.name ?? "Unknown"} ×
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(task.id)}
          style={styles.buttonSmallDanger}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
