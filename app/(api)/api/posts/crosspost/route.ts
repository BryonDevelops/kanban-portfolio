import { NextRequest, NextResponse } from 'next/server';
import { getMicroblogService } from '../../../../../lib/dependencyContainer';
import { z } from 'zod';

const microblogService = getMicroblogService();

/**
 * Schema for incoming cross-post requests from Pebl.
 * Content arrives as markdown (already converted from Slate on the Pebl side).
 */
const CrossPostSchema = z.object({
  externalPeblId: z.string().min(1, 'Pebl ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  author: z.string().default('Bryon Bauer'),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  featured: z.boolean().default(false),
  categories: z.array(z.string()).default([]),
  publishedAt: z.string().datetime().optional(),
});

/**
 * Verify the request has a valid API key.
 * Accepts: Authorization: Bearer <key>
 */
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = process.env.MICROBLOG_API_KEY;
  if (!apiKey) {
    console.error('[CrossPost] MICROBLOG_API_KEY is not configured');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.slice(7);
  return token === apiKey;
}

/**
 * Auto-generate an excerpt from markdown content.
 * Strips markdown formatting and takes the first ~150 characters.
 */
function generateExcerpt(content: string): string {
  const plain = content
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    // Remove links, keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= 150) return plain;
  // Cut at last word boundary before 150 chars
  const truncated = plain.slice(0, 150);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * POST /api/posts/crosspost
 *
 * Receives a cross-post from Pebl. Authenticated via API key.
 * Uses upsert semantics: if a post with the given externalPeblId exists,
 * it's updated; otherwise a new post is created.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key
    if (!verifyApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: invalid or missing API key' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = CrossPostSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Auto-generate excerpt if not provided
    const excerpt = data.excerpt || generateExcerpt(data.content);

    const postData = {
      title: data.title,
      content: data.content,
      excerpt,
      author: data.author,
      tags: data.tags,
      imageUrl: data.imageUrl,
      status: data.status as 'draft' | 'published' | 'archived',
      featured: data.featured,
      categories: data.categories,
      publishedAt: data.publishedAt || new Date().toISOString(),
      externalPeblId: data.externalPeblId,
    };

    const post = await microblogService.upsertFromPebl(data.externalPeblId, postData);

    return NextResponse.json(
      { id: post.id, externalPeblId: data.externalPeblId, status: post.status },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CrossPost] Failed:', error);
    return NextResponse.json(
      { error: 'Failed to cross-post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
