'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Category, Task } from '@/lib/types';

export function useBoard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [catsRes, tasksRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/tasks'),
    ]);
    setCategories(await catsRes.json());
    setTasks(await tasksRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addCategory(input: { name: string; color: string; subjectLabel: string }) {
    await fetch('/api/categories', { method: 'POST', body: JSON.stringify(input) });
    await refresh();
  }

  async function deleteCategory(id: string): Promise<string | undefined> {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return body.error || 'Could not delete this category.';
    }
    await refresh();
    return undefined;
  }

  async function addTask(input: {
    title: string;
    categoryId: string;
    subject: string;
    due: string;
    startTime?: string;
    endTime?: string;
    subtasks: { title: string }[];
  }) {
    await fetch('/api/tasks', { method: 'POST', body: JSON.stringify(input) });
    await refresh();
  }

  async function updateTask(
    id: string,
    input: Partial<{
      title: string;
      categoryId: string;
      subject: string;
      due: string | null;
      startTime: string | null;
      endTime: string | null;
      completed: boolean;
    }>
  ) {
    await fetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
    await refresh();
  }

  async function replaceSubtasks(taskId: string, subtasks: { id?: string; title: string }[]) {
    await fetch(`/api/tasks/${taskId}/subtasks`, {
      method: 'PUT',
      body: JSON.stringify({ subtasks }),
    });
    await refresh();
  }

  async function toggleSubtask(id: string, done: boolean): Promise<Task> {
    const res = await fetch(`/api/subtasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done }) });
    const task = await res.json();
    await refresh();
    return task;
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    await refresh();
  }

  return {
    categories,
    tasks,
    loading,
    addCategory,
    deleteCategory,
    addTask,
    updateTask,
    replaceSubtasks,
    toggleSubtask,
    deleteTask,
  };
}
