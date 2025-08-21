import { zValidator } from '@hono/zod-validator';
import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';

import { db } from '../db/database';
import { coordinateHistorySchema, userSchema } from '../db/schema/schema';
import authMiddleware from '../middleware/jwt';

const querySchema = z.object({
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(100),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().transform(Number).optional(),
});

export const coordinateHistoryRoute = new Hono()
  .use(authMiddleware)
  .get('/', zValidator('query', querySchema), async (c) => {
    const { page, limit, startDate, endDate, userId } = c.req.valid('query');

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (startDate) {
      conditions.push(gte(coordinateHistorySchema.timestamp, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(coordinateHistorySchema.timestamp, new Date(endDate)));
    }

    if (userId) {
      conditions.push(eq(coordinateHistorySchema.user_id, userId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(coordinateHistorySchema)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;

    // Get coordinate histories with pagination
    const coordinateHistories = await db
      .select({
        id: coordinateHistorySchema.id,
        user_id: coordinateHistorySchema.user_id,
        timestamp: coordinateHistorySchema.timestamp,
        lat: coordinateHistorySchema.lat,
        lon: coordinateHistorySchema.lon,
        accuracy: coordinateHistorySchema.accuracy,
        speed: coordinateHistorySchema.speed,
        bearing: coordinateHistorySchema.bearing,
        activity: coordinateHistorySchema.activity,
        battery: coordinateHistorySchema.battery,
        network: coordinateHistorySchema.network,
        provider: coordinateHistorySchema.provider,
        inside_geofence: coordinateHistorySchema.inside_geofence,
        h3index: coordinateHistorySchema.h3index,
        created_at: coordinateHistorySchema.created_at,
        updated_at: coordinateHistorySchema.updated_at,
        user: {
          id: userSchema.id,
          username: userSchema.username,
          nama: userSchema.nama,
          jabatan: userSchema.jabatan,
        },
      })
      .from(coordinateHistorySchema)
      .leftJoin(userSchema, eq(coordinateHistorySchema.user_id, userSchema.id))
      .where(whereClause)
      .orderBy(desc(coordinateHistorySchema.timestamp))
      .limit(limit)
      .offset(offset);

    return c.json({
      data: coordinateHistories,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  });
