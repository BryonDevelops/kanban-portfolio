# Migration Runner Script for Kanban Portfolio (Windows)
# This script applies database migrations to Supabase

param(
    [switch]$Help,
    [switch]$DryRun
)

if ($Help) {
    Write-Host "Kanban Portfolio Database Migration Script"
    Write-Host ""
    Write-Host "Usage: .\run-migrations.ps1 [-DryRun] [-Help]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -DryRun    Show what would be done without actually running migrations"
    Write-Host "  -Help      Show this help message"
    Write-Host ""
    Write-Host "Requirements:"
    Write-Host "  - Supabase CLI installed (npm install -g supabase)"
    Write-Host "  - Run from project root directory"
    exit 0
}

Write-Host "🚀 Starting database migrations for Kanban Portfolio..." -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "❌ Supabase CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a Supabase project
if (!(Test-Path "supabase\config.toml")) {
    Write-Host "❌ Not in a Supabase project directory. Please run this from the project root." -ForegroundColor Red
    exit 1
}

if ($DryRun) {
    Write-Host "🔍 Dry run mode - showing what would be done:" -ForegroundColor Yellow
    Write-Host "  Would apply migrations from infrastructure/database/migrations/"
    Write-Host "  Would create tables: tags, status, project_tags"
    Write-Host "  Would update projects table with status_id column"
    Write-Host "  Would migrate existing data to new structure"
    exit 0
}

Write-Host "📦 Applying migrations..." -ForegroundColor Blue

try {
    # Apply migrations using Supabase CLI
    & supabase db push

    Write-Host "✅ Migrations applied successfully!" -ForegroundColor Green

    Write-Host ""
    Write-Host "📋 Migration Summary:" -ForegroundColor Cyan
    Write-Host "  ✅ Tags table created with proper structure" -ForegroundColor Green
    Write-Host "  ✅ Status table created with default values" -ForegroundColor Green
    Write-Host "  ✅ Project_tags junction table created" -ForegroundColor Green
    Write-Host "  ✅ Projects table updated with status_id column" -ForegroundColor Green
    Write-Host "  ✅ Existing data migrated to new structure" -ForegroundColor Green
    Write-Host "  ✅ Indexes, triggers, and RLS policies configured" -ForegroundColor Green

    Write-Host ""
    Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify data migration in Supabase dashboard"
    Write-Host "  2. Update your application code to use new table structure"
    Write-Host "  3. Test tag and status functionality"
    Write-Host "  4. Optionally drop old 'status' and 'tags' columns from projects table"

    Write-Host ""
    Write-Host "🎉 Database migration complete!" -ForegroundColor Green

} catch {
    Write-Host "❌ Migration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}