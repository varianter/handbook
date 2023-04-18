import type { NextApiRequest, NextApiResponse } from 'next';
import { queryOpenai } from 'src/search/openai-data';
import rateLimit from 'src/utils/ratelimit';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // ratelimit 40 in the minute, will do
  try {
    await limiter.check(res, 40, 'OPENAI_API');
  } catch {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  try {
    const result = await queryOpenai(getQuery(req.query.query));
    res.status(200).json({ result });
  } catch (e) {
    console.error('Unable to retrieve OpenAI result:', e);
    res.status(404).json({ error: 'Not found' });
  }
}

function getQuery(input: string | string[] | undefined): string {
  if (!input || (Array.isArray(input) && !input[0]))
    return 'Kom ikke på noe spørsmål å stille.';
  if (Array.isArray(input)) return input[0];
  return input;
}
