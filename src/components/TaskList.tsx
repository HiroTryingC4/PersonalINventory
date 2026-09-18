import type { Category, Task } from '@/lib/types';
import TaskCard from './TaskCard';

export default function TaskList({
  completed,
  tasks,
  categories,
  categoryFilter,
  onOpenAdd,
  onToggleTask,
  onToggleSubtask,
  onEdit,
  onDelete,
}: {
  completed: boolean;
  tasks: Task[];
  categories: Category[];
  categoryFilter: string | null;
  onOpenAdd: () => void;
  onToggleTask: (id: string, completed: boolean) => void;
  onToggleSubtask: (id: string, done: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cats = categories.filter((c) => !categoryFilter || c.id === categoryFilter);
  const filtered = tasks.filter(
    (t) => (completed ? t.completed : true) && (!categoryFilter || t.categoryId === categoryFilter)
  );

  const groups = cats
    .map((c) => {
      const catTasks = filtered.filter((t) => t.categoryId === c.id);
      if (!catTasks.length) return null;
      catTasks.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.completed
          ? (b.completedAt || '').localeCompare(a.completedAt || '')
          : (a.due || '9999').localeCompare(b.due || '9999');
      });
      const bySubject = new Map<string, Task[]>();
      catTasks.forEach((t) => {
        const key = t.subject || '';
        if (!bySubject.has(key)) bySubject.set(key, []);
        bySubject.get(key)!.push(t);
      });
      return { category: c, bySubject };
    })
    .filter(Boolean) as { category: Category; bySubject: Map<string, Task[]> }[];

  return (
    <div>
      <div className="main-head">
        <div>
          <h2>{completed ? 'Done' : 'Tasks'}</h2>
          <div className="sub">
            {completed ? 'Completed items, grouped by category' : 'All items, grouped by category — completed ones stay checked off'}
          </div>
        </div>
        {!completed && <button className="btn-primary" onClick={onOpenAdd}>+ New task</button>}
      </div>

      {groups.length === 0 && (
        <div className="empty">
          <b>{completed ? 'Nothing completed yet' : 'Nothing here yet'}</b>
          {completed
            ? 'Finished tasks will collect here, grouped by category.'
            : 'Add your first task to start tracking it.'}
        </div>
      )}

      {groups.map(({ category, bySubject }) => (
        <div key={category.id} className="group">
          <div className="group-head">
            <span className="dot" style={{ background: category.color }} />
            <h3>{category.name}</h3>
            <span className="count">
              {[...bySubject.values()].reduce((n, arr) => n + arr.length, 0)}
            </span>
          </div>
          {[...bySubject.keys()].sort().map((subj) => (
            <div key={subj || '__none__'} className="subgroup">
              {subj && (
                <div className="subgroup-label">{category.subjectLabel} — {subj}</div>
              )}
              {bySubject.get(subj)!.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  category={category}
                  forceExpand={completed}
                  onToggleTask={onToggleTask}
                  onToggleSubtask={onToggleSubtask}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
