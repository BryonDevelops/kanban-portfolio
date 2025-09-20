@echo off
REM Supabase Migration Runner for Windows
REM This script runs database migrations using the Supabase CLI

echo 🚀 Running Supabase Migration...
echo.

REM Check if supabase.exe exists
if not exist "supabase.exe" (
    echo ❌ Error: supabase.exe not found in current directory
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

REM Run the migration
.\supabase.exe db push

if %errorlevel% equ 0 (
    echo.
    echo ✅ Migration completed successfully!
    echo Your database schema is now up to date.
) else (
    echo.
    echo ❌ Migration failed. Please check the error messages above.
)

echo.
pause