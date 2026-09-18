'use client';

import { useState } from 'react';
import { addDays, addMonths, addWeeks, format, startOfWeekLocal, todayISO } from '@/lib/dates';
import type { Category, Task } from '@/lib/types';
import MonthGrid from './MonthGrid';
import ColumnsView from './ColumnsView';

type Mode = '3day' | 'week' | 'month';

export default function CalendarView({
  tasks,
  categories,
  categoryFilter,
  onOpenAdd,
  onOpenEdit,
  onToggleTask,
}: {
  tasks: Task[];
  categories: Category[];
  categoryFilter: string | null;
  onOpenAdd: (dateISO: string) => void;
  onOpenEdit: (id: string) => void;
  onToggleTask: (task: Task, completed: boolean) => void;
}) {
  const [mode, setMode] = useState<Mode>('week');
  const [anchor, setAnchor] = useState(new Date());

  const visibleTasks = categoryFilter ? tasks.filter((t) => t.categoryId === categoryFilter) : tasks;
  const byDate = new Map<string, Task[]>();
  visibleTasks.forEach((t) => {
    if (!t.due) return;
    const key = t.due.slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(t);
  });
  const catById = (id: string) => categories.find((c) => c.id === id);

  function nav(dir: 1 | -1) {
    if (mode === 'month') setAnchor((a) => addMonths(a, dir));
    else if (mode === 'week') setAnchor((a) => addWeeks(a, dir));
    else setAnchor((a) => addDays(a, dir * 3));
  }

  const rangeLabel =
    mode === 'month'
      ? format(anchor, 'MMMM yyyy')
      : (() => {
          const start = mode === 'week' ? startOfWeekLocal(anchor) : anchor;
          const end = addDays(start, mode === 'week' ? 6 : 2);
          return `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`;
        })();

  return (
    <div>
      <div className="main-head">
        <div>
          <h2>Calendar</h2>
          <div className="sub">Tasks by due date</div>
        </div>
        <button className="btn-primary" onClick={() => onOpenAdd(todayISO())}>+ New task</button>
      </div>

      <div className="cal-toolbar">
        <div className="seg">
          <button className={mode === '3day' ? 'active' : ''} onClick={() => setMode('3day')}>3 day</button>
          <button className={mode === 'week' ? 'active' : ''} onClick={() => setMode('week')}>Week</button>
          <button className={mode === 'month' ? 'active' : ''} onClick={() => setMode('month')}>Month</button>
        </div>
        <div className="cal-nav">
          <button className="btn-ghost" onClick={() => nav(-1)}>←</button>
          <span className="cal-range">{rangeLabel}</span>
          <button className="btn-ghost" onClick={() => nav(1)}>→</button>
          <button className="btn-ghost" onClick={() => setAnchor(new Date())}>Today</button>
        </div>
      </div>

      {mode === 'month' ? (
        <MonthGrid
          anchor={anchor}
          byDate={byDate}
          catById={catById}
          onOpenAdd={onOpenAdd}
          onOpenEdit={onOpenEdit}
          onToggleTask={onToggleTask}
        />
      ) : (
        <ColumnsView
          anchor={anchor}
          count={mode === 'week' ? 7 : 3}
          byDate={byDate}
          catById={catById}
          onOpenAdd={onOpenAdd}
          onOpenEdit={onOpenEdit}
          onToggleTask={onToggleTask}
        />
      )}
    </div>
  );
}
