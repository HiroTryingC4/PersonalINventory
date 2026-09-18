import { addDays, format, isSameDay, isoLocal, sortCalTasks, startOfWeekLocal } from '@/lib/dates';
import type { Category, Task } from '@/lib/types';
import CalChip from './CalChip';

export default function ColumnsView({
  anchor,
  count,
  byDate,
  catById,
  onOpenAdd,
  onOpenEdit,
  onToggleTask,
}: {
  anchor: Date;
  count: number;
  byDate: Map<string, Task[]>;
  catById: (id: string) => Category | undefined;
  onOpenAdd: (dateISO: string) => void;
  onOpenEdit: (id: string) => void;
  onToggleTask: (task: Task, completed: boolean) => void;
}) {
  const start = count === 7 ? startOfWeekLocal(anchor) : anchor;
  const days = Array.from({ length: count }, (_, i) => addDays(start, i));

  return (
    <div className="cal-columns" style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
      {days.map((d) => {
        const iso = isoLocal(d);
        const isToday = isSameDay(d, new Date());
        const dayTasks = sortCalTasks(byDate.get(iso) || []);
        return (
          <div key={iso} className={`cal-col${isToday ? ' today' : ''}`}>
            <div className="cal-col-head">
              <span>{format(d, 'EEE, MMM d')}</span>
              <button className="cal-add" style={{ opacity: 1 }} onClick={() => onOpenAdd(iso)}>+</button>
            </div>
            <div className="cal-col-body">
              {dayTasks.length === 0 && (
                <div style={{ color: 'var(--ink-faint)', fontSize: 12, padding: '4px 2px' }}>No tasks</div>
              )}
              {dayTasks.map((t) => (
                <CalChip
                  key={t.id}
                  task={t}
                  color={catById(t.categoryId)?.color}
                  onOpenEdit={onOpenEdit}
                  onToggleTask={onToggleTask}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
