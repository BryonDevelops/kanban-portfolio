import { NextResponse } from 'next/server'
import { getOpenApiDocument } from '../../../../infrastructure/external-apis/openapi'

export async function GET() {
  const doc = getOpenApiDocument()
  return NextResponse.json(doc)
}
