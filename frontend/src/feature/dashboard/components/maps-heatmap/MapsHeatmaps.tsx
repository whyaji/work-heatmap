import './MapsHeatmaps.css';

import { Badge, Box, Button, HStack, Text } from '@chakra-ui/react';
import { HeatmapLayerFactory } from '@vgrid/react-leaflet-heatmap-layer';
import L, { LatLngBounds, LatLngTuple } from 'leaflet';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { CircleMarker, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

import { CoordinateHistoryType, H3Type } from '@/types/coordinateHistory.type';
import { getShortDateTime } from '@/utils/dateTimeFormatter';

import heatmapDefaultConfig from '../../constants/heatmapConfig';
import { useTrackingIndexStore } from '../../lib/store/trackingIndexStore';
import { useZoomBoundStore } from '../../lib/store/zoomBoundStore';

const HeatmapLayer = HeatmapLayerFactory<[number, number, number]>();

const pulsingIcon = L.divIcon({
  className: 'pulsing-div-icon',
  html: '<div class="pulsing-dot"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const calculateBounds = (allPointData: [number, number, number][]): LatLngBounds | null => {
  if (!allPointData || allPointData.length === 0) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  allPointData.forEach((point) => {
    const lat = point[0];
    const lng = point[1];
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  if (minLat === Infinity || maxLat === -Infinity || minLng === Infinity || maxLng === -Infinity) {
    return null;
  }

  return new LatLngBounds([minLat, minLng], [maxLat, maxLng]);
};

const calculateHeatmapPoints = (
  data: CoordinateHistoryType[],
  map: L.Map,
  hasArea: boolean
): [number, number, number][] => {
  // Create more granular heatmap points from individual coordinates
  const allPoints: Array<[number, number, number]> = [];

  data.forEach((coord) => {
    if (coord.lat && coord.lon) {
      const lat = parseFloat(coord.lat);
      const lon = parseFloat(coord.lon);
      allPoints.push([lat, lon, 1]);
    }
  });

  // if not has area, change center and zoom based on the data
  if (!hasArea) {
    const bounds = calculateBounds(allPoints);
    if (bounds) {
      map.fitBounds(bounds, {
        animate: true,
        padding: [60, 60],
      });
    }
  }

  return allPoints;
};

// Helper function to get time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
};

const DetailedPopupContent: FC<{
  selectedData: CoordinateHistoryType;
  selectedIndex: number;
  dataLength: number;
}> = ({ selectedData, selectedIndex, dataLength }) => {
  return (
    <>
      <Text fontSize="sm" fontFamily="mono" color="gray.700">
        {Number(selectedData.lat).toFixed(6)}, {Number(selectedData.lon).toFixed(6)}
      </Text>
      <Text fontSize="sm" color="gray.700">
        {selectedData.user?.nama ?? selectedData.user_id}
      </Text>
      <Text fontSize="sm" color="gray.700">
        {getShortDateTime(selectedData.timestamp)}
      </Text>
      <Text fontSize="xs" color="gray.500">
        {getTimeAgo(new Date(selectedData.timestamp))}
      </Text>
      <Box w="100%" bg="gray.200" borderRadius="full" h="2">
        <Box
          w={`${((selectedIndex + 1) / dataLength) * 100}%`}
          bg="blue.500"
          h="100%"
          borderRadius="full"
        />
      </Box>
      <Text fontSize="xs" color="gray.500" mt={1}>
        {selectedIndex + 1} of {dataLength} points
      </Text>
    </>
  );
};

const SelectedMarker: FC<{
  position: [number, number];
  selectedData: CoordinateHistoryType;
  selectedIndex: number;
  dataLength: number;
  autoOpen?: boolean;
}> = ({ position, selectedData, selectedIndex, dataLength, autoOpen = false }) => {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const open = setTimeout(() => {
      if (autoOpen && markerRef.current) {
        markerRef.current.openPopup();
      }
    }, 500);
    return () => clearTimeout(open);
  }, []);

  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === dataLength - 1;

  return (
    <Marker ref={markerRef} position={position} icon={pulsingIcon}>
      <Popup>
        <Box minW="200px">
          <HStack spacing={2} w="100%">
            <Text fontWeight="bold" color="orange.600" fontSize="sm">
              📍 Titik Terpilih
            </Text>
            {(isFirst || isLast) && (
              <Badge colorScheme={isFirst ? 'green' : 'red'} size="sm" variant="solid">
                {isFirst ? 'Point Awal' : 'Point Akhir'}
              </Badge>
            )}
          </HStack>
          <DetailedPopupContent
            selectedData={selectedData}
            selectedIndex={selectedIndex}
            dataLength={dataLength}
          />
        </Box>
      </Popup>
    </Marker>
  );
};

// Heatmap data processing component
export const HeatmapCoordinateDataProcessor: FC<{
  data: CoordinateHistoryType[];
  showHeatmap?: boolean;
  showClusteredMarkers?: boolean;
  showIndividualMarkers?: boolean;
  radius?: number;
  gradient?: Record<number, string>;
  hasArea?: boolean;
  setCoordinatePersonalTrackingData?: (data: CoordinateHistoryType[] | null) => void;
}> = ({
  data,
  showHeatmap = true,
  showClusteredMarkers = true,
  showIndividualMarkers = true,
  radius,
  gradient,
  hasArea = false,
  setCoordinatePersonalTrackingData,
}) => {
  const map = useMap();
  const mapBounds = useZoomBoundStore((state) => state.bounds);
  const heatmapConfig = heatmapDefaultConfig;
  // Convert to heatmap format: [lat, lng, intensity]
  const heatmapPoints = useMemo(() => {
    return calculateHeatmapPoints(data, map, hasArea);
  }, [data]);

  const setLengthTrackingIndex = useTrackingIndexStore((state) => state.setLength);
  const setTrackingIndex = useTrackingIndexStore((state) => state.setTrackingIndex);
  const setIsTrackingTimeline = useTrackingIndexStore((state) => state.setIsTrackingTimeline);

  const getVisibleData = useCallback(() => {
    return data.filter((point) => {
      const centerCoords: LatLngTuple = [Number(point.lat), Number(point.lon)];
      return mapBounds.contains(centerCoords);
    });
  }, [data, mapBounds]);

  // Individual markers for detailed information with clustering
  const individualMarkers = useMemo(() => {
    return getVisibleData()
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
                  <Text fontSize="sm">{getShortDateTime(coord.timestamp)}</Text>
                  {/* button to select all data with this user */}
                  <Button
                    variant={'outline'}
                    size={'xs'}
                    onClick={() => {
                      const personalTrackingData = data.filter(
                        (data) => data.user_id === coord.user_id
                      );
                      setCoordinatePersonalTrackingData?.(personalTrackingData);
                      setLengthTrackingIndex(personalTrackingData.length);
                      setTrackingIndex(0);
                      setIsTrackingTimeline(true);
                    }}>
                    Lihat timeline {coord.user?.nama ?? coord.user_id}
                  </Button>
                </Box>
              </Popup>
            </CircleMarker>
          );
        }
        return null;
      })
      .filter(Boolean); // Remove null values
  }, [data, getVisibleData]);

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

export const HeatmapTrackingTimeLine: FC<{
  data: CoordinateHistoryType[];
  showHeatmap?: boolean;
  showPolyline?: boolean;
  showIndividualMarkers?: boolean;
  radius?: number;
  gradient?: Record<number, string>;
}> = ({
  data,
  showHeatmap = true,
  showPolyline = true,
  showIndividualMarkers = true,
  radius,
  gradient,
}) => {
  const firstData = data[0];
  const lastData = data[data.length - 1];
  const map = useMap();
  const heatmapConfig = heatmapDefaultConfig;

  const selectedIndex = useTrackingIndexStore((state) => state.trackingIndex);
  const setCoordinateDetail = useTrackingIndexStore((state) => state.setCoordinateDetail);

  const selectedData = data[selectedIndex];

  useEffect(() => {
    setCoordinateDetail(selectedData);
    map.setView([Number(selectedData.lat), Number(selectedData.lon)]);
  }, [selectedData]);

  // Convert to heatmap format: [lat, lng, intensity]
  const heatmapPoints = useMemo(() => {
    return calculateHeatmapPoints(data, map, false);
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

          const isFirst = index === 0;
          const isLast = index === data.length - 1;

          // Determine marker styling based on position
          let markerRadius = 6;
          let fillColor = 'rgba(59, 130, 246, 0.6)'; // Blue for regular points
          let borderColor = 'rgba(59, 130, 246, 0.8)';
          let borderWeight = 2;

          if (isFirst) {
            fillColor = 'rgba(34, 197, 94, 0.8)'; // Green for start
            borderColor = 'rgba(34, 197, 94, 1)';
            markerRadius = 8;
            borderWeight = 3;
          } else if (isLast) {
            fillColor = 'rgba(239, 68, 68, 0.8)'; // Red for end
            borderColor = 'rgba(239, 68, 68, 1)';
            markerRadius = 8;
            borderWeight = 3;
          }

          return (
            <CircleMarker
              key={`marker-${index}`}
              center={[lat, lng]}
              radius={markerRadius}
              fillColor={fillColor}
              color={borderColor}
              weight={borderWeight}
              opacity={0.8}>
              <Popup>
                <Box minW="200px">
                  <HStack spacing={2} w="100%">
                    <Box
                      w="3"
                      h="3"
                      borderRadius="full"
                      bg={isFirst ? 'green.500' : isLast ? 'red.500' : 'blue.500'}
                    />
                    <Text fontWeight="bold" fontSize="sm" color="gray.700">
                      {isFirst ? 'Start Point' : isLast ? 'End Point' : `Point ${index + 1}`}
                    </Text>
                  </HStack>

                  <DetailedPopupContent
                    selectedData={coord}
                    selectedIndex={index}
                    dataLength={data.length}
                  />
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
      {showIndividualMarkers && individualMarkers}

      {/* Enhanced polyline with gradient effect */}
      {showPolyline && (
        <Polyline
          positions={data.map((coord) => [Number(coord.lat), Number(coord.lon)])}
          color="#3B82F6"
          weight={3}
          opacity={0.7}
          dashArray="5, 10"
          className="timeline-polyline"
        />
      )}

      {/* Start marker with enhanced styling */}
      <CircleMarker
        radius={8}
        fillColor="rgba(34, 197, 94, 0.9)"
        color="rgba(34, 197, 94, 1)"
        weight={3}
        center={[Number(firstData.lat), Number(firstData.lon)]}>
        <Popup>
          <Box minW="200px">
            <Text fontWeight="bold" color="green.600" fontSize="sm">
              Titik Awal
            </Text>
            <DetailedPopupContent
              selectedData={firstData}
              selectedIndex={0}
              dataLength={data.length}
            />
          </Box>
        </Popup>
      </CircleMarker>

      {/* End marker with enhanced styling */}
      <CircleMarker
        radius={8}
        fillColor="rgba(239, 68, 68, 0.9)"
        color="rgba(239, 68, 68, 1)"
        weight={3}
        center={[Number(lastData.lat), Number(lastData.lon)]}>
        <Popup>
          <Box minW="200px">
            <Text fontWeight="bold" color="red.600" fontSize="sm">
              Titik Akhir
            </Text>
            <DetailedPopupContent
              selectedData={lastData}
              selectedIndex={data.length - 1}
              dataLength={data.length}
            />
          </Box>
        </Popup>
      </CircleMarker>

      {/* Selected data marker with pulsing effect */}
      <SelectedMarker
        position={[Number(selectedData.lat), Number(selectedData.lon)]}
        selectedData={selectedData}
        selectedIndex={selectedIndex}
        dataLength={data.length}
      />
    </>
  );
};

export const HeatmapH3DataProcessor: FC<{
  data: H3Type[];
  showHeatmap?: boolean;
  showH3Markers?: boolean;
  radius?: number;
  gradient?: Record<number, string>;
  hasArea?: boolean;
}> = ({ data, showHeatmap = true, showH3Markers = true, radius, gradient, hasArea = false }) => {
  const map = useMap();
  const heatmapConfig = heatmapDefaultConfig;
  // Process H3 data for heatmap visualization
  const heatmapPoints = useMemo(() => {
    // if not has area, change center and zoom based on the data
    if (!hasArea) {
      const bounds = calculateBounds(
        data.map((h3Item) => [h3Item.center.lat, h3Item.center.lon, 0])
      );
      if (bounds) {
        map.fitBounds(bounds, {
          animate: true,
          padding: [60, 60],
        });
      }
    }
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
