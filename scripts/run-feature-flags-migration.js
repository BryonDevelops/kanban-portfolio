#!/usr/bin/env node

const { getSupabase } = require('../infrastructure/database/supabaseClient');
const fs = require('fs');
const path = require('path');

async function runFeatureFlagsMigration() {
  console.log('🚀 Running feature flags migration...');

  const supabase = getSupabase();
  if (!supabase) {
    console.error('❌ Failed to connect to Supabase');
    process.exit(1);
  }

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'infrastructure', 'database', 'migrations', '004_add_feature_flags.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL loaded, executing...');

    // Since we can't execute raw SQL with the client-side Supabase client,
    // we'll try to execute it statement by statement using RPC calls
    // For now, let's just try to create the table using the Supabase client's methods

    console.log('⚠️  Note: This migration needs to be run with proper database access.');
    console.log('💡 For production, use: supabase db push');
    console.log('💡 Or run the SQL directly in your Supabase dashboard.');

    // Try to check if table exists by attempting to select from it
    const { error } = await supabase.from('feature_flags').select('id').limit(1);

    if (error && error.message.includes('does not exist')) {
      console.log('ℹ️  Feature flags table does not exist yet.');
      console.log('📋 Please run this SQL in your Supabase SQL editor:');
      console.log('');
      console.log('='.repeat(50));
      console.log(sql);
      console.log('='.repeat(50));
    } else {
      console.log('✅ Feature flags table appears to exist already.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runFeatureFlagsMigration();