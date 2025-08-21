import { Hono } from 'hono';

import { db } from '../db/database';
import { coordinateHistorySchema } from '../db/schema/schema';
import authMiddleware from '../middleware/jwt';

interface CoordinateHistory {
  id: string;
  userId: number;
  timestamp: string;
  lat: number;
  lon: number;
  accuracy: number;
  speed: number;
  bearing: number;
  activity: string;
  battery: number;
  network: string;
  provider: string;
  insideGeofence: boolean;
  h3Index: string;
  createdAt: string;
}

export const massUploadRoute = new Hono()
  .use(authMiddleware)
  .post('/coordinate-history', async (c) => {
    try {
      //   body is array of CoordinateHistory
      const payload = c.get('jwtPayload');
      const userId = payload?.userId;
      const body: CoordinateHistory[] = await c.req.json();

      //   insert value to db
      const result = await db.insert(coordinateHistorySchema).values(
        body.map((item) => ({
          id: item.id,
          userId: userId,
          timestamp: new Date(item.timestamp),
          lat: item.lat.toString(),
          lon: item.lon.toString(),
          accuracy: parseInt((item.accuracy ?? 0).toString()),
          speed: item.speed.toString(),
          bearing: item.bearing,
          activity: item.activity,
          battery: item.battery,
          network: item.network,
          provider: item.provider,
          insideGeofence: item.insideGeofence,
          h3Index: item.h3Index,
          createdAt: new Date(item.createdAt),
        }))
      );

      return c.json({ success: true, message: 'Data inserted successfully', data: result });
    } catch (error) {
      return c.json({ success: false, message: 'Failed to insert data', data: error }, 500);
    }
  });
