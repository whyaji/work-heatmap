import { CircleMarker, Popup } from 'react-leaflet';
import { FC, useMemo } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { HeatmapLayerFactory } from '@vgrid/react-leaflet-heatmap-layer';
import { CoordinateHistoryType, H3Type } from '@/types/coordinateHistory.type';

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>();

// Heatmap data processing component
export const HeatmapCoordinateDataProcessor: FC<{ data: CoordinateHistoryType[] }> = ({ data }) => {
  const heatmapData = useMemo(() => {
    const h3Counts: {
      [key: string]: {
        count: number;
        lat: number;
        lng: number;
        users: Set<number>;
        coordinates: Array<[number, number]>;
      };
    } = {};

    data.forEach((coord) => {
      if (coord.lat && coord.lon) {
        const lat = parseFloat(coord.lat);
        const lng = parseFloat(coord.lon);

        // Validate coordinates to prevent NaN values
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.warn('Invalid coordinates detected:', coord);
          return; // Skip invalid coordinates
        }
      }
    });

    return Object.values(h3Counts);
  }, [data]);

  // Convert to heatmap format: [lat, lng, intensity]
  const heatmapPoints = useMemo(() => {
    // Create more granular heatmap points from individual coordinates
    const allPoints: Array<[number, number, number]> = [];

    data.forEach((coord) => {
      if (coord.lat && coord.lon) {
        const lat = parseFloat(coord.lat);
        const lng = parseFloat(coord.lon);

        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          // Each coordinate gets a base intensity
          allPoints.push([lat, lng, 1]);
        }
      }
    });

    // Add H3 cluster centers with weighted intensity
    heatmapData.forEach((cluster) => {
      if (cluster.count > 1) {
        // Higher intensity for clusters with more coordinates
        const intensity = Math.min(cluster.count / 3, 2); // Cap at 2x intensity
        allPoints.push([cluster.lat, cluster.lng, intensity]);
      }
    });

    return allPoints;
  }, [data, heatmapData]);

  // Individual markers for detailed information
  const individualMarkers = useMemo(() => {
    return data
      .slice(0, 100)
      .map((coord, index) => {
        if (coord.lat && coord.lon) {
          const lat = parseFloat(coord.lat);
          const lng = parseFloat(coord.lon);

          // Validate coordinates to prevent NaN values
          if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return null; // Skip invalid coordinates
          }

          return (
            <CircleMarker
              key={`marker-${index}`}
              center={[lat, lng]}
              radius={2}
              fillColor="rgba(0, 0, 255, 0.4)"
              color="rgba(0, 0, 255, 0.6)"
              weight={1}
              opacity={0.5}>
              <Popup>
                <Box p={2}>
                  <Text fontWeight="bold" fontSize="sm">
                    Worker Location
                  </Text>
                  <Text fontSize="sm">
                    Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
                  </Text>
                  <Text fontSize="sm">User ID: {coord.user_id}</Text>
                  <Text fontSize="sm">Time: {new Date(coord.timestamp).toLocaleString()}</Text>
                </Box>
              </Popup>
            </CircleMarker>
          );
        }
        return null;
      })
      .filter(Boolean); // Remove null values
  }, [data]);

  return (
    <>
      {/* Heatmap Layer with improved configuration */}
      <HeatmapLayer
        points={heatmapPoints}
        longitudeExtractor={(m: any) => m[1]}
        latitudeExtractor={(m: any) => m[0]}
        intensityExtractor={(m: any) => parseFloat(m[2])}
      />
      {/* Individual markers for detailed view */}
      {individualMarkers}
    </>
  );
};

export const HeatmapH3DataProcessor: FC<{ data: H3Type[] }> = ({ data }) => {
  // Process H3 data for heatmap visualization
  const heatmapPoints = useMemo(() => {
    return data.map((h3Item) => {
      // Convert H3 center coordinates to heatmap format: [lat, lng, intensity]
      // Intensity is based on the count of coordinates in this H3 cell
      const intensity = Math.min(h3Item.count / 5, 3); // Cap intensity at 3x
      return [h3Item.center.lat, h3Item.center.lon, intensity] as [number, number, number];
    });
  }, [data]);

  // Create H3 cell markers for detailed information
  const h3Markers = useMemo(() => {
    return data
      .slice(0, 50) // Limit to first 50 H3 cells to avoid overwhelming the map
      .map((h3Item, index) => {
        const { lat, lon } = h3Item.center;

        // Validate coordinates
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          return null;
        }

        return (
          <CircleMarker
            key={`h3-marker-${index}`}
            center={[lat, lon]}
            radius={Math.max(3, Math.min(h3Item.count / 10, 8))} // Dynamic radius based on count
            fillColor="rgba(255, 0, 0, 0.4)"
            color="rgba(255, 0, 0, 0.8)"
            weight={2}
            opacity={0.7}>
            <Popup>
              <Box p={2}>
                <Text fontWeight="bold" fontSize="sm">
                  H3 Cell
                </Text>
                <Text fontSize="sm">
                  Coordinates: {lat.toFixed(6)}, {lon.toFixed(6)}
                </Text>
                <Text fontSize="sm">H3 Index: {h3Item.h3Index}</Text>
                <Text fontSize="sm">Resolution: {h3Item.resolution}</Text>
                <Text fontSize="sm">Total Coordinates: {h3Item.count}</Text>
                <Text fontSize="sm">Unique Users: {h3Item.uniqueUsers}</Text>
                <Text fontSize="sm">Area: {h3Item.area.toFixed(2)} km²</Text>
                <Text fontSize="sm">
                  First Seen: {new Date(h3Item.firstSeen).toLocaleDateString()}
                </Text>
                <Text fontSize="sm">
                  Last Seen: {new Date(h3Item.lastSeen).toLocaleDateString()}
                </Text>
              </Box>
            </Popup>
          </CircleMarker>
        );
      })
      .filter(Boolean); // Remove null values
  }, [data]);

  return (
    <>
      {/* H3 Heatmap Layer */}
      <HeatmapLayer
        points={heatmapPoints}
        longitudeExtractor={(m: any) => m[1]}
        latitudeExtractor={(m: any) => m[0]}
        intensityExtractor={(m: any) => parseFloat(m[2])}
      />
      {/* H3 Cell Markers */}
      {h3Markers}
    </>
  );
};
