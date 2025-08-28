import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import {
  CoordinateHistoryFilters,
  CoordinateHistoryH3Filters,
  CoordinateHistoryH3Response,
  CoordinateHistoryResponse,
  getCoordinateHistory,
  getCoordinateHistoryH3,
} from '@/lib/api/coordinateHistoryApi';

export const useInfiniteCoordinateHistory = (
  baseFilters: CoordinateHistoryFilters,
  windowBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null,
  enabled: boolean = true
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<CoordinateHistoryResponse>({
    queryKey: ['coordinateHistoryInfinite', baseFilters, windowBounds],
    queryFn: ({ pageParam = 1 }) =>
      getCoordinateHistory({ ...baseFilters, page: String(pageParam) }, windowBounds),
    getNextPageParam: (lastPage: CoordinateHistoryResponse) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled,
  });

  // Auto-fetch all pages
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && enabled) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, enabled]);

  // Flatten all pages data
  const allData = useMemo(() => {
    return data?.pages.flatMap((page: CoordinateHistoryResponse) => page.data) ?? [];
  }, [data]);

  return {
    data: allData,
    isLoading: isLoading || isFetchingNextPage,
    isError,
    error,
    refetch,
    isComplete: !hasNextPage,
    totalFetched: allData.length,
  };
};

// Custom hook for auto-paginated H3 coordinate history
export const useInfiniteCoordinateHistoryH3 = (
  baseFilters: CoordinateHistoryH3Filters,
  windowBounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  } | null,
  enabled: boolean = true
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery<CoordinateHistoryH3Response>({
    queryKey: ['coordinateHistoryH3Infinite', baseFilters, windowBounds],
    queryFn: ({ pageParam = 1 }) =>
      getCoordinateHistoryH3(
        {
          ...baseFilters,
          page: String(pageParam),
          resolution: baseFilters.resolution ?? String(9),
        },
        windowBounds
      ),
    getNextPageParam: (lastPage: CoordinateHistoryH3Response) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled,
  });

  // Auto-fetch all pages
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && enabled) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, enabled]);

  // Flatten all pages data
  const allData = useMemo(() => {
    return data?.pages.flatMap((page: CoordinateHistoryH3Response) => page.data) ?? [];
  }, [data]);

  // Get H3 stats from the first page (should be consistent across pages)
  const h3Stats = useMemo(() => {
    return data?.pages?.[0]?.h3Stats ?? null;
  }, [data]);

  return {
    data: allData,
    h3Stats,
    isLoading: isLoading || isFetchingNextPage,
    isError,
    error,
    refetch,
    isComplete: !hasNextPage,
    totalFetched: allData.length,
  };
};
