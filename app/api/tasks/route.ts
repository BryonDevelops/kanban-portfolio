import { NextRequest, NextResponse } from 'next/server';
import { createTaskHandler, getTasksHandler } from '../../../lib/dependencyContainer';

export async function GET() {
  try {
    const handler = getTasksHandler();
    const tasks = await handler.execute();
    return NextResponse.json(tasks);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const handler = createTaskHandler();
    const result = await handler.execute(data);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
