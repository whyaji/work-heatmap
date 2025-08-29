import { and, eq, like, notLike } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../db/database';
import { userSchema } from '../db/schema/schema';
import authMiddleware from '../middleware/jwt';

export const getUsersAvailable = async (currentUserId: number) => {
  const currentUsers = await db.select().from(userSchema).where(eq(userSchema.id, currentUserId));

  const currentUser = currentUsers[0];

  if (currentUsers.length === 0 || !currentUser || !currentUser.username) {
    return [];
  }

  const conditions = [];

  const isAdmin = currentUser.username === 'adm@da' || currentUser.username === 'adm.it';

  const isSuperiorQC =
    currentUser.username.toLowerCase().includes('qc') &&
    currentUser.username.toLowerCase().includes('askep') &&
    currentUser.dept_id === null;

  const isSuperiorEstate = !currentUser.username.toLowerCase().includes('qc');

  if (!isAdmin) {
    if (isSuperiorQC) {
      conditions.push(like(userSchema.username, '%qc%'));
    } else if (isSuperiorEstate) {
      conditions.push(notLike(userSchema.username, '%qc%'));
    } else {
      return currentUsers;
    }
  }

  const users = await db
    .select()
    .from(userSchema)
    .where(and(...conditions));
  return users;
};

export const userRoute = new Hono().use(authMiddleware).get('/available', async (c) => {
  const payload = c.get('jwtPayload');
  const currentUserId = payload?.userId;

  if (!currentUserId || isNaN(Number(currentUserId))) {
    return c.json({ message: 'User not found' }, 404);
  }

  const users = await getUsersAvailable(Number(currentUserId));
  return c.json({ data: users });
});
