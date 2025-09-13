import { NextRequest, NextResponse } from 'next/server';
import { SupabaseBoardRepo } from '../../../infrastructure/supabaseBoardRepo';

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    await SupabaseBoardRepo.addTask(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
