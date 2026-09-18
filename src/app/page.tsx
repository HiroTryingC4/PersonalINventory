'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/Calendar/CalendarView';
import TaskModal from '@/components/TaskModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useBoard } from '@/hooks/useBoard';
import type { Task } from '@/lib/types';

type View = 'active' | 'calendar' | 'done';
type ModalState = { mode: 'add' | 'edit'; taskId?: string; defaultDue?: string } | null;

export default function Home() {
  const {
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
  } = useBoard();

  const [view, setView] = useState<View>('active');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  const editingTask = modal?.mode === 'edit' ? tasks.find((t) => t.id === modal.taskId) : undefined;

  async function handleSave(payload: {
    title: string;
    categoryId: string;
    subject: string;
    due: string;
    startTime: string;
    endTime: string;
    subtasks: { id?: string; title: string }[];
  }) {
    if (modal?.mode === 'edit' && modal.taskId) {
      await updateTask(modal.taskId, {
        title: payload.title,
        categoryId: payload.categoryId,
        subject: payload.subject,
        due: payload.due || null,
        startTime: payload.startTime || null,
        endTime: payload.endTime || null,
      });
      await replaceSubtasks(modal.taskId, payload.subtasks);
    } else {
      await addTask({
        title: payload.title,
        categoryId: payload.categoryId,
        subject: payload.subject,
        due: payload.due,
        startTime: payload.startTime,
        endTime: payload.endTime,
        subtasks: payload.subtasks,
      });
    }
    setModal(null);
  }

  function handleDelete() {
    if (modal?.mode === 'edit' && modal.taskId) {
      setPendingDeleteId(modal.taskId);
    }
  }

  function handleToggleTask(id: string, completed: boolean) {
    updateTask(id, { completed });
  }

  async function handleToggleSubtask(id: string, done: boolean) {
    const updated = await toggleSubtask(id, done);
    if (done && updated.completed) setJustCompleted(updated.title);
  }

  async function handleCalendarToggle(task: Task, completed: boolean) {
    if (task.subtasks.length === 0) {
      await updateTask(task.id, { completed });
      return;
    }
    let updated;
    for (const s of task.subtasks) {
      if (s.done !== completed) updated = await toggleSubtask(s.id, completed);
    }
    if (completed && updated?.completed) setJustCompleted(updated.title);
  }

  function handleDeleteFromList(id: string) {
    setPendingDeleteId(id);
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    await deleteTask(pendingDeleteId);
    if (modal?.mode === 'edit' && modal.taskId === pendingDeleteId) setModal(null);
    setPendingDeleteId(null);
  }

  async function handleDeleteCategory(id: string) {
    const error = await deleteCategory(id);
    if (error) setCategoryError(error);
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading your board…</div>;
  }

  return (
    <div id="app">
      <Sidebar
        view={view}
        setView={setView}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        tasks={tasks}
        onAddCategory={addCategory}
        onDeleteCategory={handleDeleteCategory}
      />
      <main className="main">
        {view === 'active' && (
          <TaskList
            completed={false}
            tasks={tasks}
            categories={categories}
            categoryFilter={categoryFilter}
            onOpenAdd={() => setModal({ mode: 'add' })}
            onToggleTask={handleToggleTask}
            onToggleSubtask={handleToggleSubtask}
            onEdit={(id) => setModal({ mode: 'edit', taskId: id })}
            onDelete={handleDeleteFromList}
          />
        )}
        {view === 'done' && (
          <TaskList
            completed
            tasks={tasks}
            categories={categories}
            categoryFilter={categoryFilter}
            onOpenAdd={() => setModal({ mode: 'add' })}
            onToggleTask={handleToggleTask}
            onToggleSubtask={handleToggleSubtask}
            onEdit={(id) => setModal({ mode: 'edit', taskId: id })}
            onDelete={handleDeleteFromList}
          />
        )}
        {view === 'calendar' && (
          <CalendarView
            tasks={tasks}
            categories={categories}
            categoryFilter={categoryFilter}
            onOpenAdd={(dateISO) => setModal({ mode: 'add', defaultDue: dateISO })}
            onOpenEdit={(id) => setModal({ mode: 'edit', taskId: id })}
            onToggleTask={handleCalendarToggle}
          />
        )}
      </main>

      {modal && (
        <TaskModal
          mode={modal.mode}
          task={editingTask}
          categories={categories}
          defaultCategoryId={categoryFilter}
          defaultDue={modal.defaultDue || ''}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={modal.mode === 'edit' ? handleDelete : undefined}
        />
      )}

      {pendingDeleteId && (
        <ConfirmDialog
          title="Delete task?"
          message="This will permanently delete the task and its subtasks."
          confirmLabel="Delete"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}

      {categoryError && (
        <ConfirmDialog
          title="Can't delete category"
          message={categoryError}
          confirmLabel="OK"
          onCancel={() => setCategoryError(null)}
        />
      )}

      {justCompleted && (
        <ConfirmDialog
          title="Task completed"
          message={`"${justCompleted}" is done — every subtask is checked off.`}
          confirmLabel="Nice"
          onCancel={() => setJustCompleted(null)}
        />
      )}
    </div>
  );
}
