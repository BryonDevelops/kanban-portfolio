import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '../../../../services/board/taskService'
import { ProjectService } from '../../../../services/board/projectService'
import { BoardService } from '../../../../services/board/boardService'
import { SupabaseBoardRepository } from '../../../../infrastructure/database/repositories/supaBaseBoardRepository'
import { ProjectCreateSchema } from '../../../../domain/board/schemas/project.schema'

// Initialize services
const repository = new SupabaseBoardRepository()
const taskService = new TaskService(repository)
const projectService = new ProjectService(repository)
const boardService = new BoardService(repository, taskService, projectService)

export async function POST(req: NextRequest) {
  const json = await req.json()
  const result = ProjectCreateSchema.safeParse(json)
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error.flatten() }, { status: 400 })
  }
  try {
    // Use the service layer to create a project
    await boardService.createProject(result.data.title, result.data.description)
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
