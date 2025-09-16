"use client"

import Board from "@/presentation/components/board/Board"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Input } from "@/presentation/components/ui/input"
import { Button } from "@/presentation/components/ui/button"
import { Plus, SlidersHorizontal } from "lucide-react"
import { BoardService } from "@/application/board/services/boardService"

export default function BoardPage() {
  return (
    <div className="relative px-4 py-6 sm:px-6">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-[-15%] top-[-10%] h-72 w-72 rounded-full bg-gradient-to-br from-sky-500/15 to-violet-500/15 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] h-72 w-72 rounded-full bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[1200px]">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70">
            Kanban Board
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Organize, prioritize, and track progress across your tasks.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur">
            <Input placeholder="Search tasks" className="bg-transparent" />
            <Button variant="ghost" className="shrink-0">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => new BoardService().addTask('ideas', 'New Task')}
              className="inline-flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" /> New Idea
            </Button>
          </div>
        </div>

        {/* Board container */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-sm backdrop-blur sm:p-3">
          <div className="h-[80vh] overflow-x-hidden">
            <DndProvider backend={HTML5Backend}>
              <Board />
            </DndProvider>
          </div>
        </div>
      </div>
    </div>
  )
}