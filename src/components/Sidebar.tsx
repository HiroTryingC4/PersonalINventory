'use client';

import { useEffect, useState } from 'react';
import type { Category, Task } from '@/lib/types';

type View = 'active' | 'calendar' | 'done';

const VIEW_LABEL: Record<View, string> = { active: 'Tasks', calendar: 'Calendar', done: 'Done' };

export default function Sidebar({
  view,
  setView,
  categoryFilter,
  setCategoryFilter,
  categories,
  tasks,
  onAddCategory,
  onDeleteCategory,
}: {
  view: View;
  setView: (v: View) => void;
  categoryFilter: string | null;
  setCategoryFilter: (id: string | null) => void;
  categories: Category[];
  tasks: Task[];
  onAddCategory: (input: { name: string; color: string; subjectLabel: string }) => void;
  onDeleteCategory: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [subjectLabel, setSubjectLabel] = useState('');
  const [color, setColor] = useState('#3B6E4F');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const openCount = (catId: string | null) =>
    tasks.filter((t) => !t.completed && (!catId || t.categoryId === catId)).length;
  const doneCount = (catId: string | null) =>
    tasks.filter((t) => t.completed && (!catId || t.categoryId === catId)).length;

  function submitCategory() {
    if (!name.trim()) return;
    onAddCategory({ name: name.trim(), color, subjectLabel: subjectLabel.trim() || 'Tag' });
    setName('');
    setSubjectLabel('');
    setColor('#3B6E4F');
    setShowForm(false);
  }

  function selectView(v: View) {
    setView(v);
    setMobileOpen(false);
  }

  function selectCategory(id: string | null) {
    setCategoryFilter(id);
    setMobileOpen(false);
  }

  return (
    <>
      <div className="mobile-topbar">
        <button className="hamburger-btn" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
          ☰
        </button>
        <span className="mobile-topbar-title">{VIEW_LABEL[view]}</span>
      </div>

      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        <div className="brand">
          <div className="brand-row">
            <h1>Board</h1>
            <button className="btn-icon sidebar-close" aria-label="Close menu" onClick={() => setMobileOpen(false)}>✕</button>
          </div>
          <p>{openCount(null)} open</p>
        </div>

        <div className="nav-group">
          <button className="nav-item" onClick={() => selectView('active')}>
            <span className="nav-left"><span className="label">Tasks</span></span>
            <span className="count">{openCount(null)}</span>
          </button>
          <button className="nav-item" onClick={() => selectView('calendar')}>
            <span className="nav-left"><span className="label">Calendar</span></span>
          </button>
          <button className="nav-item" onClick={() => selectView('done')}>
            <span className="nav-left"><span className="label">Done</span></span>
            <span className="count">{doneCount(null)}</span>
          </button>
        </div>

        <div className="nav-group">
          <div className="nav-label">Categories</div>
          <button className={`nav-item${categoryFilter === null ? ' active' : ''}`} onClick={() => selectCategory(null)}>
            <span className="nav-left">
              <span className="dot" style={{ background: 'var(--ink-faint)' }} />
              <span className="label">All</span>
            </span>
            <span className="count">{openCount(null)}</span>
          </button>

          {categories.map((c) => (
            <div key={c.id} className="cat-row">
              <button
                className={`nav-item${categoryFilter === c.id ? ' active' : ''}`}
                onClick={() => selectCategory(c.id)}
              >
                <span className="nav-left">
                  <span className="dot" style={{ background: c.color }} />
                  <span className="label">{c.name}</span>
                </span>
                <span className="count">{openCount(c.id)}</span>
              </button>
              <button
                className="btn-icon"
                title={`Delete ${c.name}`}
                onClick={() => onDeleteCategory(c.id)}
              >
                ✕
              </button>
            </div>
          ))}

          {!showForm ? (
            <button className="btn-add-cat" onClick={() => setShowForm(true)}>+ Add category</button>
          ) : (
            <div className="cat-form">
              <input
                type="text"
                placeholder="Category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Subject label (e.g. Subject, Client)"
                value={subjectLabel}
                onChange={(e) => setSubjectLabel(e.target.value)}
              />
              <div className="cat-form-row">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                <button className="btn-primary" style={{ flex: 1 }} onClick={submitCategory}>Add</button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
