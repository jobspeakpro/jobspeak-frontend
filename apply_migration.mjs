#!/usr/bin/env node

/**
 * Apply heard_about_us Migration to Production
 * 
 * This script applies the migration by creating a Supabase function that executes
 * the ALTER TABLE command, then verifies it worked.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚀 Applying heard_about_us migration to production...');
console.log('');

async function applyMigration() {
    try {
        // First, check if column already exists
        console.log('Step 1: Checking if column already exists...');
        const { data: testData, error: testError } = await supabase
            .from('profiles')
            .select('heard_about_us')
            .limit(1);

        if (!testError) {
            console.log('✅ Column already exists! Migration not needed.');
            console.log('');
            await verifyMigration();
            return;
        }

        if (testError.code !== 'PGRST204') {
            console.error('❌ Unexpected error:', testError);
            process.exit(1);
        }

        console.log('⚠️  Column does not exist. Attempting to apply migration...');
        console.log('');

        // Try to use Supabase RPC to execute the migration
        // Note: This requires a database function to be created first
        console.log('Step 2: Applying migration via SQL...');
        console.log('');
        console.log('⚠️  IMPORTANT: The Supabase JS client cannot directly execute ALTER TABLE.');
        console.log('');
        console.log('The migration SQL must be run in Supabase Dashboard → SQL Editor:');
        console.log('');
        console.log('─'.repeat(80));
        console.log(`
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS heard_about_us TEXT;

COMMENT ON COLUMN profiles.heard_about_us IS 'Tracks how the user heard about JobSpeakPro';

CREATE INDEX IF NOT EXISTS idx_profiles_heard_about_us 
ON profiles(heard_about_us);
    `.trim());
        console.log('');
        console.log('─'.repeat(80));
        console.log('');
        console.log('📋 Copy the SQL above and run it in Supabase Dashboard.');
        console.log('   URL: https://supabase.com/dashboard/project/_/sql');
        console.log('');
        console.log('After running the SQL, this script will verify the migration.');
        console.log('');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

async function verifyMigration() {
    console.log('🔍 Verifying migration...');

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, heard_about_us')
            .limit(1);

        if (error) {
            if (error.code === 'PGRST204') {
                console.error('❌ Migration not applied yet. Column still missing.');
                process.exit(1);
            }
            console.error('❌ Verification failed:', error.message);
            process.exit(1);
        }

        console.log('✅ Migration verified! Column exists and is accessible.');
        console.log('');

        // Check for existing data
        const { data: existingData } = await supabase
            .from('profiles')
            .select('heard_about_us')
            .not('heard_about_us', 'is', null);

        if (existingData && existingData.length > 0) {
            console.log(`📊 Found ${existingData.length} profile(s) with referral data`);
        } else {
            console.log('📊 No referral data yet (expected for new migration)');
        }

        console.log('');
        console.log('✅ Migration complete! Referral survey is ready for production.');

    } catch (error) {
        console.error('❌ Verification error:', error.message);
        process.exit(1);
    }
}

applyMigration();
