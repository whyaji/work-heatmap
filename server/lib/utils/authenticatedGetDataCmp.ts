/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq } from 'drizzle-orm';
import { Context } from 'hono';
import { BlankInput } from 'hono/types';

import { db } from '../../db/database';
import { userAuthSchema } from '../../db/schema/schema';
import env from '../env';

const cmpGetDataApiUrl = env.CMP_API_URL + '/cmpmain/getData';

export const remapKeyResponse = (data: any): { data: any[]; total: number } => {
  return {
    data: data.data,
    total: data.count,
  };
};

export const authenticatedGetDataCmp = async ({
  c,
  body,
}: {
  c: Context<object, any, BlankInput>;
  body: any;
}) => {
  const payload = c.get('jwtPayload');
  const userId = payload?.userId;
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const userAuth = await db.select().from(userAuthSchema).where(eq(userAuthSchema.user_id, userId));
  if (userAuth.length === 0) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const cmpToken = userAuth[0].cmp_token;
  const response = await fetch(cmpGetDataApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cmpToken}`,
    },
    body: JSON.stringify(body),
  });
  return response;
};
