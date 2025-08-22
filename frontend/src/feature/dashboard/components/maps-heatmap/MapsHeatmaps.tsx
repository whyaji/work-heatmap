import { CircleMarker, Popup } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import { cellToLatLng, latLngToCell, cellArea } from 'h3-js';
import { useMemo, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Divider,
  Collapse,
  Button,
  Badge,
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiChevronUp, FiChevronDown, FiLayers, FiInfo } from 'react-icons/fi';

// Heatmap data processing component
export const HeatmapDataProcessor = ({ data }: { data: any[] }) => {
  const [showIndividualMarkers, setShowIndividualMarkers] = useState(true);
  const [showH3Zones, setShowH3Zones] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  // Debug: Log data structure to identify issues
  useMemo(() => {
    if (data.length > 0) {
      console.log('Sample coordinate data:', data[0]);
      console.log('Data types:', {
        lat: typeof data[0]?.lat,
        lon: typeof data[0]?.lon,
        latValue: data[0]?.lat,
        lonValue: data[0]?.lon,
      });
      console.log('Total coordinates:', data.length);
    }
  }, [data]);

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

        // Use higher resolution H3 for more accurate clustering
        // Resolution 10 gives ~36km² hexagons, better for detailed heatmap
        const h3Index = latLngToCell(lat, lng, 10);

        if (!h3Counts[h3Index]) {
          const h3Center = cellToLatLng(h3Index);
          h3Counts[h3Index] = {
            count: 0,
            lat: h3Center[0],
            lng: h3Center[1],
            users: new Set(),
            coordinates: [],
          };
        }

        h3Counts[h3Index].count++;
        h3Counts[h3Index].users.add(coord.user_id);
        h3Counts[h3Index].coordinates.push([lat, lng]);
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
    if (!showIndividualMarkers) return [];

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
                  {coord.activity && <Text fontSize="sm">Activity: {coord.activity}</Text>}
                  {coord.inside_geofence !== null && (
                    <Text fontSize="sm">
                      Geofence: {coord.inside_geofence ? 'Inside' : 'Outside'}
                    </Text>
                  )}
                </Box>
              </Popup>
            </CircleMarker>
          );
        }
        return null;
      })
      .filter(Boolean); // Remove null values
  }, [data, showIndividualMarkers]);

  // H3 Zone markers for cluster information
  const h3ZoneMarkers = useMemo(() => {
    if (!showH3Zones) return [];

    return heatmapData.map((point, index) => (
      <CircleMarker
        key={`h3-${index}`}
        center={[point.lat, point.lng]}
        radius={Math.max(6, Math.min(15, point.count * 0.8))}
        fillColor="rgba(255, 0, 0, 0.2)"
        color="rgba(255, 0, 0, 0.6)"
        weight={1}
        opacity={0.6}>
        <Popup>
          <Box p={2}>
            <Text fontWeight="bold" fontSize="sm">
              H3 Zone: {latLngToCell(point.lat, point.lng, 10)}
            </Text>
            <Text fontSize="sm">Total Coordinates: {point.count}</Text>
            <Text fontSize="sm">Unique Users: {point.users.size}</Text>
            <Text fontSize="sm">
              Zone Center: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
            </Text>
            <Text fontSize="sm">
              Zone Area: {cellArea(latLngToCell(point.lat, point.lng, 10), 'm2').toFixed(0)} m²
            </Text>
            <Text fontSize="sm">Resolution: 10 (~36 km²)</Text>
          </Box>
        </Popup>
      </CircleMarker>
    ));
  }, [heatmapData, showH3Zones]);

  return (
    <>
      {/* Heatmap Layer with improved configuration */}
      <HeatmapLayer
        points={heatmapPoints}
        longitudeExtractor={(m: any) => m[1]}
        latitudeExtractor={(m: any) => m[0]}
        intensityExtractor={(m: any) => m[2]}
        max={2}
        radius={20}
        blur={10}
        maxZoom={18}
        minOpacity={0.3}
        gradient={{
          0.0: '#0000ff',
          0.2: '#00ffff',
          0.4: '#00ff00',
          0.6: '#ffff00',
          0.8: '#ff8000',
          1.0: '#ff0000',
        }}
      />
      {/* Individual markers for detailed view */}
      {individualMarkers}

      {/* H3 Zone markers for cluster information */}
      {h3ZoneMarkers}

      {/* Mobile Quick Access FAB - Only show when controls are collapsed on mobile */}
      <Box
        display={{ base: showControls ? 'none' : 'block', md: 'none' }}
        position="absolute"
        bottom="10px"
        right="10px"
        zIndex={1001}>
        <IconButton
          aria-label="Show map controls"
          icon={<FiLayers />}
          size="lg"
          colorScheme="blue"
          variant="solid"
          onClick={() => setShowControls(true)}
          borderRadius="full"
          shadow="2xl"
          w="56px"
          h="56px"
        />
      </Box>

      {/* Responsive Map Controls */}
      <Box
        position="absolute"
        bottom={{ base: '10px', md: '20px' }}
        right={{ base: '10px', md: '20px' }}
        zIndex={1000}
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(10px)"
        borderRadius={{ base: 'lg', md: 'xl' }}
        shadow="2xl"
        border="1px solid"
        borderColor="gray.200"
        minW={{ base: 'auto', md: '200px' }}
        maxW={{ base: 'calc(100vw - 20px)', md: 'none' }}
        display={{ base: showControls ? 'block' : 'none', md: 'block' }}>
        {/* Collapsible Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowControls(!showControls)}
          w="full"
          justifyContent="space-between"
          px={3}
          py={2}
          borderRadius={{ base: 'lg', md: 'xl' }}
          _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
          bg="transparent">
          <HStack spacing={2}>
            <FiLayers size={16} />
            <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold" color="gray.700">
              Map Layers
            </Text>
          </HStack>
          <HStack spacing={1}>
            {showControls ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
            {/* Mobile Close Button */}
            <Box display={{ base: 'block', md: 'none' }}>
              <IconButton
                aria-label="Close controls"
                icon={<FiChevronUp size={14} />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowControls(false);
                }}
                colorScheme="gray"
                _hover={{ bg: 'rgba(0, 0, 0, 0.1)' }}
              />
            </Box>
          </HStack>
        </Button>

        <Collapse in={showControls}>
          <VStack spacing={{ base: 2, md: 3 }} align="stretch" p={{ base: 2, md: 4 }}>
            {/* Individual Markers Toggle */}
            <HStack spacing={{ base: 2, md: 3 }} justify="space-between">
              <Tooltip label="Toggle individual markers" placement="top">
                <IconButton
                  aria-label="Toggle individual markers"
                  icon={showIndividualMarkers ? <FiEye /> : <FiEyeOff />}
                  size={{ base: 'sm', md: 'md' }}
                  variant={showIndividualMarkers ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setShowIndividualMarkers(!showIndividualMarkers)}
                  borderRadius="lg"
                  shadow="md"
                  minW={{ base: '32px', md: '40px' }}
                  h={{ base: '32px', md: '40px' }}
                />
              </Tooltip>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight="medium"
                flex={1}
                textAlign="left">
                Markers
              </Text>
              <Badge
                size={{ base: 'sm', md: 'md' }}
                colorScheme={showIndividualMarkers ? 'blue' : 'gray'}
                variant={showIndividualMarkers ? 'solid' : 'outline'}>
                {showIndividualMarkers ? 'ON' : 'OFF'}
              </Badge>
            </HStack>

            {/* H3 Zones Toggle */}
            <HStack spacing={{ base: 2, md: 3 }} justify="space-between">
              <Tooltip label="Toggle H3 zones" placement="top">
                <IconButton
                  aria-label="Toggle H3 zones"
                  icon={showH3Zones ? <FiEye /> : <FiEyeOff />}
                  size={{ base: 'sm', md: 'md' }}
                  variant={showH3Zones ? 'solid' : 'outline'}
                  colorScheme="red"
                  onClick={() => setShowH3Zones(!showH3Zones)}
                  borderRadius="lg"
                  shadow="md"
                  minW={{ base: '32px', md: '40px' }}
                  h={{ base: '32px', md: '40px' }}
                />
              </Tooltip>
              <Text
                fontSize={{ base: 'xs', md: 'sm' }}
                fontWeight="medium"
                flex={1}
                textAlign="left">
                H3 Zones
              </Text>
              <Badge
                size={{ base: 'sm', md: 'md' }}
                colorScheme={showH3Zones ? 'red' : 'gray'}
                variant={showH3Zones ? 'solid' : 'outline'}>
                {showH3Zones ? 'ON' : 'OFF'}
              </Badge>
            </HStack>

            <Divider />

            {/* Data Summary - Compact for mobile */}
            <VStack spacing={{ base: 1, md: 2 }} align="stretch">
              <HStack spacing={2} justify="center">
                <FiInfo size={14} />
                <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="semibold" color="gray.600">
                  Data Summary
                </Text>
              </HStack>
              <VStack spacing={1} align="stretch">
                <HStack justify="space-between" fontSize={{ base: 'xs', md: 'sm' }}>
                  <Text color="gray.500">Coordinates:</Text>
                  <Badge size="sm" colorScheme="blue" variant="subtle">
                    {data.length.toLocaleString()}
                  </Badge>
                </HStack>
                <HStack justify="space-between" fontSize={{ base: 'xs', md: 'sm' }}>
                  <Text color="gray.500">H3 Resolution:</Text>
                  <Badge size="sm" colorScheme="green" variant="subtle">
                    10
                  </Badge>
                </HStack>
              </VStack>
            </VStack>

            {/* Mobile Performance Tips */}
            <Box
              display={{ base: 'block', md: 'none' }}
              p={2}
              bg="orange.50"
              borderRadius="md"
              border="1px solid"
              borderColor="orange.200">
              <VStack spacing={1}>
                <Text fontSize="xs" color="orange.700" textAlign="center" fontWeight="medium">
                  Performance Tips
                </Text>
                <Text fontSize="xs" color="orange.600" textAlign="center">
                  • Hide markers for better performance • Use H3 zones for overview
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Collapse>
      </Box>

      {/* Mobile Quick Access FAB for Legend - Only show when legend is collapsed on mobile */}
      <Box
        display={{ base: showLegend ? 'none' : 'block', md: 'none' }}
        position="absolute"
        bottom="10px"
        left="10px"
        zIndex={1001}>
        <IconButton
          aria-label="Show heatmap legend"
          icon={<FiInfo />}
          size="lg"
          colorScheme="green"
          variant="solid"
          onClick={() => setShowLegend(true)}
          borderRadius="full"
          shadow="2xl"
          w="56px"
          h="56px"
        />
      </Box>

      {/* Responsive Heatmap Legend */}
      <Box
        position="absolute"
        bottom={{ base: '10px', md: '20px' }}
        left={{ base: '10px', md: '20px' }}
        zIndex={1000}
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(10px)"
        borderRadius={{ base: 'lg', md: 'xl' }}
        shadow="2xl"
        border="1px solid"
        borderColor="gray.200"
        minW={{ base: 'auto', md: '180px' }}
        maxW={{ base: 'calc(100vw - 20px)', md: 'none' }}
        display={{ base: showLegend ? 'block' : 'none', md: 'block' }}>
        {/* Collapsible Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
          w="full"
          justifyContent="space-between"
          px={3}
          py={2}
          borderRadius={{ base: 'lg', md: 'xl' }}
          _hover={{ bg: 'rgba(0, 0, 0, 0.05)' }}
          bg="transparent">
          <HStack spacing={2}>
            <FiInfo size={16} />
            <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="bold" color="gray.700">
              Heatmap Legend
            </Text>
          </HStack>
          <HStack spacing={1}>
            {showLegend ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
            {/* Mobile Close Button */}
            <Box display={{ base: 'block', md: 'none' }}>
              <IconButton
                aria-label="Close legend"
                icon={<FiChevronUp size={14} />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLegend(false);
                }}
                colorScheme="gray"
                _hover={{ bg: 'rgba(0, 0, 0, 0.1)' }}
              />
            </Box>
          </HStack>
        </Button>

        <Collapse in={showLegend}>
          <VStack spacing={{ base: 2, md: 3 }} align="stretch" p={{ base: 2, md: 4 }}>
            {/* Compact Legend Items */}
            <VStack spacing={{ base: 1, md: 2 }} align="stretch">
              {/* Low Intensity */}
              <HStack spacing={{ base: 2, md: 3 }} justify="space-between">
                <HStack spacing={{ base: 1, md: 2 }}>
                  <Box
                    w={{ base: '3', md: '4' }}
                    h={{ base: '3', md: '4' }}
                    bg="#0000ff"
                    borderRadius="sm"
                  />
                  <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium">
                    Low
                  </Text>
                </HStack>
                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                  0.0-0.4
                </Text>
              </HStack>

              {/* Medium Intensity */}
              <HStack spacing={{ base: 2, md: 3 }} justify="space-between">
                <HStack spacing={{ base: 1, md: 2 }}>
                  <Box
                    w={{ base: '3', md: '4' }}
                    h={{ base: '3', md: '4' }}
                    bg="#00ff00"
                    borderRadius="sm"
                  />
                  <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium">
                    Medium
                  </Text>
                </HStack>
                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                  0.4-0.8
                </Text>
              </HStack>

              {/* High Intensity */}
              <HStack spacing={{ base: 2, md: 3 }} justify="space-between">
                <HStack spacing={{ base: 1, md: 2 }}>
                  <Box
                    w={{ base: '3', md: '4' }}
                    h={{ base: '3', md: '4' }}
                    bg="#ff0000"
                    borderRadius="sm"
                  />
                  <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="medium">
                    High
                  </Text>
                </HStack>
                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                  0.8-1.0
                </Text>
              </HStack>
            </VStack>

            {/* Additional Info for Mobile */}
            <Box
              display={{ base: 'block', md: 'none' }}
              p={2}
              bg="blue.50"
              borderRadius="md"
              border="1px solid"
              borderColor="blue.200">
              <Text fontSize="xs" color="blue.700" textAlign="center">
                Tap to expand legend
              </Text>
            </Box>

            {/* Mobile Touch Tips */}
            <Box
              display={{ base: 'block', md: 'none' }}
              p={2}
              bg="green.50"
              borderRadius="md"
              border="1px solid"
              borderColor="green.200">
              <VStack spacing={1}>
                <Text fontSize="xs" color="green.700" textAlign="center" fontWeight="medium">
                  Touch Tips
                </Text>
                <Text fontSize="xs" color="green.600" textAlign="center">
                  • Pinch to zoom • Drag to pan • Tap markers for info
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Collapse>
      </Box>
    </>
  );
};
