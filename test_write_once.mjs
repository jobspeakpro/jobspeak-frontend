#!/usr/bin/env node

/**
 * Test write-once semantics for heard_about_us field
 * This script verifies that the field can be set once but not overwritten
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

const TEST_ACCOUNTS = [
    { email: 'jsp.qa.001@jobspeakpro-test.local', password: 'jsp.qa.001@jobspeakpro-test.local' },
    { email: 'jsp.qa.002@jobspeakpro-test.local', password: 'jsp.qa.002@jobspeakpro-test.local' }
];

async function testWriteOnce() {
    console.log('🧪 Testing write-once semantics for heard_about_us field');
    console.log('');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    for (const account of TEST_ACCOUNTS) {
        console.log(`Testing: ${account.email}`);
        console.log('─'.repeat(80));

        // Login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: account.email,
            password: account.password
        });

        if (authError) {
            console.error('❌ Login failed:', authError.message);
            continue;
        }

        const userId = authData.user.id;
        console.log(`✅ Logged in. User ID: ${userId.substring(0, 8)}...`);

        // Check current value
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('heard_about_us')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('❌ Failed to fetch profile:', fetchError.message);
            continue;
        }

        console.log(`Current value: ${profile.heard_about_us || 'null'}`);

        // Test 1: Set value if null
        if (!profile.heard_about_us) {
            console.log('Test 1: Setting initial value to "Discord"...');
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ heard_about_us: 'Discord' })
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Failed to set value:', updateError.message);
            } else {
                console.log('✅ Value set successfully');
            }

            // Verify it was set
            const { data: updated } = await supabase
                .from('profiles')
                .select('heard_about_us')
                .eq('id', userId)
                .single();

            console.log(`Verified value: ${updated.heard_about_us}`);
        }

        // Test 2: Attempt to overwrite (should fail or be ignored)
        console.log('Test 2: Attempting to overwrite with "TikTok"...');
        const { error: overwriteError } = await supabase
            .from('profiles')
            .update({ heard_about_us: 'TikTok' })
            .eq('id', userId);

        if (overwriteError) {
            console.log('✅ Overwrite blocked by database constraint');
        } else {
            // Check if value actually changed
            const { data: final } = await supabase
                .from('profiles')
                .select('heard_about_us')
                .eq('id', userId)
                .single();

            if (final.heard_about_us === 'Discord') {
                console.log('✅ Write-once enforced: Value unchanged');
            } else {
                console.log(`⚠️  Value was overwritten to: ${final.heard_about_us}`);
                console.log('   (Write-once may need backend enforcement)');
            }
        }

        await supabase.auth.signOut();
        console.log('');
    }
}

testWriteOnce().catch(console.error);
