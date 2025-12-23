// This file is required for Next.js Pages Router
// It initializes Sentry on the client side

import '../sentry.client.config';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Your App component would go here
// For now, this file ensures Sentry is initialized on the client
export default function App({ Component, pageProps }: any) {
  const router = useRouter();

  // TEMPORARY: Test error for Sentry verification
  // Remove this useEffect block after verifying Sentry is working
  // To test: Add ?sentry_test=true to any URL (e.g., /?sentry_test=true)
  useEffect(() => {
    if (typeof window !== 'undefined' && router.query.sentry_test === 'true') {
      throw new Error('Sentry test error - Client-side test. This is a temporary test to verify Sentry integration is working correctly. Please remove this test code after verification.');
    }
  }, [router.query]);

  return <Component {...pageProps} />;
}

