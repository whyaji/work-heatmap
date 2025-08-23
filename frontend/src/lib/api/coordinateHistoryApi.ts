import { api } from './api';

const coordinateHistoryApi = api['coordinate-history'];

export interface CoordinateHistoryFilters {
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface CoordinateHistoryResponse {
  data: Array<{
    id: string;
    user_id: number;
    timestamp: string;
    lat: string;
    lon: string;
    accuracy: number;
    speed: string | null;
    bearing: number | null;
    activity: string | null;
    battery: number | null;
    network: string | null;
    provider: string | null;
    inside_geofence: boolean | null;
    h3index: string | null;
    created_at: string;
    updated_at: string;
    user: {
      id: number;
      username: string | null;
      nama: string | null;
      jabatan: string | null;
    } | null;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const getCoordinateHistory = async (
  filters: CoordinateHistoryFilters = {},
  windowBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null = null
): Promise<CoordinateHistoryResponse> => {
  const response = await coordinateHistoryApi.$get({
    query: {
      ...filters,
      north: windowBounds?.north.toString(),
      south: windowBounds?.south.toString(),
      east: windowBounds?.east.toString(),
      west: windowBounds?.west.toString(),
    },
  });
  return response.json();
};
