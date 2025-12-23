export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get('test') === 'true') {
    throw new Error('Sentry test error – app router');
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}
