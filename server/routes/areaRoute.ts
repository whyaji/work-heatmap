import { Hono } from 'hono';

import { authenticatedGetDataCmp, remapKeyResponse } from '../lib/utils/authenticatedGetDataCmp';
import { listBlockPlotToGeoJSON } from '../lib/utils/geoJson';
import authMiddleware from '../middleware/jwt';

export const areaRoute = new Hono()
  .use(authMiddleware)
  .get('/regional', async (c) => {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          select: ['id', 'abbr', 'nama'],
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
          select: ['id', 'abbr', 'nama'],
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
          select: ['id', 'abbr', 'nama'],
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
          select: ['id', 'abbr', 'nama'],
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
          select: ['id', 'abbr', 'nama'],
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
          select: ['id', 'abbr', 'nama'],
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
  .get('/estate/:id/afdeling', async (c) => {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          select: ['id', 'abbr', 'nama'],
          table: 'divisi',
          where: {
            dept: c.req.param('id'),
            status: 1,
          },
        },
      });
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch afdeling data' }, 500);
      }
      const data = await response.json();
      return c.json(remapKeyResponse(data));
    } catch (error) {
      console.error('Error fetching afdeling data by ID:', error);
      return c.json({ error: 'Failed to fetch afdeling data' }, 500);
    }
  })
  .get('/geo-json-blok', async (c) => {
    try {
      const estate = c.req.query('estate');
      const afdeling = c.req.query('afdeling');
      if (!estate) {
        return c.json({ error: 'Estate are required' }, 400);
      }
      const filterEstate = estate ? { estate: estate } : {};
      const filterAfdeling = afdeling ? { afdeling: afdeling } : {};
      const response = await authenticatedGetDataCmp({
        c,
        body: {
          select: ['lat', 'lon', 'block', 'estate', 'afdeling'],
          table: 'blok_plot_kml_2',
          where: {
            ...filterEstate,
            ...filterAfdeling,
          },
        },
      });
      if (!response.ok) {
        return c.json({ error: 'Failed to fetch blok plot map' }, 500);
      }
      const data = await response.json();
      if (data?.data?.length > 0) {
        return c.json(listBlockPlotToGeoJSON(data.data));
      }
      return c.json({ error: 'No data found' }, 404);
    } catch (error) {
      console.error('Error fetching blok plot map:', error);
      return c.json({ error: 'Failed to fetch blok plot map' }, 500);
    }
  });
