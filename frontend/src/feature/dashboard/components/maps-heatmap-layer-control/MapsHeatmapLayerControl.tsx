import {
  Box,
  Button,
  VStack,
  HStack,
  useBreakpointValue,
  Icon,
  Tooltip,
  useColorModeValue,
  Badge,
  Collapse,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { ComponentProps, FC } from 'react';
import { FiMap, FiLayers, FiGrid, FiChevronUp, FiEye } from 'react-icons/fi';
import { heatmapConfig } from '../maps-heatmap/MapsHeatmaps';

export const MapsHeatmapLayerControl: FC<{
  isUsingH3: boolean;
  showHeatmap: boolean;
  showClusteredMarkers: boolean;
  showMarker: boolean;
  setShowHeatmap: (show: boolean) => void;
  setShowClusteredMarkers: (show: boolean) => void;
  setShowMarker: (show: boolean) => void;
}> = ({
  isUsingH3,
  showHeatmap,
  showClusteredMarkers,
  showMarker,
  setShowHeatmap,
  setShowClusteredMarkers,
  setShowMarker,
}) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const activeFill = useColorModeValue('blue.50', 'blue.900');
  const nonactiveFill = useColorModeValue('gray.50', 'gray.800');
  const activeBorder = useColorModeValue('blue.300', 'blue.400');

  // Additional color values for hover states
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const hoverNonactiveFill = useColorModeValue('gray.50', 'gray.800');
  const hoverBorderColor = useColorModeValue('gray.300', 'gray.500');

  // Calculate total active layers
  const activeLayers = [showHeatmap, showClusteredMarkers && !isUsingH3, showMarker].filter(
    Boolean
  ).length;

  const heatmapGradient = heatmapConfig.gradient;
  // Create gradient background for range
  const createGradientBackground = (startColor: string, endColor: string) => {
    return `linear-gradient(to right, ${startColor}, ${endColor})`;
  };

  const ranges = [
    {
      legend: '0.0 - 0.4',
      background: createGradientBackground(heatmapGradient['0'], heatmapGradient['0.4']),
    },
    {
      legend: '0.4 - 0.6',
      background: createGradientBackground(heatmapGradient['0.4'], heatmapGradient['0.6']),
    },
    {
      legend: '0.6 - 1.0',
      background: createGradientBackground(heatmapGradient['0.6'], heatmapGradient['1']),
    },
  ];

  const boxProps: ComponentProps<typeof Box> = isMobile
    ? {
        position: 'fixed',
        bottom: 4,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        pointerEvents: 'auto',
        width: 'calc(100% - 2rem)',
      }
    : {
        position: 'fixed',
        bottom: 6,
        right: 6,
        zIndex: 20,
        pointerEvents: 'auto',
        minWidth: '250px',
      };

  return (
    <Box {...boxProps}>
      <VStack
        spacing={0}
        bg={bgColor}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="lg"
        overflow="hidden"
        minWidth="280px">
        {/* Header with toggle and badge */}
        <HStack
          w="100%"
          p={3}
          bg={headerBg}
          borderBottom="1px solid"
          borderColor={borderColor}
          justify="space-between"
          cursor="pointer"
          onClick={onToggle}
          _hover={{ bg: hoverBg }}
          transition="background 0.2s">
          <HStack spacing={2}>
            <Icon as={FiEye} color="blue.500" boxSize={4} />
            <Text fontSize="sm" fontWeight="600" color={textColor}>
              Layers
            </Text>
            <Badge
              colorScheme="blue"
              variant="subtle"
              borderRadius="full"
              px={2}
              py={0.5}
              fontSize="xs">
              {activeLayers}
            </Badge>
          </HStack>
          <Icon
            as={FiChevronUp}
            color={textColor}
            transition="transform 0.3s"
            transform={isOpen ? 'rotate(0deg)' : 'rotate(180deg)'}
            boxSize={4}
          />
        </HStack>

        {/* Collapsible content */}
        <Collapse
          in={isOpen}
          animateOpacity
          style={{
            width: '100%',
          }}>
          <VStack spacing={2} p={3}>
            <Tooltip label="Toggle heatmap visualization" placement="left">
              <Button
                size="sm"
                width="100%"
                variant="outline"
                bg={showHeatmap ? activeFill : 'transparent'}
                borderColor={showHeatmap ? activeBorder : borderColor}
                color={showHeatmap ? 'blue.700' : textColor}
                onClick={() => setShowHeatmap(!showHeatmap)}
                leftIcon={<Icon as={FiLayers} boxSize={3.5} />}
                justifyContent="flex-start"
                px={3}
                py={2}
                borderRadius="lg"
                fontSize="xs"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  bg: showHeatmap ? activeFill : nonactiveFill,
                  borderColor: showHeatmap ? activeBorder : hoverBorderColor,
                }}>
                Heatmap
                {showHeatmap && (
                  <Badge
                    ml="auto"
                    colorScheme="blue"
                    variant="solid"
                    borderRadius="full"
                    fontSize="xs"
                    px={1.5}>
                    ON
                  </Badge>
                )}
              </Button>
            </Tooltip>

            {!isUsingH3 && (
              <Tooltip label="Toggle clustered marker view" placement="left">
                <Button
                  size="sm"
                  width="100%"
                  variant="outline"
                  bg={showClusteredMarkers ? activeFill : 'transparent'}
                  borderColor={showClusteredMarkers ? activeBorder : borderColor}
                  color={showClusteredMarkers ? 'blue.700' : textColor}
                  onClick={() => setShowClusteredMarkers(!showClusteredMarkers)}
                  leftIcon={<Icon as={FiGrid} boxSize={3.5} />}
                  justifyContent="flex-start"
                  px={3}
                  py={2}
                  borderRadius="lg"
                  fontSize="xs"
                  fontWeight="500"
                  transition="all 0.2s"
                  _hover={{
                    bg: showClusteredMarkers ? activeFill : hoverNonactiveFill,
                    borderColor: showClusteredMarkers ? activeBorder : hoverBorderColor,
                  }}>
                  Clustered
                  {showClusteredMarkers && (
                    <Badge
                      ml="auto"
                      colorScheme="blue"
                      variant="solid"
                      borderRadius="full"
                      fontSize="xs"
                      px={1.5}>
                      ON
                    </Badge>
                  )}
                </Button>
              </Tooltip>
            )}

            <Tooltip label="Toggle individual markers" placement="left">
              <Button
                size="sm"
                width="100%"
                variant="outline"
                bg={showMarker ? activeFill : 'transparent'}
                borderColor={showMarker ? activeBorder : borderColor}
                color={showMarker ? 'blue.700' : textColor}
                onClick={() => setShowMarker(!showMarker)}
                leftIcon={<Icon as={FiMap} boxSize={3.5} />}
                justifyContent="flex-start"
                px={3}
                py={2}
                borderRadius="lg"
                fontSize="xs"
                fontWeight="500"
                transition="all 0.2s"
                _hover={{
                  bg: showMarker ? activeFill : nonactiveFill,
                  borderColor: showMarker ? activeBorder : hoverBorderColor,
                }}>
                Markers
                {showMarker && (
                  <Badge
                    ml="auto"
                    colorScheme="blue"
                    variant="solid"
                    borderRadius="full"
                    fontSize="xs"
                    px={1.5}>
                    ON
                  </Badge>
                )}
              </Button>
            </Tooltip>

            <Tooltip label="Heatmap gradient info" placement="left" w="100%">
              <HStack spacing={1} w="100%">
                {ranges.map((range) => (
                  <VStack spacing={1} flex="1">
                    <Box w="100%" h="10px" background={range.background} borderRadius="4px" />
                    <Text fontSize="xs" color={textColor} fontWeight="500">
                      {range.legend}
                    </Text>
                  </VStack>
                ))}
              </HStack>
            </Tooltip>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};
