import { NextRequest, NextResponse } from 'next/server';
import { 
  getNotionPage, 
  getNotionPageBlocks,
  getNotionProperty, 
  getNotionDatabase
} from '../../../../infrastructure/external-apis/notion';
import { NotionAPI } from 'notion-client';

// Notion Client for react-notion-x (uses a different API)
const notion = new NotionAPI();

/**
 * GET /api/notion?action=query&databaseId=xxx
 * Query a Notion database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const databaseId = searchParams.get('databaseId');
    const pageId = searchParams.get('pageId');
    const filterProperty = searchParams.get('filterProperty');
    const filterValue = searchParams.get('filterValue');

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required (query, page, blocks, render)' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'query': {
        if (!databaseId) {
          return NextResponse.json(
            { error: 'databaseId is required for query action' },
            { status: 400 }
          );
        }

        const filter = filterProperty && filterValue ? {
          property: filterProperty,
          select: { equals: filterValue }
        } : undefined;

        const results = await getNotionDatabase(databaseId);
        
        // Extract data source ID from the database response
        const databaseWithDataSources = results as { data_sources?: Array<{ id: string }> };
        const dataSourceId = databaseWithDataSources.data_sources?.[0]?.id;

        return NextResponse.json({ dataSourceId });
      }

      case 'page': {
        if (!pageId) {
          return NextResponse.json(
            { error: 'pageId is required for page action' },
            { status: 400 }
          );
        }

        try {
          const page = await getNotionPage(pageId);
          return NextResponse.json({ page });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          // Check if it's a "not found" error
          if (errorMessage.includes('not found') || errorMessage.includes('object_not_found')) {
            return NextResponse.json(
              { error: `Page not found: ${pageId}`, details: errorMessage },
              { status: 404 }
            );
          }
          throw error; // Re-throw other errors to be handled by outer catch
        }
      }

      case 'blocks': {
        if (!pageId) {
          return NextResponse.json(
            { error: 'pageId is required for blocks action' },
            { status: 400 }
          );
        }

        try {
          const blocks = await getNotionPageBlocks(pageId);
          return NextResponse.json({ blocks });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          // Check if it's a "not found" error
          if (errorMessage.includes('not found') || errorMessage.includes('object_not_found')) {
            return NextResponse.json(
              { error: `Page not found: ${pageId}`, details: errorMessage },
              { status: 404 }
            );
          }
          throw error; // Re-throw other errors to be handled by outer catch
        }
      }

      case 'render': {
        // This fetches the full recordMap for react-notion-x
        // NOTE: notion-client requires pages to be publicly shared
        if (!pageId) {
          return NextResponse.json(
            { error: 'pageId is required for render action' },
            { status: 400 }
          );
        }

        try {
          // Notion API expects UUIDs without dashes
          const normalizedPageId = pageId.replace(/-/g, '');
          console.log('[Notion API] Attempting to render page:', normalizedPageId);
          
          const recordMap = await notion.getPage(normalizedPageId);
          console.log('[Notion API] Successfully fetched recordMap');
          return NextResponse.json({ recordMap });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('[Notion API] Error rendering page:', errorMessage);
          
          // Check if it's a "not found" error
          if (errorMessage.includes('not found') || errorMessage.includes('object_not_found') || errorMessage.includes('404')) {
            return NextResponse.json(
              { 
                error: `Page not found or not publicly accessible: ${pageId}`, 
                details: errorMessage,
                hint: 'The Notion page must be publicly shared for react-notion-x to render it. Go to Notion, open the page, click "Share" → "Share to web", and enable public access.'
              },
              { status: 404 }
            );
          }
          throw error; // Re-throw other errors to be handled by outer catch
        }
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Notion API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch from Notion', details: errorMessage },
      { status: 500 }
    );
  }
}

