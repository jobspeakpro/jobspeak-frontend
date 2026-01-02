import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export default function Callback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying...');
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase handles the code exchange automatically via the URL fragments
                // We just need to check if we have a session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session) {
                    setStatus('Welcome! Your email is verified.');
                    setIsVerified(true);

                    // Auto-redirect after 7 seconds
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 7000);
                } else {
                    setStatus('Verification complete — please sign in.');
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setStatus('Verification issue. Please try signing in.');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl">mark_email_read</span>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {status}
                </h1>

                {isVerified && (
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            Redirecting to dashboard in a few seconds...
                        </p>

                        <button
                            onClick={() => window.open('/dashboard', '_blank')}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors w-full"
                        >
                            <span>Continue to Dashboard</span>
                            <span className="material-symbols-outlined">open_in_new</span>
                        </button>
                    </div>
                )}

                {!isVerified && status.includes('sign in') && (
                    <button
                        onClick={() => navigate('/signin')}
                        className="mt-4 px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Sign In
                    </button>
                )}
            </div>
        </div>
    );
}
