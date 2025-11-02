# Notion Integration Setup

This project now uses Notion API for querying and `react-notion-x` for rendering blog posts.

## Setup Instructions

### 1. Create a Notion Integration

1. Go to [Notion's My Integrations page](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Fill in:
   - **Name**: Your integration name (e.g., "Blog Portfolio")
   - **Workspace**: Select your workspace
   - **Type**: Internal
4. Click **"Submit"** to create the integration
5. Copy the **Internal Integration Token** (starts with `secret_`)

### 2. Create a Notion Database

1. In Notion, create a new database for your blog posts
2. Add the following properties to your database:
   - **Title** (Title property) - The blog post title
   - **Status** (Status property) - Values: "Published", "In Review", "Draft"
   - **Topics** (Multi-select property) - Tags/topics for the post
   - **Publish Date** (Date property) - Publication date
   - **Reading Time** (Number property) - Minutes to read
   - **Featured Image URL** (URL property) - Optional cover image URL
   - **Word Count** (Number property) - Optional word count

3. Share the database with your integration:
   - Open the database page
   - Click **"Share"** (top right)
   - Search for your integration name
   - Click to add it

### 3. Get Your Database ID

1. Open your Notion database in a browser
2. The URL will look like: `https://www.notion.so/your-workspace/DATABASE_ID?v=...`
3. Copy the **DATABASE_ID** (32-character string, may have dashes)

### 4. Set Environment Variables

Add these to your `.env.local` file:

```bash
# Notion API Configuration
NOTION_API_KEY=secret_your_integration_token_here
NEXT_PUBLIC_NOTION_DATABASE_ID=your-database-id-here
```

### 5. Usage

#### Querying Published Pages

```typescript
import { useNotionQuery } from '@/presentation/hooks/use-notion-query'

const { pages, isLoading, error } = useNotionQuery({
  databaseId: process.env.NEXT_PUBLIC_NOTION_DATABASE_ID || '',
  filterProperty: 'Status',
  filterValue: 'Published'
})
```

#### Rendering a Notion Page

```typescript
import { NotionBlogPostContent } from '@/presentation/components/features/microblog/NotionBlogPostContent'

<NotionBlogPostContent notionPageId="your-page-id" />
```

#### Selecting a Notion Page

```typescript
import { NotionPageSelector } from '@/presentation/components/shared/notion-page-selector'

<NotionPageSelector
  databaseId={process.env.NEXT_PUBLIC_NOTION_DATABASE_ID || ''}
  selectedPageId={pageId}
  onPageSelect={(id) => setPageId(id)}
  showPreview={true}
/>
```

## API Routes

### `/api/notion`

Query Notion data through the API:

- `GET /api/notion?action=query&databaseId=xxx` - Query database
- `GET /api/notion?action=render&pageId=xxx` - Get page for rendering
- `GET /api/notion?action=page&pageId=xxx` - Get page metadata
- `GET /api/notion?action=blocks&pageId=xxx` - Get page blocks

## Blog Post Content Format

Blog posts now store Notion page IDs in the `content` field instead of HTML. The system automatically detects whether content is:
- A Notion page ID (32-character hex string)
- Traditional HTML/Markdown content

## Migration from TipTap

All TipTap dependencies have been removed. The blog system now:
- Uses Notion pages as the content source
- Renders with `react-notion-x` for high-fidelity Notion rendering
- Queries published pages using the official Notion API

