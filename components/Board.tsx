"use client";
import React, { useEffect, useState } from 'react';
import Column from './Column';
import { Plus } from 'lucide-react';
import { BoardService } from '../services/boardService';
import { useBoardStore } from '../stores/boardStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

const columnOrder = ['ideas', 'in-progress', 'completed'];

export default function Board() {
  const columns = useBoardStore((s) => s.columns);
  const setColumns = useBoardStore((s) => s.setColumns);
  const [quickAdd, setQuickAdd] = useState<{ colId: string | null; title: string; description: string }>({ colId: null, title: "", description: "" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('kanban-board-v1')) return;
    const demo = {
      ideas: [
        { id: 't1', title: 'Redesign landing page', description: 'Hero, pricing, footer' },
        { id: 't2', title: 'Add blog', description: 'MDX + RSS' },
      ],
      'in-progress': [
        { id: 't3', title: 'Implement dark mode', description: 'Theme switch + system' },
      ],
      completed: [
        { id: 't4', title: 'Set up CI/CD', description: 'Vercel + GitHub Actions' },
      ],
    } as typeof columns;
    setColumns(demo);
  }, [setColumns]);

  const badgeClasses = (colId: string) => {
    switch (colId) {
      case 'ideas':
        return 'border-sky-400/30 text-sky-300 bg-sky-400/10';
      case 'in-progress':
        return 'border-amber-400/30 text-amber-300 bg-amber-400/10';
      case 'completed':
        return 'border-emerald-400/30 text-emerald-300 bg-emerald-400/10';
      default:
        return 'border-white/15 text-white/80 bg-white/10';
    }
  };

  return (
    <div className="flex h-full flex-wrap gap-4 p-4 sm:p-6 overflow-x-hidden">
      {columnOrder.map((colId) => (
        <div key={colId} className="flex h-full w-full sm:w-80 flex-col rounded-lg border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="sticky top-0 z-10 -mx-4 -mt-4 px-4 py-3 bg-white/5 backdrop-blur border-b border-white/10">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold capitalize text-white/90">{colId.replace('-', ' ')}</h3>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badgeClasses(colId)}`}>
                    {(columns[colId] ?? []).length}
                  </span>
                  <button
                    type="button"
                    aria-label="Add task"
                    title="Add task"
                    onClick={() => { setQuickAdd({ colId, title: '', description: '' }); setOpen(true); }}
                    className="inline-flex size-6 items-center justify-center rounded-md border border-white/15 bg-white/10 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-3">
              <Column columnId={colId} tasks={columns[colId] ?? []} />
            </div>
          </div>
        </div>
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Create a new task in “{quickAdd.colId?.replace('-', ' ')}”.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const t = quickAdd.title.trim();
              if (!t || !quickAdd.colId) return;
              new BoardService().addTask(quickAdd.colId, t, quickAdd.description.trim() || undefined);
              setOpen(false);
              setQuickAdd({ colId: null, title: '', description: '' });
            }}
          >
            <input
              type="text"
              placeholder="Task title"
              value={quickAdd.title}
              onChange={(e) => setQuickAdd((p) => ({ ...p, title: e.target.value }))}
              autoFocus
              className="mb-2 w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <textarea
              placeholder="Description (optional)"
              value={quickAdd.description}
              onChange={(e) => setQuickAdd((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              className="mb-3 w-full resize-y rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <DialogFooter>
              <button
                type="button"
                onClick={() => { setOpen(false); setQuickAdd({ colId: null, title: '', description: '' }); }}
                className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-sm font-medium text-emerald-200 hover:bg-emerald-400/15"
              >
                Add Task
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
