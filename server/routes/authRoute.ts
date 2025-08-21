import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';

import { db } from '../db/database';
import { userSchema } from '../db/schema/schema';
import env from '../lib/env';

interface ResponseAuthApi {
  success: boolean;
  message: string;
  data: ResponseData;
}

interface ResponseData {
  user: ResponseUserType;
  token: string;
}

interface ResponseUserType {
  id: number;
  username: string;
  nama: string;
  jabatan: string;
  create_date: string;
  update_date: string | null;
  kemandoran: number;
  kemandoran_ppro: number;
  kemandoran_nama: string;
  kemandoran_kode: string | null;
}

// Enhanced token generation
async function generateAuthTokens(user: { id: number; username: string }) {
  const accessToken = await sign(
    {
      userId: user.id,
      username: user.username,
      type: 'access',
    },
    env.JWT_SECRET
  );
  return {
    accessToken,
  };
}
export const authRoute = new Hono().post('/login', async (c) => {
  try {
    // get username and password from body
    const { username, password } = await c.req.json();

    // call auth api
    const response = await fetch(`${env.AUTH_API_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return c.json({ error: 'Invalid username or password', response }, 401);
    }

    const data: ResponseAuthApi = await response.json();

    const responseDataUser = data.data.user;
    const dataUser = {
      id: responseDataUser.id,
      username: responseDataUser.username,
      nama: responseDataUser.nama,
      jabatan: responseDataUser.jabatan,
      kemandoran: responseDataUser.kemandoran,
      kemandoran_ppro: responseDataUser.kemandoran_ppro,
      kemandoran_nama: responseDataUser.kemandoran_nama,
      kemandoran_kode: responseDataUser.kemandoran_kode,
    };

    // check if user is found in database
    const users = await db.select().from(userSchema).where(eq(userSchema.id, dataUser.id));

    if (users.length === 0) {
      // insert user to database
      await db.insert(userSchema).values(dataUser);
    } else {
      // update user to database
      await db.update(userSchema).set(dataUser).where(eq(userSchema.id, dataUser.id));
    }

    const { accessToken } = await generateAuthTokens(dataUser);

    return c.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: dataUser,
          token: accessToken,
        },
      },
      200
    );
  } catch {
    return c.json({ error: 'Internal server error' }, 500);
  }
});
