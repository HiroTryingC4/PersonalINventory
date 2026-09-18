'use client';

import { useEffect, useState } from 'react';
import type { Category, Task } from '@/lib/types';

type SubRow = { id?: string; title: string };

export default function TaskModal({
  mode,
  task,
  categories,
  defaultCategoryId,
  defaultDue,
  onClose,
  onSave,
  onDelete,
}: {
  mode: 'add' | 'edit';
  task?: Task;
  categories: Category[];
  defaultCategoryId: string | null;
  defaultDue: string;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    categoryId: string;
    subject: string;
    due: string;
    startTime: string;
    endTime: string;
    subtasks: SubRow[];
  }) => void | Promise<void>;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(task?.title || '');
  const [categoryId, setCategoryId] = useState(
    task?.categoryId || defaultCategoryId || categories[0]?.id || ''
  );
  const [subject, setSubject] = useState(task?.subject || '');
  const [due, setDue] = useState(task?.due ? task.due.slice(0, 10) : defaultDue || '');
  const [startTime, setStartTime] = useState(task?.startTime || '');
  const [endTime, setEndTime] = useState(task?.endTime || '');
  const [subtasks, setSubtasks] = useState<SubRow[]>(
    task?.subtasks.map((s) => ({ id: s.id, title: s.title })) || []
  );
  const [titleError, setTitleError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit() {
    if (submitting) return;
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        categoryId,
        subject: subject.trim(),
        due,
        startTime,
        endTime,
        subtasks: subtasks.filter((s) => s.title.trim()).map((s) => ({ id: s.id, title: s.title.trim() })),
      });
    } finally {
      setSubmitting(false);
    }
  }

  const subjectLabel = categories.find((c) => c.id === categoryId)?.subjectLabel || 'Tag';

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>{mode === 'edit' ? 'Edit task' : 'New task'}</h3>

        <div className="field">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(false); }}
            placeholder="What needs doing?"
            autoFocus
          />
        </div>
        {titleError && <div className="field-error">Give the task a title.</div>}

        <div className="field">
          <label>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>{subjectLabel} (optional)</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Databases, FMG site" />
        </div>

        <div className="field">
          <label>Due date (optional)</label>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>

        <div className="field">
          <label>Time (optional)</label>
          <div className="time-range-row">
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <span className="time-range-sep">–</span>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Subtasks</label>
          {subtasks.map((s, i) => (
            <div className="sub-edit-row" key={s.id || `new-${i}`}>
              <input
                type="text"
                value={s.title}
                placeholder="Subtask"
                onChange={(e) =>
                  setSubtasks((rows) => rows.map((r, idx) => (idx === i ? { ...r, title: e.target.value } : r)))
                }
              />
              <button className="btn-icon" onClick={() => setSubtasks((rows) => rows.filter((_, idx) => idx !== i))}>✕</button>
            </div>
          ))}
          <button className="btn-ghost" type="button" onClick={() => setSubtasks((rows) => [...rows, { title: '' }])}>
            + Add subtask
          </button>
        </div>

        <div className="modal-actions">
          {mode === 'edit' ? (
            <button className="danger" onClick={onDelete}>Delete task</button>
          ) : (
            <span />
          )}
          <div className="right">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
