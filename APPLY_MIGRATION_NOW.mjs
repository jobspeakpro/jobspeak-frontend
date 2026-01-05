#!/usr/bin/env node

/**
 * AUTOMATED DATABASE MIGRATION - heard_about_us Column
 * 
 * This script provides multiple methods to apply the migration.
 * Run with: node APPLY_MIGRATION_NOW.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
const envPath = join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const MIGRATION_SQL = `
-- Add heard_about_us column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS heard_about_us TEXT;

-- Add documentation
COMMENT ON COLUMN profiles.heard_about_us IS 'Tracks how the user heard about JobSpeakPro. Possible values: TikTok, YouTube, Discord, Twitter/X, Facebook, Friend / Referral, School / Teacher, Google Search, Reddit / Forum, Other, skipped';

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_profiles_heard_about_us 
ON profiles(heard_about_us);
`.trim();

console.log('');
console.log('═'.repeat(80));
console.log('  AUTOMATED MIGRATION SCRIPT - heard_about_us Column');
console.log('═'.repeat(80));
console.log('');

async function main() {
    // Step 1: Check current status
    console.log('Step 1: Checking if migration is needed...');
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('❌ Missing Supabase credentials in .env.local');
        console.error('   Cannot verify migration status.');
        showManualInstructions();
        process.exit(1);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase
        .from('profiles')
        .select('heard_about_us')
        .limit(1);

    if (!error) {
        console.log('✅ Migration already applied! Column exists.');
        console.log('');
        console.log('Running verification...');
        await runVerification();
        return;
    }

    if (error.code !== '42703' && error.code !== 'PGRST204') {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }

    console.log('⚠️  Migration needed. Column does not exist.');
    console.log('');

    // Step 2: Try to apply migration
    console.log('Step 2: Attempting to apply migration...');
    console.log('');

    // Method 1: Try Supabase CLI
    console.log('Method 1: Checking for Supabase CLI...');
    try {
        await execAsync('npx supabase --version');
        console.log('✅ Supabase CLI available');
        console.log('');
        console.log('To apply migration via CLI, run:');
        console.log('  npx supabase db push');
        console.log('');
    } catch (e) {
        console.log('⚠️  Supabase CLI not available');
    }

    // Method 2: Show manual instructions
    console.log('');
    showManualInstructions();
}

function showManualInstructions() {
    console.log('─'.repeat(80));
    console.log('MANUAL MIGRATION REQUIRED');
    console.log('─'.repeat(80));
    console.log('');
    console.log('The migration must be applied via Supabase Dashboard:');
    console.log('');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your JobSpeakPro project');
    console.log('3. Click: SQL Editor (left sidebar)');
    console.log('4. Click: "New Query"');
    console.log('5. Paste the SQL below');
    console.log('6. Click: "Run" (or Cmd/Ctrl + Enter)');
    console.log('7. Verify success message');
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
}

async function runVerification() {
    try {
        const { stdout } = await execAsync('node verify_migration.mjs');
        console.log(stdout);
    } catch (e) {
        console.log('Run: node verify_migration.mjs');
    }
}

main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
