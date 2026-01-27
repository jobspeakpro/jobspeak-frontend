
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Manually load env from backend .env if possible or hardcode for this run (bad practice but effective for agent)
// I will not hardcode secrets. I will try to read ../jobspeak-backend/.env
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('../jobspeak-backend/.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) process.env[key.trim()] = val.trim();
    });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY; // Fallback? No, need service role for admin check usually.

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing ENV vars. Cannot verify DB.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestAffiliate() {
    console.log("Checking latest affiliate application...");
    const { data, error } = await supabase
        .from('affiliate_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    if (data && data.length > 0) {
        const row = data[0];
        console.log("Latest Row ID:", row.id);
        console.log("Payout Details:", row.payout_details);

        if (row.payout_details && row.payout_details.includes('mailersend:')) {
            console.log("PROOF SUCCESS: MailerSend status found in DB.");
        } else {
            console.log("PROOF FAILURE: No MailerSend status in DB.");
        }
    } else {
        console.log("No applications found.");
    }
}

checkLatestAffiliate();
