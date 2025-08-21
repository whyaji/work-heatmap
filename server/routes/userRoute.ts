import { Hono } from 'hono';

import { db } from '../db/database';
import { userSchema } from '../db/schema/schema';
import authMiddleware from '../middleware/jwt';

export const userRoute = new Hono().use(authMiddleware).get('/', async (c) => {
  const users = await db.select().from(userSchema);
  return c.json({ data: users });
});
