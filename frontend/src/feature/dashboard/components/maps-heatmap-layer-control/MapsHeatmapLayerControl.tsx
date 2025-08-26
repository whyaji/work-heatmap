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
import { FC } from 'react';
import { FiMap, FiLayers, FiGrid, FiChevronUp, FiEye } from 'react-icons/fi';
import { heatmapConfig } from '../maps-heatmap/MapsHeatmaps';

// gradient: {
//   0.0: 'rgba(0, 255, 0, 0.8)', // Hijau terang dengan transparansi 80% (tidak terlihat)
//   0.2: 'rgba(128, 255, 0, 0.85)', // Hijau-kuning dengan transparansi 85% (minimal 1 tetangga)
//   0.4: 'rgba(255, 255, 0, 0.9)', // Kuning dengan transparansi 90% (2-3 tetangga)
//   0.6: 'rgba(255, 128, 0, 0.95)', // Orange dengan transparansi 95% (4-5 tetangga)
//   0.8: 'rgba(255, 64, 0, 1)', // Orange-merah opaque (6+ tetangga)
//   1.0: 'rgba(255, 0, 0, 1)', // Merah opaque (banyak tetangga)
// },

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

  // Convert gradient object to sorted array
  const gradientEntries = Object.entries(heatmapGradient).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );

  // Create ranges based on gradient stops
  const createRanges = () => {
    const ranges = [];

    for (let i = 0; i < gradientEntries.length - 1; i++) {
      const currentStop = gradientEntries[i];
      const nextStop = gradientEntries[i + 1];

      ranges.push({
        start: Number(currentStop[0]),
        end: Number(nextStop[0]),
        color: currentStop[1],
        endColor: nextStop[1],
      });
    }

    return ranges;
  };

  const ranges = createRanges();

  // Create gradient background for range
  const createGradientBackground = (startColor: string, endColor: string) => {
    return `linear-gradient(to right, ${startColor}, ${endColor})`;
  };

  if (isMobile) {
    return (
      <Box
        position="fixed"
        bottom={4}
        left="50%"
        transform="translateX(-50%)"
        zIndex={20}
        pointerEvents="auto"
        width="calc(100% - 2rem)"
        maxWidth="320px">
        <VStack
          spacing={0}
          bg={bgColor}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="lg"
          overflow="hidden">
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
              transition="transform 0.2s"
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
                  bg: showHeatmap ? activeFill : hoverNonactiveFill,
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

              {!isUsingH3 && (
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
              )}

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
                  bg: showMarker ? activeFill : hoverNonactiveFill,
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
            </VStack>
          </Collapse>
        </VStack>
      </Box>
    );
  }

  return (
    <Box position="absolute" bottom={6} right={6} zIndex={20} pointerEvents="auto" minWidth="250px">
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

            <Box w="100%">
              <Tooltip label="Heatmap gradient info" placement="left">
                <VStack spacing={2} style={{ width: '100%' }}>
                  <HStack spacing={1} w="100%">
                    {/* Range 1: 0.0 - 0.4 */}
                    <VStack spacing={1} flex="1">
                      <Box
                        w="100%"
                        h="20px"
                        background={`linear-gradient(to right, ${heatmapGradient['0']}, ${heatmapGradient['0.4']})`}
                        borderRadius="4px"
                        border="1px solid rgba(0,0,0,0.1)"
                      />
                      <Text fontSize="xs" color={textColor} fontWeight="500">
                        0.0 - 0.4
                      </Text>
                    </VStack>

                    {/* Range 2: 0.4 - 0.6 */}
                    <VStack spacing={1} flex="1">
                      <Box
                        w="100%"
                        h="20px"
                        background={`linear-gradient(to right, ${heatmapGradient['0.4']}, ${heatmapGradient['0.6']})`}
                        borderRadius="4px"
                        border="1px solid rgba(0,0,0,0.1)"
                      />
                      <Text fontSize="xs" color={textColor} fontWeight="500">
                        0.4 - 0.6
                      </Text>
                    </VStack>

                    {/* Range 3: 0.6 - 1.0 */}
                    <VStack spacing={1} flex="1">
                      <Box
                        w="100%"
                        h="20px"
                        background={`linear-gradient(to right, ${heatmapGradient['0.6']}, ${heatmapGradient['1']})`}
                        borderRadius="4px"
                        border="1px solid rgba(0,0,0,0.1)"
                      />
                      <Text fontSize="xs" color={textColor} fontWeight="500">
                        0.6 - 1.0
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Tooltip>
            </Box>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};
