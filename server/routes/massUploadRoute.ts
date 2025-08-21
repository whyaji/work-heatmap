import { Hono } from 'hono';

import { db } from '../db/database';
import { coordinateHistorySchema } from '../db/schema/schema';
import authMiddleware from '../middleware/jwt';

export const massUploadRoute = new Hono()
  .use(authMiddleware)
  .post('/coordinate-history', async (c) => {
    try {
      //   body is array of CoordinateHistory
      const payload = c.get('jwtPayload');
      const userId = payload?.userId;
      const body: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        locations: any[];
      } = await c.req.json();

      const { locations } = body;

      //   insert value to db
      const result = await db.insert(coordinateHistorySchema).values(
        locations.map((item) => ({
          id: crypto.randomUUID(),
          user_id: userId,
          timestamp: new Date(item.timestamp),
          lat: item.lat,
          lon: item.lon,
          accuracy: item.accuracy,
          speed: item.speed,
          bearing: item.bearing,
          activity: item.activity,
          battery: item.battery,
          network: item.network,
          provider: item.provider,
          inside_geofence: item.inside_geofence,
          h3index: item.h3index,
          created_at: new Date(item.created_at),
        }))
      );

      return c.json({ success: true, message: 'Data inserted successfully', data: result });
    } catch (error) {
      console.error(error);
      return c.json({ success: false, message: 'Failed to insert data', data: error }, 500);
    }
  });
