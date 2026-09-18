import { addDays, isSameDay, isoLocal, sortCalTasks, startOfMonthLocal, startOfWeekLocal } from '@/lib/dates';
import type { Category, Task } from '@/lib/types';
import CalChip from './CalChip';

export default function MonthGrid({
  anchor,
  byDate,
  catById,
  onOpenAdd,
  onOpenEdit,
  onToggleTask,
}: {
  anchor: Date;
  byDate: Map<string, Task[]>;
  catById: (id: string) => Category | undefined;
  onOpenAdd: (dateISO: string) => void;
  onOpenEdit: (id: string) => void;
  onToggleTask: (task: Task, completed: boolean) => void;
}) {
  const first = startOfMonthLocal(anchor);
  const gridStart = startOfWeekLocal(first);
  const month = anchor.getMonth();
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="cal-month">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
        <div key={d} className="cal-dow">{d}</div>
      ))}
      {cells.map((d) => {
        const iso = isoLocal(d);
        const out = d.getMonth() !== month;
        const isToday = isSameDay(d, new Date());
        const dayTasks = sortCalTasks(byDate.get(iso) || []);
        const shown = dayTasks.slice(0, 3);
        return (
          <div key={iso} className={`cal-cell${out ? ' out' : ''}${isToday ? ' today' : ''}`}>
            <div className="daynum">
              <span>{d.getDate()}</span>
              <button className="cal-add" onClick={() => onOpenAdd(iso)}>+</button>
            </div>
            {shown.map((t) => (
              <CalChip
                key={t.id}
                task={t}
                color={catById(t.categoryId)?.color}
                onOpenEdit={onOpenEdit}
                onToggleTask={onToggleTask}
              />
            ))}
            {dayTasks.length > 3 && (
              <button className="cal-more" onClick={() => onOpenAdd(iso)}>+{dayTasks.length - 3} more</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
