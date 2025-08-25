import { PaginationType } from '@/types/pagination.type';
import { api } from './api';
import { CoordinateHistoryType, H3StatsType, H3Type } from '@/types/coordinateHistory.type';

const coordinateHistoryApi = api['coordinate-history'];

export interface CoordinateHistoryFilters {
  page?: string;
  limit?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface CoordinateHistoryH3Filters extends CoordinateHistoryFilters {
  resolution?: string;
}

export interface CoordinateHistoryResponse {
  data: CoordinateHistoryType[];
  pagination: PaginationType;
}

export interface CoordinateHistoryH3Response {
  data: H3Type[];
  pagination: PaginationType;
  h3Stats: H3StatsType;
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

export const getCoordinateHistoryH3 = async (
  filters: CoordinateHistoryH3Filters = {},
  windowBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null = null
): Promise<CoordinateHistoryH3Response> => {
  const response = await coordinateHistoryApi['h3-index'].$get({
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
