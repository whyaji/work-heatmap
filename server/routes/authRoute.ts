import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';

import { db } from '../db/database';
import { userAuthSchema, userSchema } from '../db/schema/schema';
import env from '../lib/env';
import { logger } from '../lib/logger';

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
  regional?: string;
  wilayah?: string;
  company?: string;
  company_abbr?: string;
  company_name?: string;
  dept_id?: string;
  dept_abbr?: string;
  dept_name?: string;
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

async function getLoginData(username: string, password: string) {
  // call auth api
  const response = await fetch(`${env.CMP_API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return {
      success: false,
      message: 'Invalid username or password',
      data: null,
      token: null,
    };
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
    regional: responseDataUser.regional,
    wilayah: responseDataUser.wilayah,
    company: responseDataUser.company,
    company_abbr: responseDataUser.company_abbr,
    company_name: responseDataUser.company_name,
    dept_id: responseDataUser.dept_id,
    dept_abbr: responseDataUser.dept_abbr,
    dept_name: responseDataUser.dept_name,
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

  const userAuth = await db
    .select()
    .from(userAuthSchema)
    .where(eq(userAuthSchema.user_id, dataUser.id));

  if (userAuth.length === 0) {
    // insert user auth to database
    await db.insert(userAuthSchema).values({ user_id: dataUser.id, cmp_token: data.data.token });
  } else {
    // update user auth to database
    await db
      .update(userAuthSchema)
      .set({ cmp_token: data.data.token })
      .where(eq(userAuthSchema.user_id, dataUser.id));
  }

  const { accessToken } = await generateAuthTokens(dataUser);

  return {
    success: true,
    message: 'Login successful',
    user: dataUser,
    token: accessToken,
  };
}

export const authRoute = new Hono()
  .post('/signin', async (c) => {
    try {
      // get username and password from body
      const {
        username,
        password,
        recaptchaToken,
      }: { username: string; password: string; recaptchaToken: string } = await c.req.json();

      if (!recaptchaToken) {
        return c.json({ error: 'Recaptcha token is required' }, 400);
      }

      if (process.env.NODE_ENV !== 'development') {
        const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: process.env.RECAPTCHA_SECRET_KEY || '',
            response: recaptchaToken,
          }),
        });

        const verifyResult = await verify.json();

        if (!verifyResult.success) {
          logger.error('Recaptcha verification failed:', verifyResult);
          return c.json(
            {
              message: 'Recaptcha verification failed.',
              status: verifyResult,
            },
            400
          );
        }
      }

      const loginData = await getLoginData(username, password);

      if (!loginData.success || !loginData.token || !loginData.user) {
        return c.json({ error: loginData.message }, 401);
      }

      return c.json(
        {
          success: true,
          message: loginData.message,
          data: {
            user: loginData.user,
            token: loginData.token,
          },
        },
        200
      );
    } catch {
      return c.json({ error: 'Internal server error' }, 500);
    }
  })
  .post('/login', async (c) => {
    try {
      // get username and password from body
      const { username, password } = await c.req.json();

      const loginData = await getLoginData(username, password);

      if (!loginData.success || !loginData.token || !loginData.user) {
        return c.json({ error: loginData.message }, 401);
      }

      return c.json(
        {
          success: true,
          message: loginData.message,
          data: {
            user: loginData.user,
            token: loginData.token,
          },
        },
        200
      );
    } catch {
      return c.json({ error: 'Internal server error' }, 500);
    }
  });
