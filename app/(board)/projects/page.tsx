"use client"

import Board from "@/presentation/components/features/board/Board"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Input } from "@/presentation/components/ui/input"
import { Button } from "@/presentation/components/ui/button"
import { Plus, SlidersHorizontal } from "lucide-react"
import { BoardService } from "@/services/board/boardService"
import { TaskService } from "@/services/board/taskService"
import { ProjectService } from "@/services/board/projectService"
import { SupabaseBoardRepository } from "@/infrastructure/database/repositories/supaBaseBoardRepository"
import { IBoardRepository } from "@/domain/board/repositories/boardRepository.interface"
import { Project } from "@/domain/board/schemas/project.schema"

export default function ProjectsPage() {

  const repository: IBoardRepository = new SupabaseBoardRepository();
  const taskService = new TaskService(repository);
  const projectService = new ProjectService(repository);
  const boardService = new BoardService(repository, taskService, projectService);

  const handleCreateProject = async () => {
    try {
      const newProject = await boardService.createProject('ideas', 'New Project');
      // Ensure tasks status is strictly typed
      const fixedProject: Project = {
        ...newProject,
        tasks: newProject.tasks
      };
      
      console.log('Created project:', fixedProject);

      // Show success toast
      import("@/presentation/utils/toast").then(({ success }) => {
        success("Project created!", "Your new project has been added to the Ideas column.");
      });
    } catch (error) {
      console.error('Failed to create project:', error);

      // Show error toast
      import("@/presentation/utils/toast").then(({ error: errorToast }) => {
        errorToast("Failed to create project", error instanceof Error ? error.message : 'Please try again.');
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Secondary accent orbs */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Modern Header Section */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Projects
                  </span>
                </h1>
                <p className="text-lg text-slate-400 max-w-md">
                  Organize, prioritize, and track progress across your creative work.
                </p>
              </div>

              {/* Decorative element */}
              <div className="hidden sm:block">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10" />
              </div>
            </div>
          </div>

          {/* Enhanced Toolbar */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search and Filters */}
              <div className="flex-1 max-w-md">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-3 shadow-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                      <Input
                        placeholder="Search projects..."
                        className="bg-transparent border-0 text-white placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateProject}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">New Project</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Modern Board Container */}
          <div className="relative">
            {/* Container glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur opacity-20" />

            <div className="relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Inner gradient border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />

              <div className="relative p-6 sm:p-8">
                <div className="h-[85vh] overflow-hidden">
                  <DndProvider backend={HTML5Backend}>
                    <Board />
                  </DndProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
