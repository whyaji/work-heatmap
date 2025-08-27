export type CoordinateHistoryType = {
  id: string;
  user_id: number;
  timestamp: string;
  lat: string;
  lon: string;
  user: {
    id: number;
    username: string | null;
    nama: string | null;
    jabatan: string | null;
  } | null;
};

export type H3Type = {
  h3Index: string;
  center: { lat: number; lon: number };
  resolution?: number;
  area?: number;
  count: number;
  uniqueUsers: number;
  firstSeen: string;
  lastSeen: string;
};

export type H3StatsType = {
  totalH3Cells: number;
  totalCoordinates: number;
  totalUniqueUsers: number;
  averageCoordinatesPerCell: number;
};
