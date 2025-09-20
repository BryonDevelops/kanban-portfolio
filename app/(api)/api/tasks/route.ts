import { NextRequest, NextResponse } from 'next/server'
import { SupabaseBoardRepository } from '../../../../infrastructure/database/repositories/supaBaseBoardRepository'

export async function GET() {
  try {
    const repository = new SupabaseBoardRepository()
    const tasks = await repository.getTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const repository = new SupabaseBoardRepository()
    const { projectId, ...taskData } = data;
    await repository.addTask(taskData, projectId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
