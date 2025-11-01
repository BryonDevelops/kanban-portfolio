import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getNotionDatabase, getNotionProperty, getClient, getPublishedPages, getNotionPage } from '../../../../../infrastructure/external-apis/notion';
import type { BlogPost } from '../../../../../presentation/components/features/microblog/BlogPostPortal';

/**
 * Helper function to check if user is admin
 */
function isUserAdmin(user: { 
  publicMetadata?: Record<string, unknown>;
  organizationMemberships?: Array<{
    role: string;
    organization: { publicMetadata?: Record<string, unknown> };
  }>;
} | null): boolean {
  if (!user) return false;
  
  const isAdminRole = user.publicMetadata?.role === 'admin' ||
                      user.publicMetadata?.isAdmin === true;
  
  const isOrgAdmin = user.organizationMemberships?.some(membership =>
    membership.role === 'admin' ||
    membership.organization.publicMetadata?.isAdminOrg === true
  );
  
  return Boolean(isAdminRole || isOrgAdmin);
}

/**
 * GET /api/notion/blog-posts
 * Fetches blog posts from Notion's "Technical Blog Posts" database
 * - Admins: See all posts (any status)
 * - Non-admins: Only see posts with Status = "Published"
 */
export async function GET() {
  try {
    const databaseId = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;
    
    console.log('[Notion API] Fetching blog posts, databaseId:', databaseId);
    
    if (!databaseId) {
      return NextResponse.json(
        { error: 'NOTION_DATABASE_ID is not configured' },
        { status: 500 }
      );
    }

    // Check if user is admin
    const { userId } = await auth();
    const user = userId ? await currentUser() : null;
    const isAdmin = isUserAdmin(user);

    console.log('[Notion API] User is admin:', isAdmin);

    // Get database to verify it exists
    let database;
    try {
      database = await getNotionDatabase(databaseId);
      console.log('[Notion API] Database verified:', database.id);
    } catch (error) {
      console.error('Error fetching Notion database:', error);
      return NextResponse.json(
        { error: 'Failed to access Notion database', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Get database to extract data source ID
    let databaseResponse: unknown;
    
    try {
      databaseResponse = await getPublishedPages(databaseId);
    } catch (error) {
      console.error('Error fetching published pages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch published pages from Notion', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Extract data source ID from the database response
    const databaseWithDataSources = databaseResponse as { data_sources?: Array<{ id: string }> };
    const dataSourceId = databaseWithDataSources.data_sources?.[0]?.id;
    
    if (!dataSourceId) {
      console.error('[Notion API] No data source ID found in database response');
      return NextResponse.json(
        { error: 'Database does not contain a data source' },
        { status: 500 }
      );
    }

    console.log('[Notion API] Data source ID:', dataSourceId);

    // Query the data source
    let results: { results: Array<unknown> };
    try {
      const client = getClient();
      
      // Query data source with filter for published posts (non-admins) or all posts (admins)
      const filter = isAdmin ? undefined : {
        property: 'Status',
        status: {
          equals: 'Published',
        },
      };

      const response = await client.request({
        path: `data_sources/${dataSourceId}/query`,
        method: 'post',
        body: {
          filter,
          sorts: [
            {
              property: 'Publish Date',
              direction: 'descending',
            },
          ],
        },
      });

      results = response as { results: Array<unknown> };
      console.log('[Notion API] Query results:', results.results?.length || 0, 'pages');
    } catch (error) {
      console.error('Error querying data source:', error);
      return NextResponse.json(
        { error: 'Failed to query data source', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Helper to try multiple property names
    // Note: For boolean/checkbox properties, we want to return the actual value (true/false)
    // even if it's false, so we check differently for booleans
    const getProperty = (page: { properties: Record<string, unknown> }, names: string[], returnBooleanFalse = false): unknown => {
      for (const name of names) {
        const value = getNotionProperty(page, name);
        // For boolean values, return the actual boolean (true or false) if returnBooleanFalse is true
        if (typeof value === 'boolean') {
          if (returnBooleanFalse || value === true) {
            return value;
          }
        } else {
          // For non-boolean values, check if they are truthy/non-empty
          if (value !== null && value !== undefined && value !== '') {
            return value;
          }
        }
      }
      return null;
    };

    // Transform Notion pages to BlogPost format
    // The query results may contain page references or full page objects
    const pageReferences = (results.results || []) as Array<{ 
      id: string;
      properties?: Record<string, unknown>;
      created_time?: string;
      last_edited_time?: string;
      [key: string]: unknown;
    }>;
    
    // Fetch full page details for each page reference
    // Use GET /v1/pages/{page_id} to get complete page data
    const pageResults = await Promise.allSettled(
      pageReferences.map(async (pageRef) => {
        // Check if we already have full page data with properties
        if (pageRef.properties && pageRef.created_time) {
          // Already have full page data, use it directly
          return pageRef as {
            id: string;
            created_time: string;
            last_edited_time?: string;
            properties: Record<string, unknown>;
            [key: string]: unknown;
          };
        }
        
        // Otherwise, fetch full page details using GET /v1/pages/{page_id}
        const fullPage = await getNotionPage(pageRef.id);
        return fullPage as {
          id: string;
          created_time: string;
          last_edited_time?: string;
          properties: Record<string, unknown>;
          [key: string]: unknown;
        };
      })
    );

    // Filter out failed page fetches and extract successful pages
    const pages = pageResults
      .map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          const pageRef = pageReferences[index];
          console.error(`[Notion API] Error fetching page ${pageRef.id}:`, result.reason);
          // Skip pages that failed to fetch (e.g., page not found, deleted, etc.)
          return null;
        }
      })
      .filter((page): page is {
        id: string;
        created_time: string;
        last_edited_time?: string;
        properties: Record<string, unknown>;
        [key: string]: unknown;
      } => page !== null);

    const blogPosts = pages
      .map((page) => {
      // Extract properties from Notion page with fallbacks
      const title = (getProperty(page, ['Title', 'Name']) as string) || 'Untitled';
      console.log('[Notion API] Processing post:', title);
      const excerpt = (getProperty(page, ['Excerpt', 'Summary', 'Description']) as string) || '';
      const author = (getProperty(page, ['Author', 'Writer', 'By']) as string) || 'Unknown';
      const tagsRaw = getProperty(page, ['Topics', 'Tags', 'Tag', 'Categories']);
      const tags = Array.isArray(tagsRaw) ? tagsRaw : [];
      
      // Extract featured flag - try multiple property names and handle checkbox type
      // Use allowFalse=true so we get the actual boolean value even if false
      const featuredRaw = getProperty(page, ['Featured', 'Feature', 'Featured Post', 'Is Featured', 'Featured?'], true);
      let featured = false;
      if (typeof featuredRaw === 'boolean') {
        featured = featuredRaw;
      } else if (featuredRaw === true || featuredRaw === 'true' || featuredRaw === 'yes' || featuredRaw === 1) {
        featured = true;
      }
      
      console.log('[Notion API] Post featured status:', { title, featured, featuredRaw, hasFeatured: featured === true });
      
      const imageUrlRaw = getProperty(page, ['Featured Image URL', 'Image URL', 'Cover', 'Cover Image', 'Image']);
      const imageUrl = typeof imageUrlRaw === 'string' ? imageUrlRaw : null;
      
      // Use Published Date if available, otherwise use created_time or last_edited_time
      const publishedDateRaw = getProperty(page, ['Publish Date', 'Published Date', 'Published', 'Date']);
      const publishedAt = typeof publishedDateRaw === 'string' 
        ? publishedDateRaw 
        : page.created_time || page.last_edited_time || new Date().toISOString();
      
      // Estimate read time (default 5 minutes if not provided)
      const readTimeRaw = getProperty(page, ['Reading Time', 'Read Time', 'Minutes']);
      const readTime = typeof readTimeRaw === 'number' ? readTimeRaw : 5;
      
      // Use the Notion page ID as the content - this will be rendered by NotionBlogPostContent
      const content = page.id;
      
      // Map Topics/Tags to category slugs
      // Convert topic names to slugs by lowercasing and replacing spaces with hyphens
      const categories: string[] = tags.map(tag => 
        tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      );

      // Get status (for admins to see all statuses, non-admins only see published)
      const status = getProperty(page, ['Status', 'status']) as string | null;
      const statusValue = status || 'published';
      
      return {
        id: page.id,
        title,
        excerpt,
        content, // Notion page ID
        author,
        publishedAt,
        tags,
        readTime,
        imageUrl: imageUrl || undefined,
        featured: Boolean(featured),
        categories,
        // Note: BlogPost interface doesn't include status, but we'll add it to the response
        // for the store to use when transforming to Post format
        status: statusValue
      } as BlogPost & { status: string };
      })
      .filter((post): post is BlogPost & { status: string } => post !== null);

    // Ensure blogPosts is always an array
    const finalBlogPosts: Array<BlogPost & { status: string }> = Array.isArray(blogPosts) ? blogPosts : [];

    console.log('[Notion API] Returning', finalBlogPosts.length, 'blog posts');
    
    // Log featured posts count for debugging
    const featuredCount = finalBlogPosts.filter(p => p.featured === true).length;
    console.log('[Notion API] Featured posts:', featuredCount, 'out of', finalBlogPosts.length);
    if (featuredCount > 0) {
      console.log('[Notion API] Featured post titles:', finalBlogPosts.filter(p => p.featured === true).map(p => p.title));
    }

    return NextResponse.json(finalBlogPosts);
  } catch (error) {
    console.error('Error fetching Notion blog posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch blog posts from Notion', details: errorMessage },
      { status: 500 }
    );
  }
}