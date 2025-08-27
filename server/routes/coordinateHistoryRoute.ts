import { zValidator } from '@hono/zod-validator';
import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import { cellArea, cellToLatLng, getResolution, latLngToCell } from 'h3-js';
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
  north: z.string().optional(),
  south: z.string().optional(),
  east: z.string().optional(),
  west: z.string().optional(),
});

export const coordinateHistoryRoute = new Hono()
  .use(authMiddleware)
  .get('/', zValidator('query', querySchema), async (c) => {
    const { page, limit, startDate, endDate, userId, north, south, east, west } =
      c.req.valid('query');

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

    if (north && south && east && west) {
      conditions.push(
        and(
          gte(coordinateHistorySchema.lat, south),
          lte(coordinateHistorySchema.lat, north),
          gte(coordinateHistorySchema.lon, west),
          lte(coordinateHistorySchema.lon, east)
        )
      );
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
  })
  .get(
    '/h3-index',
    zValidator(
      'query',
      z.object({
        ...querySchema.shape,
        resolution: z.string().transform(Number).default(10),
      })
    ),
    async (c) => {
      const { page, limit, startDate, endDate, userId, north, south, east, west, resolution } =
        c.req.valid('query');

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

      if (north && south && east && west) {
        conditions.push(
          and(
            gte(coordinateHistorySchema.lat, south),
            lte(coordinateHistorySchema.lat, north),
            gte(coordinateHistorySchema.lon, west),
            lte(coordinateHistorySchema.lon, east)
          )
        );
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
        })
        .from(coordinateHistorySchema)
        .leftJoin(userSchema, eq(coordinateHistorySchema.user_id, userSchema.id))
        .where(whereClause)
        .orderBy(desc(coordinateHistorySchema.timestamp))
        .limit(limit)
        .offset(offset);

      // Process H3 index data
      const h3Data = coordinateHistories.map((record) => {
        const h3Index = latLngToCell(Number(record.lat), Number(record.lon), resolution);
        const h3Center = cellToLatLng(h3Index);
        const h3Resolution = getResolution(h3Index);
        const h3Area = cellArea(h3Index, 'km2');

        return {
          ...record,
          h3: {
            index: h3Index,
            center: {
              lat: h3Center[0],
              lon: h3Center[1],
            },
            resolution: h3Resolution,
            area: h3Area,
          },
        };
      });

      const userIds = new Set<number>();

      // Group by H3 index for aggregation
      const h3Aggregated = h3Data.reduce(
        (acc, record) => {
          const h3Index = record.h3.index;

          if (!acc[h3Index]) {
            acc[h3Index] = {
              h3Index,
              center: record.h3.center,
              count: 0,
              users: new Set<number>(),
              firstSeen: record.timestamp,
              lastSeen: record.timestamp,
              coordinates: [],
            };
          }

          acc[h3Index].count++;
          acc[h3Index].users.add(record.user_id);
          userIds.add(record.user_id);
          acc[h3Index].firstSeen = new Date(
            Math.min(
              new Date(acc[h3Index].firstSeen).getTime(),
              new Date(record.timestamp).getTime()
            )
          );
          acc[h3Index].lastSeen = new Date(
            Math.max(
              new Date(acc[h3Index].lastSeen).getTime(),
              new Date(record.timestamp).getTime()
            )
          );
          acc[h3Index].coordinates.push({
            lat: Number(record.lat),
            lon: Number(record.lon),
            timestamp: record.timestamp,
            userId: record.user_id,
          });

          return acc;
        },
        {} as Record<
          string,
          {
            h3Index: string;
            center: { lat: number; lon: number };
            resolution?: number;
            area?: number;
            count: number;
            users: Set<number>;
            firstSeen: Date;
            lastSeen: Date;
            coordinates: Array<{
              lat: number;
              lon: number;
              timestamp: Date;
              userId: number;
              username?: string;
            }>;
          }
        >
      );

      // Convert to array and format
      const h3Summary = Object.values(h3Aggregated).map((h3Cell) => ({
        h3Index: h3Cell.h3Index,
        center: h3Cell.center,
        resolution: h3Cell.resolution,
        area: h3Cell.area,
        count: h3Cell.count,
        uniqueUsers: h3Cell.users.size,
        firstSeen: h3Cell.firstSeen,
        lastSeen: h3Cell.lastSeen,
      }));

      return c.json({
        data: h3Summary,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1,
        },
        h3Stats: {
          totalH3Cells: h3Summary.length,
          totalCoordinates: totalCount,
          totalUniqueUsers: userIds.size,
          averageCoordinatesPerCell: totalCount / h3Summary.length || 0,
        },
      });
    }
  );
