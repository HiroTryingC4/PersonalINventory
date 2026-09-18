import {
  addDays,
  addMonths,
  addWeeks,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export function isoLocal(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return isoLocal(new Date());
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfWeekLocal(d: Date): Date {
  return startOfWeek(d, { weekStartsOn: 0 });
}

export function startOfMonthLocal(d: Date): Date {
  return startOfMonth(d);
}

export function formatTime12(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  let h = parseInt(hStr, 10) % 24;
  const m = parseInt(mStr, 10) || 0;
  const suffix = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return m === 0 ? `${h}${suffix}` : `${h}:${String(m).padStart(2, '0')}${suffix}`;
}

export function formatTimeRange(start?: string | null, end?: string | null): string | null {
  if (start && end) return `${formatTime12(start)}–${formatTime12(end)}`;
  if (start) return formatTime12(start);
  if (end) return formatTime12(end);
  return null;
}

export function sortCalTasks<T extends { completed: boolean; startTime: string | null }>(tasks: T[]): T[] {
  return tasks.slice().sort((a, b) => {
    if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
    return (a.startTime || '24:00').localeCompare(b.startTime || '24:00');
  });
}

export { addDays, addMonths, addWeeks, format, isSameDay };
