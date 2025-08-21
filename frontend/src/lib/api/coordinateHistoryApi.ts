import { api } from './api';

const coordinateHistoryApi = api['coordinate-history'];

export const getCoordinateHistory = async () => {
  const response = await coordinateHistoryApi.$get();
  return response.json();
};
