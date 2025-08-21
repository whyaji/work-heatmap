import { useEffect } from 'react';
import { Box, VStack, IconButton, Tooltip } from '@chakra-ui/react';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { useMap } from 'react-leaflet';

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
