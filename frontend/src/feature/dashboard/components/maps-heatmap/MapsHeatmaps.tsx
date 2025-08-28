import './MapsHeatmaps.css';

import { Box, Text } from '@chakra-ui/react';
import { HeatmapLayerFactory } from '@vgrid/react-leaflet-heatmap-layer';
import L from 'leaflet';
import { FC, useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import { CoordinateHistoryType, H3Type } from '@/types/coordinateHistory.type';

import heatmapDefaultConfig from '../../constants/heatmapConfig';

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>();

// Heatmap data processing component
export const HeatmapCoordinateDataProcessor: FC<{
  data: CoordinateHistoryType[];
  showHeatmap?: boolean;
  showClusteredMarkers?: boolean;
  showIndividualMarkers?: boolean;
  radius?: number;
  gradient?: Record<number, string>;
}> = ({
  data,
  showHeatmap = true,
  showClusteredMarkers = true,
  showIndividualMarkers = true,
  radius,
  gradient,
}) => {
  const heatmapConfig = heatmapDefaultConfig;
  // Convert to heatmap format: [lat, lng, intensity]
  const heatmapPoints = useMemo(() => {
    // Create more granular heatmap points from individual coordinates
    const allPoints: Array<[number, number, number]> = [];

    data.forEach((coord) => {
      if (coord.lat && coord.lon) {
        const lat = parseFloat(coord.lat);
        const lon = parseFloat(coord.lon);
        allPoints.push([lat, lon, 1]);
      }
    });

    return allPoints;
  }, [data]);

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
                <Box>
                  <Text fontWeight="bold" fontSize="sm">
                    Lokasi Pengguna
                  </Text>
                  <Text fontSize="sm">
                    {lat.toFixed(6)}, {lng.toFixed(6)}
                  </Text>
                  <Text fontSize="sm">{coord.user?.nama ?? coord.user_id}</Text>
                  <Text fontSize="sm">{new Date(coord.timestamp).toLocaleString()}</Text>
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
          max={1}
          minOpacity={0.6}
          gradient={gradient ?? heatmapConfig.gradient}
          radius={radius ?? heatmapConfig.radius}
          points={heatmapPoints}
          longitudeExtractor={(m) => m[1]}
          latitudeExtractor={(m) => m[0]}
          intensityExtractor={(m) => m[2]}
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
          iconCreateFunction={(cluster: { getChildCount: () => number }) => {
            const count = cluster.getChildCount();
            let className = 'marker-cluster-small';

            if (count > 50) {
              className = 'marker-cluster-extra-large';
            } else if (count > 20) {
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
  radius?: number;
  gradient?: Record<number, string>;
}> = ({ data, showHeatmap = true, showH3Markers = true, radius, gradient }) => {
  const heatmapConfig = heatmapDefaultConfig;
  // Process H3 data for heatmap visualization
  const heatmapPoints = useMemo(() => {
    return data.map((h3Item) => {
      // Convert H3 center coordinates to heatmap format: [lat, lng, intensity]
      // Intensity is based on the count of coordinates in this H3 cell
      const intensity = Math.min(h3Item.count / 15, 1); // Cap intensity at 3x
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

        // color gradient liner from blue to red
        const color = 'rgb(62, 62, 62)';
        const fillColor = 'rgba(62, 62, 62, 0.43)';

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
              <Box>
                <Text fontWeight="bold" fontSize="sm">
                  Kelompok Titik
                </Text>
                <Text fontSize="sm">Total Kordinat: {h3Item.count}</Text>
                <Text fontSize="sm">Jumlah User: {h3Item.uniqueUsers}</Text>
                <Text fontSize="sm">
                  Waktu Pertama: {new Date(h3Item.firstSeen).toLocaleString()}
                </Text>
                <Text fontSize="sm">
                  Waktu Terakhir: {new Date(h3Item.lastSeen).toLocaleString()}
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
          max={1}
          minOpacity={0.6}
          gradient={gradient ?? heatmapConfig.gradient}
          radius={radius ?? heatmapConfig.radius}
          points={heatmapPoints}
          longitudeExtractor={(m) => m[1]}
          latitudeExtractor={(m) => m[0]}
          intensityExtractor={(m) => m[2]}
        />
      )}
      {/* H3 Cell Markers */}
      {showH3Markers && h3Markers}
    </>
  );
};
