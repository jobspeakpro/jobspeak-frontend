#!/usr/bin/env node

/**
 * CRITICAL: Manual Migration Required
 * 
 * This migration CANNOT be applied programmatically via Supabase JS client.
 * The Supabase client does not support executing ALTER TABLE commands.
 * 
 * IMMEDIATE ACTION REQUIRED:
 * 
 * 1. Go to: https://supabase.com/dashboard
 * 2. Select your JobSpeakPro project
 * 3. Navigate to: SQL Editor (left sidebar)
 * 4. Click "New Query"
 * 5. Paste the SQL below
 * 6. Click "Run" (or press Cmd/Ctrl + Enter)
 * 7. Verify success message appears
 * 8. Run: node verify_migration.mjs (to confirm)
 * 
 * MIGRATION SQL:
 */

const MIGRATION_SQL = `
-- Add heard_about_us column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS heard_about_us TEXT;

-- Add documentation
COMMENT ON COLUMN profiles.heard_about_us IS 'Tracks how the user heard about JobSpeakPro. Possible values: TikTok, YouTube, Discord, Twitter/X, Facebook, Friend / Referral, School / Teacher, Google Search, Reddit / Forum, Other, skipped';

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_profiles_heard_about_us 
ON profiles(heard_about_us);

-- Verify the column was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'heard_about_us';
`.trim();

console.log('');
console.log('═'.repeat(80));
console.log('  MANUAL MIGRATION REQUIRED');
console.log('═'.repeat(80));
console.log('');
console.log('⚠️  The Supabase JS client cannot execute ALTER TABLE commands.');
console.log('   This migration must be run manually in the Supabase Dashboard.');
console.log('');
console.log('📋 STEPS:');
console.log('');
console.log('1. Open: https://supabase.com/dashboard');
console.log('2. Select your JobSpeakPro project');
console.log('3. Click: SQL Editor (left sidebar)');
console.log('4. Click: "New Query"');
console.log('5. Paste the SQL below');
console.log('6. Click: "Run" (or Cmd/Ctrl + Enter)');
console.log('7. Verify: Success message appears');
console.log('8. Run: node verify_migration.mjs');
console.log('');
console.log('─'.repeat(80));
console.log('MIGRATION SQL:');
console.log('─'.repeat(80));
console.log('');
console.log(MIGRATION_SQL);
console.log('');
console.log('─'.repeat(80));
console.log('');
console.log('After running the SQL, execute:');
console.log('  node verify_migration.mjs');
console.log('');
console.log('This will confirm the migration was successful.');
console.log('');
