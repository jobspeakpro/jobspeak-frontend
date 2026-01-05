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

const ACCOUNTS = [
    { email: 'jsp.qa.001@jobspeakpro-test.local', password: 'jsp.qa.001@jobspeakpro-test.local' },
    { email: 'jsp.qa.002@jobspeakpro-test.local', password: 'jsp.qa.002@jobspeakpro-test.local' },
    { email: 'jsp.qa.003@jobspeakpro-test.local', password: 'jsp.qa.003@jobspeakpro-test.local' }
];

async function resetAccounts() {
    console.log('🔄 Attempting to reset heard_about_us for test accounts...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    for (const acc of ACCOUNTS) {
        console.log(`\nUser: ${acc.email}`);

        // 1. Login
        const { data: auth, error: loginErr } = await supabase.auth.signInWithPassword({
            email: acc.email,
            password: acc.password
        });

        if (loginErr) {
            console.error(`❌ Login failed: ${loginErr.message}`);
            // Try signup if login fails? No, "Verified accounts" implies they exist.
            // But maybe 003 needs creation? 
            // I'll try to signup just in case login fails with "Invalid login credentials" is unlikely if they follow pattern.
            // If it fails, I'll skip.
            continue;
        }

        const userId = auth.user.id;
        console.log(`✅ Logged in (${userId})`);

        // 2. Reset to NULL
        const { error: updateErr } = await supabase
            .from('profiles')
            .update({ heard_about_us: null })
            .eq('id', userId);

        if (updateErr) {
            console.error(`❌ Reset failed: ${updateErr.message}`);
        } else {
            console.log(`✅ Reset to NULL successful`);
        }

        // 3. Verify
        const { data: verify } = await supabase
            .from('profiles')
            .select('heard_about_us')
            .eq('id', userId)
            .single();

        console.log(`   Current value: ${verify?.heard_about_us === null ? 'NULL (Ready)' : verify?.heard_about_us}`);

        await supabase.auth.signOut();
    }
}

resetAccounts();
