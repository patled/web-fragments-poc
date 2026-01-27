import type { DragEvent } from "react";
import type { Project, StaffMember, Task } from "../../data/projectsStorage";
import { TaskItem } from "./TaskItem";
import { styles } from "./styles";

interface TaskListProps {
  project: Project;
  staffById: Record<string, StaffMember>;
  dragOverTaskId: string | null;
  onAddTask: (projectId: string) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
  onDeleteTask: (projectId: string, taskId: string) => void;
  onRemoveAssignee: (taskId: string, staffId: string) => void;
  onTaskDragOver: (event: DragEvent<HTMLElement>, taskId: string) => void;
  onTaskDragLeave: (taskId: string) => void;
  onTaskDrop: (event: DragEvent<HTMLElement>, task: Task) => void;
}

export function TaskList({
  project,
  staffById,
  dragOverTaskId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onRemoveAssignee,
  onTaskDragOver,
  onTaskDragLeave,
  onTaskDrop,
}: TaskListProps) {
  return (
    <div style={styles.tasksSection}>
      <div style={styles.tasksHeader}>
        <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Tasks</h2>
        <button
          onClick={() => onAddTask(project.id)}
          style={{
            ...styles.buttonSuccess,
            fontSize: "0.875rem",
          }}
        >
          + Add task
        </button>
      </div>

      {project.tasks.length === 0 ? (
        <p style={styles.emptyMessage}>No tasks yet.</p>
      ) : (
        <div style={styles.tasksList}>
          {project.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              projectId={project.id}
              staffById={staffById}
              isDragOver={dragOverTaskId === task.id}
              onToggle={(taskId) => onToggleTask(project.id, taskId)}
              onDelete={(taskId) => onDeleteTask(project.id, taskId)}
              onRemoveAssignee={onRemoveAssignee}
              onDragOver={(event) => onTaskDragOver(event, task.id)}
              onDragLeave={() => onTaskDragLeave(task.id)}
              onDrop={(event) => onTaskDrop(event, task)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
