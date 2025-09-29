import { NextRequest, NextResponse } from 'next/server';
import { getMicroblogService } from '../../../../../lib/dependencyContainer';
import { PostUpdateSchema } from '../../../../../domain/microblog/schemas/post.schema';
import { PostUpdate } from '../../../../../domain/microblog/entities/post';

const microblogService = getMicroblogService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await microblogService.getPostById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate the request body using Zod schema
    const validationResult = PostUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data;
    // Transform the updates to match PostUpdate type (handle null imageUrl)
    const cleanUpdates: PostUpdate = {
      ...updates,
      imageUrl: updates.imageUrl === null ? undefined : updates.imageUrl,
    };
    const updatedPost = await microblogService.updatePost(id, cleanUpdates);

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Failed to update post:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('cannot be empty')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await microblogService.deletePost(id);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Failed to delete post:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}