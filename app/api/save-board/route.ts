import { NextRequest, NextResponse } from 'next/server'
import { SupabaseBoardRepo } from '../../../infrastructure/supabaseBoardRepo'
import { TaskCreateSchema } from '../../../domain/task.schemas'

export async function POST(req: NextRequest) {
  const json = await req.json()
  const result = TaskCreateSchema.safeParse(json)
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error.flatten() }, { status: 400 })
  }
  try {
    const taskWithId = { ...result.data, id: crypto.randomUUID() }
    await SupabaseBoardRepo.addTask(taskWithId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
