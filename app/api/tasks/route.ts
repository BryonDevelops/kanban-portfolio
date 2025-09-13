import { NextResponse } from 'next/server'
import { SupabaseBoardRepo } from '../../../infrastructure/supabaseBoardRepo'

export async function GET() {
  try {
    const tasks = await SupabaseBoardRepo.fetchTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
