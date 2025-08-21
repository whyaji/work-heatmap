import { desc } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/database';
import { coordinateHistorySchema } from '../db/schema/schema';
import authMiddleware from '../middleware/jwt';

export const coordinateHistoryRoute = new Hono().use(authMiddleware).get('/', async (c) => {
  const coordinateHistories = await db
    .select()
    .from(coordinateHistorySchema)
    .orderBy(desc(coordinateHistorySchema.createdAt));
  return c.json(coordinateHistories);
});
