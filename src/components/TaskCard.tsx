'use client';

import { useState } from 'react';
import type { Category, Task } from '@/lib/types';
import { todayISO, formatTimeRange } from '@/lib/dates';

export default function TaskCard({
  task,
  forceExpand,
  hideDueBadge,
  onToggleTask,
  onToggleSubtask,
  onEdit,
  onDelete,
}: {
  task: Task;
  category?: Category;
  forceExpand?: boolean;
  hideDueBadge?: boolean;
  onToggleTask: (id: string, completed: boolean) => void;
  onToggleSubtask: (id: string, done: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasSub = task.subtasks.length > 0;
  const expanded = !!forceExpand || open;
  const doneCount = task.subtasks.filter((s) => s.done).length;

  function dueBadge() {
    if (!task.due || hideDueBadge) return null;
    const dueISO = task.due.slice(0, 10);
    let cls = '';
    if (!task.completed) {
      if (dueISO < todayISO()) cls = ' overdue';
      else if (dueISO === todayISO()) cls = ' today';
    }
    const d = new Date(task.due);
    return (
      <span className={`badge-due${cls}`}>
        {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>
    );
  }

  return (
    <div className={`task${task.completed ? ' done' : ''}`}>
      <div className="task-head">
        {hasSub ? (
          <input
            type="checkbox"
            className="task-check"
            disabled
            checked={task.completed}
            title="Complete all subtasks to finish this task"
            readOnly
          />
        ) : (
          <input
            type="checkbox"
            className="task-check"
            checked={task.completed}
            onChange={(e) => onToggleTask(task.id, e.target.checked)}
          />
        )}
        <div className="task-body">
          <div className="task-title">{task.title}</div>
          <div className="task-meta">
            {task.subject && <span className="tag">{task.subject}</span>}
            {dueBadge()}
            {formatTimeRange(task.startTime, task.endTime) && (
              <span className="badge-time">{formatTimeRange(task.startTime, task.endTime)}</span>
            )}
            {hasSub &&
              (forceExpand ? (
                <span className="subtask-toggle" style={{ cursor: 'default' }}>
                  {doneCount}/{task.subtasks.length} subtasks
                </span>
              ) : (
                <button className="subtask-toggle" onClick={() => setOpen((v) => !v)}>
                  {doneCount}/{task.subtasks.length} subtasks {open ? '▾' : '▸'}
                </button>
              ))}
          </div>
          {hasSub && expanded && (
            <div className="subtasks">
              {task.subtasks.map((s) => (
                <div key={s.id} className={`subtask-row${s.done ? ' done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={s.done}
                    onChange={(e) => onToggleSubtask(s.id, e.target.checked)}
                  />
                  <span>{s.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="task-actions">
          <button className="btn-icon" title="Edit" onClick={() => onEdit(task.id)}>✎</button>
          <button className="btn-icon" title="Delete" onClick={() => onDelete(task.id)}>✕</button>
        </div>
      </div>
    </div>
  );
}
