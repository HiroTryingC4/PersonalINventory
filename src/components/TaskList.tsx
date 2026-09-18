import { format, parseISODate, todayISO } from '@/lib/dates';
import type { Category, Task } from '@/lib/types';
import TaskCard from './TaskCard';

function bySubjectGroups(tasks: Task[]): Map<string, Task[]> {
  const bySubject = new Map<string, Task[]>();
  tasks.forEach((t) => {
    const key = t.subject || '';
    if (!bySubject.has(key)) bySubject.set(key, []);
    bySubject.get(key)!.push(t);
  });
  return bySubject;
}

function byDueDateGroups(tasks: Task[]): Map<string, Task[]> {
  const byDue = new Map<string, Task[]>();
  tasks.forEach((t) => {
    const key = t.due ? t.due.slice(0, 10) : '';
    if (!byDue.has(key)) byDue.set(key, []);
    byDue.get(key)!.push(t);
  });
  return byDue;
}

function dueDateLabel(dueISO: string): string {
  if (!dueISO) return 'No due date';
  if (dueISO === todayISO()) return 'Today';
  return format(parseISODate(dueISO), 'EEE, MMM d');
}

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
  const filtered = tasks.filter(
    (t) => (completed ? t.completed : true) && (!categoryFilter || t.categoryId === categoryFilter)
  );

  function renderTaskCards(list: Task[], c: Category, hideDueBadge: boolean) {
    return list.map((t) => (
      <TaskCard
        key={t.id}
        task={t}
        category={c}
        forceExpand={completed}
        hideDueBadge={hideDueBadge}
        onToggleTask={onToggleTask}
        onToggleSubtask={onToggleSubtask}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ));
  }

  function renderCategoryGroups(catTasks: Task[], mode: 'subject' | 'date') {
    const cats = categories.filter((c) => catTasks.some((t) => t.categoryId === c.id));
    return cats.map((c) => {
      const tasksForCat = catTasks.filter((t) => t.categoryId === c.id);

      if (mode === 'date') {
        const byDate = byDueDateGroups(tasksForCat);
        const dateKeys = [...byDate.keys()].sort((a, b) => {
          if (a === '') return 1;
          if (b === '') return -1;
          return a.localeCompare(b);
        });
        return (
          <div key={c.id} className="group">
            <div className="group-head">
              <span className="dot" style={{ background: c.color }} />
              <h3>{c.name}</h3>
              <span className="count">{tasksForCat.length}</span>
            </div>
            {dateKeys.map((dateKey) => {
              const dateTasks = byDate.get(dateKey)!;
              const hasOpenOverdue = dateKey !== '' && dateKey < todayISO() && dateTasks.some((t) => !t.completed);
              const isToday = dateKey === todayISO();
              return (
                <div key={dateKey || '__none__'} className="subgroup">
                  <div className={`subgroup-label date${hasOpenOverdue ? ' overdue' : ''}${isToday ? ' today' : ''}`}>
                    {dueDateLabel(dateKey)}
                  </div>
                  {renderTaskCards(dateTasks, c, true)}
                </div>
              );
            })}
          </div>
        );
      }

      const bySubject = bySubjectGroups(tasksForCat);
      return (
        <div key={c.id} className="group">
          <div className="group-head">
            <span className="dot" style={{ background: c.color }} />
            <h3>{c.name}</h3>
            <span className="count">{tasksForCat.length}</span>
          </div>
          {[...bySubject.keys()].sort().map((subj) => (
            <div key={subj || '__none__'} className="subgroup">
              {subj && <div className="subgroup-label">{c.subjectLabel} — {subj}</div>}
              {renderTaskCards(bySubject.get(subj)!, c, false)}
            </div>
          ))}
        </div>
      );
    });
  }

  let body: React.ReactNode;
  let isEmpty: boolean;

  if (completed) {
    const byDay = new Map<string, Task[]>();
    filtered.forEach((t) => {
      const key = t.completedAt ? t.completedAt.slice(0, 10) : 'unknown';
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(t);
    });
    const days = [...byDay.keys()].sort((a, b) => b.localeCompare(a));
    days.forEach((day) => {
      byDay.get(day)!.sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
    });
    isEmpty = days.length === 0;
    body = (
      <>
        {days.map((day) => (
          <div key={day} className="day-group">
            <h2 className="day-heading">
              {day === 'unknown' ? 'Unknown date' : format(parseISODate(day), 'EEE, MMM d')}
            </h2>
            {renderCategoryGroups(byDay.get(day)!, 'subject')}
          </div>
        ))}
      </>
    );
  } else {
    const catTasks = filtered.slice().sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.completed
        ? (b.completedAt || '').localeCompare(a.completedAt || '')
        : (a.due || '9999').localeCompare(b.due || '9999');
    });
    isEmpty = catTasks.length === 0;
    body = renderCategoryGroups(catTasks, 'date');
  }

  return (
    <div>
      <div className="main-head">
        <div>
          <h2>{completed ? 'Done' : 'Tasks'}</h2>
          <div className="sub">
            {completed ? 'Completed items, grouped by day' : 'All items, grouped by category and due date — completed ones stay checked off'}
          </div>
        </div>
        {!completed && <button className="btn-primary" onClick={onOpenAdd}>+ New task</button>}
      </div>

      {isEmpty && (
        <div className="empty">
          <b>{completed ? 'Nothing completed yet' : 'Nothing here yet'}</b>
          {completed
            ? 'Finished tasks will collect here, grouped by day.'
            : 'Add your first task to start tracking it.'}
        </div>
      )}

      {body}
    </div>
  );
}
