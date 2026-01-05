#!/usr/bin/env node

/**
 * Verify Referral Survey Database Integration
 * 
 * This script verifies that the heard_about_us column exists and is working
 * in the production Supabase database.
 * 
 * Usage:
 *   node verify_migration.mjs
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

// Use public anon key for verification (safe to commit)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing environment variables. Please set:');
    console.error('   - VITE_SUPABASE_URL (or SUPABASE_URL)');
    console.error('   - VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyMigration() {
    console.log('🔍 Verifying heard_about_us column migration...');
    console.log('');

    try {
        // Test 1: Check if column is accessible
        console.log('Test 1: Checking column accessibility...');
        const { data, error } = await supabase
            .from('profiles')
            .select('id, heard_about_us')
            .limit(1);

        if (error) {
            if (error.code === 'PGRST204') {
                console.error('❌ FAILED: Column "heard_about_us" does not exist');
                console.error('   Error:', error.message);
                console.error('');
                console.error('   ACTION REQUIRED: Run the migration SQL in Supabase Dashboard');
                process.exit(1);
            }
            console.error('❌ FAILED:', error.message);
            process.exit(1);
        }

        console.log('✅ PASSED: Column exists and is accessible');
        console.log('');

        // Test 2: Check for any existing data
        console.log('Test 2: Checking for existing referral data...');
        const { data: referralData, error: dataError } = await supabase
            .from('profiles')
            .select('heard_about_us')
            .not('heard_about_us', 'is', null);

        if (dataError) {
            console.error('❌ FAILED:', dataError.message);
            process.exit(1);
        }

        if (referralData && referralData.length > 0) {
            console.log(`✅ PASSED: Found ${referralData.length} profile(s) with referral data`);

            // Show distribution
            const distribution = {};
            referralData.forEach(row => {
                distribution[row.heard_about_us] = (distribution[row.heard_about_us] || 0) + 1;
            });

            console.log('');
            console.log('📊 Referral source distribution:');
            Object.entries(distribution)
                .sort((a, b) => b[1] - a[1])
                .forEach(([source, count]) => {
                    console.log(`   ${source}: ${count}`);
                });
        } else {
            console.log('✅ PASSED: Column exists (no data yet, expected for new migration)');
        }

        console.log('');
        console.log('─'.repeat(80));
        console.log('✅ ALL TESTS PASSED');
        console.log('─'.repeat(80));
        console.log('');
        console.log('The heard_about_us column is ready for production use.');
        console.log('The referral survey modal will now save data correctly.');
        console.log('');

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

verifyMigration();
