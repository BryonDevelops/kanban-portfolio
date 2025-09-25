import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  // Check the secret – if it doesn't match, return a 401
  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  // Enable draft mode
  const draft = await draftMode()
  draft.enable()

  // Redirect to the slug, or home if no slug
  redirect(slug ?? '/')
}