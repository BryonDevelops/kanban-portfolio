import { Client, LogLevel } from '@notionhq/client';

/**
 * Notion API Client Configuration
 * 
 * Environment variables required:
 * - NOTION_API_KEY: Your Notion integration token
 * - NOTION_DATABASE_ID: The database ID to query for blog posts
 * 
 * Note: This file is server-only. The client is lazy-loaded to avoid
 * webpack bundling issues during static export.
 */
let _notionClient: Client | null = null;

/**
 * Get or create the Notion client instance (lazy initialization)
 * This ensures the client is only created when actually needed and
 * only in server-side contexts.
 */
function getNotionClient(): Client {
  // Only initialize once
  if (!_notionClient) {
    // Check if we're in a server context (has process.env)
    if (typeof process === 'undefined' || !process.env) {
      throw new Error('[Notion Client] Notion client can only be used in server-side contexts');
    }

    const apiKey = process.env.NOTION_API_KEY;
    
    if (!apiKey) {
      console.error('[Notion Client] NOTION_API_KEY is not set!');
      throw new Error('NOTION_API_KEY is required for Notion integration');
    }

    _notionClient = new Client({
      auth: apiKey,
      logLevel: LogLevel.DEBUG,
    });

    console.log('[Notion Client] Notion API client initialized with debug logging');
  }

  return _notionClient;
}

// Export getter function - call this instead of accessing notionClient directly
// For backward compatibility, we'll also export a getter that returns the client
export function getClient(): Client {
  return getNotionClient();
}

// For methods that need the client, use getClient() instead
// This ensures lazy initialization and prevents webpack bundling issues

/**
 * Get database metadata (schema/properties)
 * GET /v1/databases/{database_id}
 * Returns: Database object with properties, title, etc.
 */
export async function getNotionDatabase(databaseId: string) {
  try {
    if (!databaseId) {
      throw new Error('databaseId is required');
    }
    
    // Validate database ID format (should be a UUID, with or without dashes)
    const trimmedId = databaseId.trim();
    if (!trimmedId || trimmedId.length < 32) {
      throw new Error(`Invalid database ID format: "${databaseId}". Expected a 32-character UUID.`);
    }
    
    const formattedDatabaseId = trimmedId;
    console.log('[Notion Client] Getting database metadata for:', formattedDatabaseId);
    
    const client = getClient();
    
    // GET /v1/databases/{database_id} returns database metadata
    const response = await client.request({
      path: `databases/${formattedDatabaseId}`,
      method: 'get',
    });
    
    // Response structure:
    // {
    //   object: "database",
    //   id: "...",
    //   created_time: "...",
    //   last_edited_time: "...",
    //   title: [...],
    //   description: [...],
    //   properties: {
    //     "Property Name": { type: "...", ... }
    //   },
    //   ...
    // }
    
    return response as {
      object: string;
      id: string;
      created_time: string;
      last_edited_time: string;
      title: Array<{ type: string; plain_text?: string; text?: { content: string } }>;
      description?: Array<{ type: string; plain_text?: string }>;
      properties: Record<string, {
        id: string;
        type: string;
        name: string;
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    };
  } catch (error) {
    console.error('Error getting Notion database:', error);
    throw error;
  }
}

/**
 * Normalize Notion ID by removing dashes
 * Notion API expects UUIDs without dashes
 */
function normalizeNotionId(id: string): string {
  return id.replace(/-/g, '');
}

/**
 * Get a specific page by ID
 */
export async function getNotionPage(pageId: string) {
  try {
    const client = getClient();
    const normalizedPageId = normalizeNotionId(pageId);
    const response = await client.pages.retrieve({ page_id: normalizedPageId });
    return response;
  } catch (error) {
    console.error('Error retrieving Notion page:', error);
    throw error;
  }
}

export async function getPublishedPages(databaseId: string) {
  const client = getClient();
  const response = await client.databases.retrieve({
    database_id: databaseId,
  });

  console.log('[Notion API] Response:', response);

  return response;
}

/**
 * Get page content (blocks) for a Notion page
 */
export async function getNotionPageBlocks(pageId: string) {
  try {
    const client = getClient();
    const normalizedPageId = normalizeNotionId(pageId);
    const blocks = [];
    let cursor = undefined;

    do {
      const response = await client.blocks.children.list({
        block_id: normalizedPageId,
        start_cursor: cursor,
      });

      blocks.push(...response.results);
      cursor = response.next_cursor ?? undefined;
    } while (cursor);

    return blocks;
  } catch (error) {
    console.error('Error retrieving Notion page blocks:', error);
    throw error;
  }
}

/**
 * Helper to extract database title from Notion database response
 */
export function getDatabaseTitle(database: {
  title: Array<{ type: string; plain_text?: string; text?: { content: string } }>;
}): string {
  if (!database.title || database.title.length === 0) {
    return '';
  }
  
  const firstTitle = database.title[0];
  if (firstTitle.plain_text) {
    return firstTitle.plain_text;
  }
  if (firstTitle.text?.content) {
    return firstTitle.text.content;
  }
  
  return '';
}

/**
 * Helper to get all property names from a database
 */
export function getDatabasePropertyNames(database: {
  properties: Record<string, { id: string; type: string; name: string; [key: string]: unknown }>;
}): string[] {
  return Object.keys(database.properties || {});
}

/**
 * Helper to get a property definition from a database
 */
export function getDatabaseProperty(
  database: {
    properties: Record<string, { id: string; type: string; name: string; [key: string]: unknown }>;
  },
  propertyName: string
): { id: string; type: string; name: string; [key: string]: unknown } | null {
  return database.properties?.[propertyName] || null;
}

/**
 * Helper to extract property value from a Notion page
 */
export function getNotionProperty(page: { properties: Record<string, unknown> }, propertyName: string): string | string[] | boolean | number | null {
  const property = page.properties[propertyName] as { type: string; [key: string]: unknown } | undefined;
  if (!property || typeof property !== 'object' || !('type' in property)) return null;

  switch (property.type) {
    case 'title': {
      const titleArray = property.title as Array<{ plain_text?: string }> | undefined;
      return titleArray?.[0]?.plain_text || '';
    }
    case 'rich_text': {
      const richTextArray = property.rich_text as Array<{ plain_text?: string }> | undefined;
      return richTextArray?.[0]?.plain_text || '';
    }
    case 'select': {
      const select = property.select as { name?: string } | undefined;
      return select?.name || null;
    }
    case 'status': {
      const status = property.status as { name?: string } | undefined;
      return status?.name || null;
    }
    case 'checkbox': {
      return (property.checkbox as boolean) || false;
    }
    case 'date': {
      const date = property.date as { start?: string } | undefined;
      return date?.start || null;
    }
    case 'multi_select': {
      const multiSelect = property.multi_select as Array<{ name: string }> | undefined;
      return multiSelect ? multiSelect.map((item) => item.name) : [];
    }
    case 'url': {
      return (property.url as string | null) || null;
    }
    case 'number': {
      return (property.number as number | null) || null;
    }
    default:
      return null;
  }
}

