/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context } from 'hono';

import { authenticatedGetDataCmp, remapKeyResponse } from '../lib/utils/authenticatedGetDataCmp';
import { listBlockPlotToGeoJSON } from '../lib/utils/geoJson';

export interface AreaServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export class AreaService {
  private async fetchData(
    c: Context,
    params: {
      select: string[];
      table: string;
      where?: Record<string, any>;
    }
  ): Promise<AreaServiceResponse> {
    try {
      const response = await authenticatedGetDataCmp({
        c,
        body: params,
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch ${params.table} data`,
          status: response.status || 500,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: remapKeyResponse(data),
        status: 200,
      };
    } catch (error) {
      console.error(`Error fetching ${params.table} data:`, error);
      return {
        success: false,
        error: `Failed to fetch ${params.table} data`,
        status: 500,
      };
    }
  }

  async getRegionals(c: Context): Promise<AreaServiceResponse> {
    return this.fetchData(c, {
      select: ['id', 'abbr', 'nama'],
      table: 'regional',
    });
  }

  async getRegionalById(c: Context, id: string): Promise<AreaServiceResponse> {
    return this.fetchData(c, {
      select: ['id', 'abbr', 'nama'],
      table: 'regional',
      where: { id },
    });
  }

  async getWilayahByRegionalId(c: Context, regionalId: string): Promise<AreaServiceResponse> {
    return this.fetchData(c, {
      select: ['id', 'abbr', 'nama'],
      table: 'wilayah',
      where: { regional: regionalId },
    });
  }

  async getWilayahById(c: Context, id: string): Promise<AreaServiceResponse> {
    return this.fetchData(c, {
      select: ['id', 'abbr', 'nama'],
      table: 'wilayah',
      where: { id },
    });
  }

  async getEstatesByWilayahId(c: Context, wilayahId: string): Promise<AreaServiceResponse> {
    return this.fetchData(c, {
      select: ['id', 'abbr', 'nama'],
      table: 'estate',
      where: { wilayah: wilayahId },
    });
  }

  async getEstateById(c: Context, id: string): Promise<AreaServiceResponse> {
    return this.fetchData(c, {
      select: ['id', 'abbr', 'nama'],
      table: 'estate',
      where: { id },
    });
  }

  async getAfdelingsByEstateId(c: Context, estateId: string): Promise<AreaServiceResponse> {
    return this.fetchData(c, {
      select: ['id', 'abbr', 'nama'],
      table: 'divisi',
      where: {
        dept: estateId,
        status: 1,
      },
    });
  }

  async getGeoJsonBlok(
    c: Context,
    estate: string,
    afdeling?: string
  ): Promise<AreaServiceResponse> {
    try {
      if (!estate) {
        return {
          success: false,
          error: 'Estate parameter is required',
          status: 400,
        };
      }

      const whereCondition: Record<string, any> = { estate };
      if (afdeling) {
        whereCondition.afdeling = afdeling;
      }

      const response = await authenticatedGetDataCmp({
        c,
        body: {
          select: ['lat', 'lon', 'block', 'estate', 'afdeling'],
          table: 'blok_plot_kml_2',
          where: whereCondition,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch blok plot map',
          status: response.status || 500,
        };
      }

      const data = await response.json();

      if (data?.data?.length > 0) {
        return {
          success: true,
          data: listBlockPlotToGeoJSON(data.data),
          status: 200,
        };
      }

      return {
        success: false,
        error: 'No data found',
        status: 404,
      };
    } catch (error) {
      console.error('Error fetching blok plot map:', error);
      return {
        success: false,
        error: 'Failed to fetch blok plot map',
        status: 500,
      };
    }
  }
}

export const areaService = new AreaService();
