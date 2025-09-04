import {
  Badge,
  Box,
  Button,
  Collapse,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { ComponentProps, FC } from 'react';
import { FiChevronUp, FiEye, FiGrid, FiLayers, FiMap } from 'react-icons/fi';

import heatmapDefaultConfig from '../../constants/heatmapConfig';
import listMapTileOptions from '../../constants/listMapTileOptions';
import { TrackingTimelinePlayer } from '../tracking-timeline-player/TrackingTimelinePlayer';

export const MapsHeatmapLayerControl: FC<{
  areaOpacity?: number;
  setAreaOpacity?: (opacity: number) => void;
  selectedMapTileIndex: number;
  setSelectedMapTileIndex: (index: number) => void;
  isUsingH3: boolean;
  showHeatmap: boolean;
  showClusteredMarkers: boolean;
  showMarker: boolean;
  setShowHeatmap: (show: boolean) => void;
  setShowClusteredMarkers: (show: boolean) => void;
  setShowMarker: (show: boolean) => void;
  showPolyline?: boolean;
  setShowPolyline?: (show: boolean) => void;
  heatmapGradient?: Record<number, string>;
}> = ({
  areaOpacity,
  setAreaOpacity,
  selectedMapTileIndex,
  setSelectedMapTileIndex,
  isUsingH3,
  showHeatmap,
  showClusteredMarkers,
  showMarker,
  setShowHeatmap,
  setShowClusteredMarkers,
  setShowMarker,
  showPolyline,
  setShowPolyline,
  heatmapGradient: heatmapGradientProp,
}) => {
  const heatmapGradient = heatmapGradientProp ?? heatmapDefaultConfig.gradient;

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
  // Create gradient background for range
  const createGradientBackground = (startColor: string, endColor: string) => {
    return `linear-gradient(to right, ${startColor}, ${endColor})`;
  };

  const ranges = [
    {
      legend: '1',
      background: createGradientBackground(heatmapGradient['0.6'], heatmapGradient['0.7']),
    },
    {
      legend: '2',
      background: createGradientBackground(heatmapGradient['0.7'], heatmapGradient['0.9']),
    },
    {
      legend: '3',
      background: createGradientBackground(heatmapGradient['0.9'], heatmapGradient['1']),
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
      <TrackingTimelinePlayer />
      <VStack
        spacing={0}
        bg={bgColor}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="lg"
        overflow="hidden"
        minWidth="300px">
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
          <VStack spacing={3} p={3}>
            {/* Tile Layer Selector */}
            <Box w="100%">
              <Text fontSize="xs" fontWeight="600" color={textColor} mb={1}>
                Map Style
              </Text>
              <SimpleGrid columns={2} spacing={1}>
                {listMapTileOptions.map((option, index) => (
                  <Tooltip
                    key={option.value}
                    label={`${option.description} (${option.source})`}
                    placement="top"
                    hasArrow>
                    <Box
                      position="relative"
                      cursor="pointer"
                      borderRadius="md"
                      overflow="hidden"
                      border="1px solid"
                      borderColor={selectedMapTileIndex === index ? activeBorder : borderColor}
                      bg={selectedMapTileIndex === index ? activeFill : 'transparent'}
                      transition="all 0.2s"
                      _hover={{
                        borderColor:
                          selectedMapTileIndex === index ? activeBorder : hoverBorderColor,
                        bg: selectedMapTileIndex === index ? activeFill : hoverNonactiveFill,
                        transform: 'translateY(-1px)',
                        boxShadow: 'sm',
                      }}
                      onClick={() => setSelectedMapTileIndex(index)}>
                      {/* Thumbnail */}
                      <Box position="relative" h="40px" overflow="hidden">
                        <Image
                          src={option.thumbnail}
                          alt={option.label}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                          fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNjBDMTAwIDYwIDg1IDQ1IDcwIDQ1QzU1IDQ1IDQwIDYwIDQwIDYwQzQwIDYwIDU1IDc1IDcwIDc1Qzg1IDc1IDEwMCA2MCAxMDAgNjBaIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgNjBDMTYwIDYwIDE0NSA0NSAxMzAgNDVDMTE1IDQ1IDEwMCA2MCAxMDAgNjBDMTAwIDYwIDExNSA3NSAxMzAgNzVDMTQ1IDc1IDE2MCA2MCAxNjAgNjBaIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo="
                        />
                        {/* Overlay for selected state */}
                        {selectedMapTileIndex === index && (
                          <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            bg="blue.500"
                            opacity={0.2}
                            display="flex"
                            alignItems="center"
                            justifyContent="center">
                            <Icon as={FiEye} color="white" boxSize={3} />
                          </Box>
                        )}
                      </Box>

                      {/* Label */}
                      <Box p={1}>
                        <Text
                          fontSize="2xs"
                          fontWeight="500"
                          color={selectedMapTileIndex === index ? 'blue.700' : textColor}
                          textAlign="center"
                          noOfLines={1}>
                          {option.label}
                        </Text>
                      </Box>

                      {/* Selection indicator */}
                      {selectedMapTileIndex === index && (
                        <Box
                          position="absolute"
                          top={1}
                          right={1}
                          bg="blue.500"
                          color="white"
                          borderRadius="full"
                          p={0.5}
                          boxSize={4}
                          display="flex"
                          alignItems="center"
                          justifyContent="center">
                          <Icon as={FiEye} boxSize={2.5} />
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                ))}
              </SimpleGrid>
            </Box>

            {/* Divider */}
            <Box w="100%" h="1px" bg={borderColor} opacity={0.5} />

            {/* Area Opacity Slider*/}
            {areaOpacity !== undefined && setAreaOpacity !== undefined && (
              <>
                <Box w="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight="600" color={textColor}>
                      Area Opacity
                    </Text>
                    <Text fontSize="xs" color="blue.500" fontWeight="500">
                      {(areaOpacity * 100).toFixed(0)}%
                    </Text>
                  </HStack>
                  <Slider
                    value={areaOpacity}
                    onChange={setAreaOpacity}
                    min={0}
                    max={1}
                    step={0.02}
                    size="sm"
                    colorScheme="blue">
                    <SliderTrack bg={borderColor}>
                      <SliderFilledTrack bg="blue.500" />
                    </SliderTrack>
                    <SliderThumb
                      boxSize={4}
                      bg="blue.500"
                      _hover={{ bg: 'blue.600' }}
                      _active={{ bg: 'blue.700' }}
                    />
                  </Slider>
                </Box>
                {/* Divider */}
                <Box w="100%" h="1px" bg={borderColor} opacity={0.5} />
              </>
            )}

            {/* Heatmap */}
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

            {!isUsingH3 && showPolyline === undefined && (
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

            {showPolyline !== undefined && setShowPolyline !== undefined && (
              <Tooltip label="Toggle polyline" placement="left">
                <Button
                  size="sm"
                  width="100%"
                  variant="outline"
                  bg={showPolyline ? activeFill : 'transparent'}
                  borderColor={showPolyline ? activeBorder : borderColor}
                  color={showPolyline ? 'blue.700' : textColor}
                  onClick={() => setShowPolyline(!showPolyline)}
                  leftIcon={<Icon as={FiMap} boxSize={3.5} />}
                  justifyContent="flex-start"
                  px={3}
                  py={2}
                  borderRadius="lg"
                  fontSize="xs"
                  fontWeight="500"
                  transition="all 0.2s">
                  Garis Timeline
                  {showPolyline && (
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
                  <VStack spacing={1} flex="1" key={range.legend}>
                    <Box w="100%" h="10px" background={range.background} borderRadius="4px" />
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
