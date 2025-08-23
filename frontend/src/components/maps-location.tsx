import { useCallback, useEffect, useRef } from 'react';
import { Box, VStack, IconButton, Tooltip } from '@chakra-ui/react';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { useMap, useMapEvents } from 'react-leaflet';

// Zoom Control Component that uses the map instance
export function ZoomControls({
  onZoomIn,
  onZoomOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
    onZoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
    onZoomOut();
  };

  return (
    <Box
      position="absolute"
      top={20}
      right={4}
      zIndex={1000}
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="xl"
      shadow="lg"
      p={1}>
      <VStack spacing={1}>
        <Tooltip label="Zoom In" placement="left">
          <IconButton
            aria-label="Zoom in"
            icon={<FiZoomIn />}
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
            _hover={{ bg: 'blue.50', color: 'blue.600' }}
          />
        </Tooltip>

        <Tooltip label="Zoom Out" placement="left">
          <IconButton
            aria-label="Zoom out"
            icon={<FiZoomOut />}
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
            _hover={{ bg: 'blue.50', color: 'blue.600' }}
          />
        </Tooltip>
      </VStack>
    </Box>
  );
}

// Component to listen to map zoom changes and update local state
export function ZoomListener({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleZoomEnd = () => {
      onZoomChange(map.getZoom());
    };

    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomChange]);

  return null;
}

export function MapBoundsListener({
  setWindowBounds,
  debounceTime = 2000,
}: {
  setWindowBounds: React.Dispatch<
    React.SetStateAction<{
      north: number;
      south: number;
      east: number;
      west: number;
    } | null>
  >;
  debounceTime?: number;
}) {
  const timeoutRef = useRef<Timer | null>(null);

  const debouncedSetBounds = useCallback(
    (windowBounds: { north: number; south: number; east: number; west: number }) => {
      // Clear timeout sebelumnya jika ada
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout baru
      timeoutRef.current = setTimeout(() => {
        setWindowBounds(windowBounds);
      }, debounceTime);
    },
    [setWindowBounds, debounceTime]
  );

  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const bounds = map.getBounds();

      const windowBounds = {
        north: bounds.getNorthEast().lat,
        south: bounds.getSouthWest().lat,
        east: bounds.getNorthEast().lng,
        west: bounds.getSouthWest().lng,
      };

      debouncedSetBounds(windowBounds);
    },
  });

  return null;
}
