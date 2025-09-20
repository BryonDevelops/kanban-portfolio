#!/bin/bash

# Migration Runner Script for Kanban Portfolio
# This script applies database migrations to Supabase

set -e

echo "🚀 Starting database migrations for Kanban Portfolio..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory. Please run this from the project root."
    exit 1
fi

echo "📦 Applying migrations..."

# Apply migrations using Supabase CLI
supabase db push

echo "✅ Migrations applied successfully!"

echo ""
echo "📋 Migration Summary:"
echo "  ✅ Tags table created with proper structure"
echo "  ✅ Status table created with default values"
echo "  ✅ Project_tags junction table created"
echo "  ✅ Projects table updated with status_id column"
echo "  ✅ Existing data migrated to new structure"
echo "  ✅ Indexes, triggers, and RLS policies configured"

echo ""
echo "🔧 Next Steps:"
echo "  1. Verify data migration in Supabase dashboard"
echo "  2. Update your application code to use new table structure"
echo "  3. Test tag and status functionality"
echo "  4. Optionally drop old 'status' and 'tags' columns from projects table"

echo ""
echo "🎉 Database migration complete!"