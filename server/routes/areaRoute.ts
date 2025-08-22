import { Hono } from 'hono';

import { authenticatedGetDataCmp, remapKeyResponse } from '../lib/utils/authenticatedGetDataCmp';
import authMiddleware from '../middleware/jwt';

export const areaRoute = new Hono()
  .use(authMiddleware)
  .get('/regional', async (c) => {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          table: 'regional',
        },
      });
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch regional data' }, 500);
      }
      const data = await response.json();
      return c.json(remapKeyResponse(data));
    } catch (error) {
      console.error('Error fetching regional data:', error);
      return c.json({ error: 'Failed to fetch regional data' }, 500);
    }
  })
  .get('/regional/:id', async (c) => {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          table: 'regional',
          where: {
            id: c.req.param('id'),
          },
        },
      });
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch regional data' }, 500);
      }
      const data = await response.json();
      return c.json(remapKeyResponse(data));
    } catch (error) {
      console.error('Error fetching regional data by ID:', error);
      return c.json({ error: 'Failed to fetch regional data' }, 500);
    }
  })
  .get('/regional/:id/wilayah', async (c) => {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          table: 'wilayah',
          where: {
            regional: c.req.param('id'),
          },
        },
      });
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch wilayah data' }, 500);
      }
      const data = await response.json();
      return c.json(remapKeyResponse(data));
    } catch (error) {
      console.error('Error fetching wilayah data by ID:', error);
      return c.json({ error: 'Failed to fetch wilayah data' }, 500);
    }
  })
  .get('/wilayah/:id', async (c) => {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          table: 'wilayah',
          where: {
            id: c.req.param('id'),
          },
        },
      });
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch wilayah data' }, 500);
      }
      const data = await response.json();
      return c.json(remapKeyResponse(data));
    } catch (error) {
      console.error('Error fetching wilayah data by ID:', error);
      return c.json({ error: 'Failed to fetch wilayah data' }, 500);
    }
  })
  .get('/wilayah/:id/estate', async (c) => {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          table: 'estate',
          where: {
            wilayah: c.req.param('id'),
          },
        },
      });
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch estate data' }, 500);
      }
      const data = await response.json();
      return c.json(remapKeyResponse(data));
    } catch (error) {
      console.error('Error fetching estate data by ID:', error);
      return c.json({ error: 'Failed to fetch estate data' }, 500);
    }
  })
  .get('/estate/:id', async (c) => {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          table: 'estate',
          where: {
            id: c.req.param('id'),
          },
        },
      });
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch estate data' }, 500);
      }
      const data = await response.json();
      return c.json(remapKeyResponse(data));
    } catch (error) {
      console.error('Error fetching estate data by ID:', error);
      return c.json({ error: 'Failed to fetch estate data' }, 500);
    }
  })
  .get('/estate/:id/afdelling', async (c) => {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          table: 'divisi',
          where: {
            dept: c.req.param('id'),
          },
        },
      });
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch afdelling data' }, 500);
      }
      const data = await response.json();
      return c.json(remapKeyResponse(data));
    } catch (error) {
      console.error('Error fetching afdelling data by ID:', error);
      return c.json({ error: 'Failed to fetch afdelling data' }, 500);
    }
  });
