import { NextRequest, NextResponse } from 'next/server';
import { getMicroblogService } from '../../../../lib/dependencyContainer';
import { PostCreateSchema } from '../../../../domain/microblog/schemas/post.schema';
import { PostStatus } from '../../../../domain/microblog/entities/post';

const microblogService = getMicroblogService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const author = searchParams.get('author');
    const tag = searchParams.get('tag');
    const query = searchParams.get('q');

    let posts;

    if (query) {
      posts = await microblogService.searchPosts(query);
    } else if (status) {
      const validStatuses: PostStatus[] = ['draft', 'published', 'archived'];
      if (validStatuses.includes(status as PostStatus)) {
        posts = await microblogService.getPostsByStatus(status as PostStatus);
      } else {
        return NextResponse.json(
          { error: 'Invalid status parameter' },
          { status: 400 }
        );
      }
    } else if (author) {
      posts = await microblogService.getPostsByAuthor(author);
    } else if (tag) {
      posts = await microblogService.getPostsByTag(tag);
    } else {
      posts = await microblogService.getPosts();
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body using Zod schema
    const validationResult = PostCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.flatten()
        },
        { status: 400 }
      );
    }

    const postData = validationResult.data;
    const newPost = await microblogService.createPost(postData);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Failed to create post:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('required')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}