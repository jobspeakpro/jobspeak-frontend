import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.test === 'true') {
    throw new Error('Sentry test error – server side');
  }

  res.status(200).json({ ok: true });
}
