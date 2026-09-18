import type { Task } from '@/lib/types';
import { formatTimeRange } from '@/lib/dates';

export default function CalChip({
  task,
  color,
  onOpenEdit,
  onToggleTask,
}: {
  task: Task;
  color?: string;
  onOpenEdit: (id: string) => void;
  onToggleTask: (task: Task, completed: boolean) => void;
}) {
  const hasSub = task.subtasks.length > 0;
  const label = hasSub
    ? task.completed ? 'Mark all subtasks not done' : 'Mark all subtasks done'
    : task.completed ? 'Mark as not done' : 'Mark as done';
  const time = formatTimeRange(task.startTime, task.endTime);

  return (
    <div className={`cal-chip${task.completed ? ' done' : ''}`} style={{ borderColor: color || '#888' }}>
      <button
        type="button"
        className="cal-chip-check"
        title={label}
        onClick={(e) => {
          e.stopPropagation();
          onToggleTask(task, !task.completed);
        }}
      >
        {task.completed && '✓'}
      </button>
      <button type="button" className="cal-chip-title" onClick={() => onOpenEdit(task.id)}>
        {time && <span className="cal-chip-time">{time}</span>}
        {task.title}
      </button>
    </div>
  );
}
