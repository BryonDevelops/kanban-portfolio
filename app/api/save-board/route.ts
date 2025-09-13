import { NextRequest, NextResponse } from 'next/server';
import { SupabaseBoardRepo } from '../../../infrastructure/supabaseBoardRepo';
import { TaskCreateSchema } from '../../../domain/task.schemas';

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parse = TaskCreateSchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ success: false, error: parse.error.flatten() }, { status: 400 });
  }
  try {
    await SupabaseBoardRepo.addTask(parse.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
