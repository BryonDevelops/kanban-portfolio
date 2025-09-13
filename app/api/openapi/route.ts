import { NextResponse } from 'next/server'
import { getOpenApiDocument } from '../../../lib/openapi'

export async function GET() {
  const doc = getOpenApiDocument()
  return NextResponse.json(doc)
}
