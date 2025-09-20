import { NextResponse } from 'next/server'
import { SupabaseBoardRepository } from '../../../../infrastructure/database/repositories/supaBaseBoardRepository'

export async function GET() {
  try {
    const repository = new SupabaseBoardRepository()
    const tasks = await repository.fetchTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
