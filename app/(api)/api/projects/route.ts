import { NextRequest, NextResponse } from 'next/server';
import { BoardService } from '../../../../services/board/boardService';
import { TaskService } from '../../../../services/board/taskService';
import { ProjectService } from '../../../../services/board/projectService';
import { ProjectCreateSchema } from '../../../../domain/board/schemas/project.schema';
import { SupabaseBoardRepository } from '@/infrastructure/database/repositories/supaBaseBoardRepository';

// Initialize the services with the repository
const boardRepository = new SupabaseBoardRepository();
const taskService = new TaskService(boardRepository);
const projectService = new ProjectService(boardRepository);
const boardService = new BoardService(boardRepository, taskService, projectService);

export async function GET() {
  try {
    const projects = await boardService.getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body using Zod schema
    const validationResult = ProjectCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const projectData = validationResult.data;
    const newProject = await projectService.createProject(projectData);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}