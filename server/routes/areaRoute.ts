import { Hono } from 'hono';

import {
  FindAdditionalAreaByEstateAbbr,
  getAdditionalAreaFile,
  SearchAdditionalAreaByWilayah,
} from '../constants/additionalArea';
import { areaCacheConfig } from '../middleware/cacheMiddleware';
import {
  errorHandler,
  handleServiceResponse,
  rateLimiter,
  requestLogger,
  validateParam,
  validateQuery,
} from '../middleware/errorHandler';
import authMiddleware from '../middleware/jwt';
import { areaService, AreaServiceResponse, AreaType } from '../services/areaService';

export const areaRoute = new Hono()
  // Apply global middleware
  .use(errorHandler)
  .use(requestLogger)
  .use(rateLimiter(1000, 60000)) // 1000 requests per minute
  .use(authMiddleware)

  // Regional endpoints
  .get('/regional', areaCacheConfig.regional, async (c) => {
    const result = await areaService.getRegionals(c);
    return handleServiceResponse(result)(c);
  })

  .get('/regional/:id', validateParam('id'), areaCacheConfig.regional, async (c) => {
    const id = c.req.param('id');
    const result = await areaService.getRegionalById(c, id);
    return handleServiceResponse(result)(c);
  })

  .get('/regional/:id/wilayah', validateParam('id'), areaCacheConfig.wilayah, async (c) => {
    const id = c.req.param('id');
    const result = await areaService.getWilayahByRegionalId(c, id);
    return handleServiceResponse(result)(c);
  })

  // Wilayah endpoints
  .get('/wilayah/:id', validateParam('id'), areaCacheConfig.wilayah, async (c) => {
    const id = c.req.param('id');
    const result = await areaService.getWilayahById(c, id);
    return handleServiceResponse(result)(c);
  })

  .get('/wilayah/:id/estate', validateParam('id'), areaCacheConfig.estate, async (c) => {
    const id = c.req.param('id');
    const result = await areaService.getEstatesByWilayahId(c, id);
    if (!isNaN(Number(id))) {
      const additionalArea = SearchAdditionalAreaByWilayah(Number(id));
      if (result.success && additionalArea.length > 0) {
        const newData: {
          id: number;
          abbr: string;
          nama: string;
        }[] = [
          ...(result.data?.data ?? []),
          ...additionalArea.map((area) => ({
            id: area.id,
            abbr: area.abbr,
            nama: area.nama,
          })),
        ];
        const newResult: AreaServiceResponse<AreaType> = {
          success: true,
          data: {
            data: newData,
            total: newData.length,
          },
          status: 200,
        };
        return handleServiceResponse(newResult)(c);
      }
    }
    return handleServiceResponse(result)(c);
  })

  // Estate endpoints
  .get('/estate/:id', validateParam('id'), areaCacheConfig.estate, async (c) => {
    const id = c.req.param('id');
    const result = await areaService.getEstateById(c, id);
    return handleServiceResponse(result)(c);
  })

  .get('/estate/:id/afdeling', validateParam('id'), areaCacheConfig.afdeling, async (c) => {
    const id = c.req.param('id');
    const result = await areaService.getAfdelingsByEstateId(c, id);
    return handleServiceResponse(result)(c);
  })

  // GeoJSON endpoint
  .get(
    '/geo-json-blok',
    validateQuery('estate', true), // estate is required
    areaCacheConfig.geoJson,
    async (c) => {
      const estate = c.req.query('estate')!; // We know it exists due to validation
      const afdeling = c.req.query('afdeling');

      const additionalArea = FindAdditionalAreaByEstateAbbr(estate);
      if (additionalArea) {
        const geojson = await getAdditionalAreaFile(additionalArea.abbr);
        return c.json(geojson, 200);
      }

      const result = await areaService.getGeoJsonBlok(c, estate, afdeling);
      return handleServiceResponse(result)(c);
    }
  );
