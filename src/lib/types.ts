export type Category = {
  id: string;
  name: string;
  color: string;
  subjectLabel: string;
};

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
  order: number;
};

export type Task = {
  id: string;
  title: string;
  subject: string | null;
  due: string | null; // ISO date string, e.g. "2026-09-20T00:00:00.000Z"
  startTime: string | null; // "HH:mm", 24-hour
  endTime: string | null; // "HH:mm", 24-hour
  completed: boolean;
  completedAt: string | null;
  categoryId: string;
  subtasks: Subtask[];
};
