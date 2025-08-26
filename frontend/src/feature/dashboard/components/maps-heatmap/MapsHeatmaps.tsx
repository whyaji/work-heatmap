import { CircleMarker, Popup } from 'react-leaflet';
import { FC, useMemo } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { HeatmapLayerFactory } from '@vgrid/react-leaflet-heatmap-layer';
import { CoordinateHistoryType, H3Type } from '@/types/coordinateHistory.type';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>();

export const heatmapConfig = {
  // Radius untuk setiap titik heatmap
  radius: 30,
  // Gradasi warna dari hijau muda ke merah
  gradient: {
    0.0: 'rgba(0, 255, 0, 0.8)', // Hijau terang dengan transparansi 80% (tidak terlihat)
    0.2: 'rgba(128, 255, 0, 0.85)', // Hijau-kuning dengan transparansi 85% (minimal 1 tetangga)
    0.4: 'rgba(255, 255, 0, 0.9)', // Kuning dengan transparansi 90% (2-3 tetangga)
    0.6: 'rgba(255, 128, 0, 0.95)', // Orange dengan transparansi 95% (4-5 tetangga)
    0.8: 'rgba(255, 64, 0, 1)', // Orange-merah opaque (6+ tetangga)
    1.0: 'rgba(255, 0, 0, 1)', // Merah opaque (banyak tetangga)
  },
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000; // Radius bumi dalam meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Jarak dalam meter
};

// Heatmap data processing component
export const HeatmapCoordinateDataProcessor: FC<{
  data: CoordinateHistoryType[];
  showHeatmap?: boolean;
  showClusteredMarkers?: boolean;
  showIndividualMarkers?: boolean;
  nearbyDistance?: number;
}> = ({
  data,
  showHeatmap = true,
  showClusteredMarkers = true,
  showIndividualMarkers = true,
  nearbyDistance = 50,
}) => {
  // Convert to heatmap format: [lat, lng, intensity]
  const heatmapPoints = useMemo(() => {
    // Create more granular heatmap points from individual coordinates
    const allPoints: Array<[number, number, number]> = [];

    data.forEach((coord) => {
      if (coord.lat && coord.lon) {
        const lat = parseFloat(coord.lat);
        const lon = parseFloat(coord.lon);

        const nearbyPoints = data.filter((otherPoint) => {
          if (coord.id === otherPoint.id) return false;

          const otherLat = parseFloat(otherPoint.lat);
          const otherLon = parseFloat(otherPoint.lon);
          const distance = calculateDistance(lat, lon, otherLat, otherLon);

          return distance <= nearbyDistance;
        });

        // Intensitas HANYA berdasarkan jumlah titik terdekat
        // Jika tidak ada titik terdekat = intensitas 0.1
        // Semakin banyak titik terdekat = semakin tinggi intensitas
        let intensity = 0.1;

        if (nearbyPoints.length > 0) {
          // Mulai dari 0.2 jika ada minimal 1 titik terdekat
          intensity = 0.2 + nearbyPoints.length * 0.15;
          intensity = Math.min(1.0, intensity);
        }
        allPoints.push([lat, lon, intensity]);
      }
    });

    return allPoints;
  }, [data, nearbyDistance]);

  // Individual markers for detailed information with clustering
  const individualMarkers = useMemo(() => {
    return data
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
              radius={5}
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
      {showHeatmap && (
        <HeatmapLayer
          points={heatmapPoints}
          longitudeExtractor={(m: any) => m[1]}
          latitudeExtractor={(m: any) => m[0]}
          intensityExtractor={(m: any) => parseFloat(m[2])}
          {...heatmapConfig}
        />
      )}
      {/* Clustered individual markers for detailed view */}
      {showClusteredMarkers && (
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={30}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={true}
          zoomToBoundsOnClick={true}
          removeOutsideVisibleBounds={true}
          animate={true}
          animateAddingMarkers={true}
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            let className = 'marker-cluster-small';

            if (count > 100) {
              className = 'marker-cluster-large';
            } else if (count > 10) {
              className = 'marker-cluster-medium';
            }

            return L.divIcon({
              html: `<div><span>${count}</span></div>`,
              className: `marker-cluster ${className}`,
              iconSize: L.point(40, 40),
            });
          }}>
          {individualMarkers}
        </MarkerClusterGroup>
      )}
      {showIndividualMarkers && !showClusteredMarkers && individualMarkers}
    </>
  );
};

export const HeatmapH3DataProcessor: FC<{
  data: H3Type[];
  showHeatmap?: boolean;
  showH3Markers?: boolean;
}> = ({ data, showHeatmap = true, showH3Markers = true }) => {
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

        // fix radius
        const radius = 4;

        // dynamic color based on count
        const color = `rgba(${Math.min(h3Item.count * 10, 255)}, 0, 0, 0.4)`;
        const fillColor = `rgba(${Math.min(h3Item.count * 10, 255)}, 0, 0, 0.8)`;

        return (
          <CircleMarker
            key={`h3-marker-${index}`}
            center={[lat, lon]}
            radius={radius}
            fillColor={fillColor}
            color={color}
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
      {showHeatmap && (
        <HeatmapLayer
          points={heatmapPoints}
          longitudeExtractor={(m: any) => m[1]}
          latitudeExtractor={(m: any) => m[0]}
          intensityExtractor={(m: any) => parseFloat(m[2])}
          {...heatmapConfig}
        />
      )}
      {/* H3 Cell Markers */}
      {showH3Markers && h3Markers}
    </>
  );
};
