
import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function
export default async function handler(req, res) {
    // CORS Handling (if needed, but usually handled by same-origin in simple proxy setups)
    // We can add simple CORS headers if we want to be safe
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Or specific domain
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' });
    }

    const { email, password, firstName, inviteCode } = req.body;

    if (!email || !password) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email and password required' });
    }

    // Check for Service Role Key
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL; // Try both
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[SIGNUP] Missing backend configuration (URL or Service Key)');
        return res.status(500).json({ code: 'CONFIG_ERROR', message: 'Server configuration error' });
    }

    try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // Create User via Admin API (bypasses default client rate limits usually, but has its own)
        const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: false, // Require email confirmation!
            user_metadata: {
                firstName: firstName || '',
                display_name: firstName || '', // Legacy
                inviteCode: inviteCode || '',
                accepted_terms: true
            }
        });

        if (error) {
            console.error('[SIGNUP] Supabase Admin Error:', error);

            // Error Mapping
            let code = 'UNKNOWN_ERROR';
            if (error.message?.includes('registered')) code = 'EMAIL_EXISTS';
            else if (error.message?.includes('weak password')) code = 'WEAK_PASSWORD';
            else if (error.message?.includes('rate limit')) code = 'RATE_LIMIT'; // Explicitly map to mitigate raw string leak

            // NEVER return raw error message strings to client
            return res.status(400).json({ code });
        }

        if (!user || !user.user) {
            console.error('[SIGNUP] User creation failed without error object');
            return res.status(500).json({ code: 'CREATION_FAILED' });
        }

        const createdUser = user.user;

        // QA / Debug Convenience
        let actionLink = null;
        // Inspect response for email action link if available in this context (sometimes admin.createUser returns it if email_confirm is false? No, mostly returns the user)
        // Actually, admin.createUser returns the user object. 
        // If we want the verification link, we usually need "generateLink" instead or use the invite API.
        // BUT user said: "if actionLink is returned...". Standard `createUser` might return it in `data` if auto-confirm is off?
        // Checking Supabase docs: admin.createUser returns User object.
        // admin.generateLink type='signup' returns action_link.
        // If we want the link for QA, we might need to call generateLink separately OR use generateLink INSTEAD of createUser?
        // But createUser is minimal.
        // Let's stick to createUser. If we can't get the link easily, we skip the button (QA requirement was "IF returned").

        // HOWEVER: For QA environments, sometimes we want generateLink.
        // Let's add a check: if process.env.QA_MODE === 'true', we might fetch a link?
        // For now, satisfy "IF returned". user.actionLength? No.
        // We will just return successful response structure.

        return res.status(200).json({
            success: true,
            email: createdUser.email,
            requiresEmailVerification: true
            // actionLink not trivially available from createUser plain call without email_confirm: true logic or generateLink
        });

    } catch (err) {
        console.error('[SIGNUP] Unexpected handler error:', err);
        return res.status(500).json({ code: 'INTERNAL_ERROR' });
    }
}
