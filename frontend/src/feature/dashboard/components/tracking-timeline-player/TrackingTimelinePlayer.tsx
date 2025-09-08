import {
  Box,
  Button,
  Collapse,
  HStack,
  Icon,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiClock,
  FiMinus,
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiX,
  FiZap,
} from 'react-icons/fi';

import { getShortDateTime } from '@/utils/dateTimeFormatter';

import { useTrackingIndexStore } from '../../lib/store/trackingIndexStore';

const pulseBoxShadow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
  }
  70% {
    box-shadow: 0 0 0 64px rgba(168, 85, 247, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
  }
`;

export const TrackingTimelinePlayer = () => {
  const {
    isTrackingTimeline,
    setIsTrackingTimeline,
    trackingIndex,
    length: lengthTrackingIndex,
    setTrackingIndex,
    onNextIndex,
    onPrevIndex,
    coordinateDetail,
  } = useTrackingIndexStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<Timer | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLure, setIsLure] = useState(false);

  const lureRef = useRef<Timer | null>(null);

  useEffect(() => {
    if (isLure) {
      lureRef.current = setTimeout(() => {
        setIsLure(false);
      }, 5000);
    }
  }, [isLure]);

  useEffect(() => {
    if (!isTrackingTimeline) {
      setIsPlaying(false);
    } else {
      setIsOpen(true);
      setIsLure(true);
    }
  }, [isTrackingTimeline]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (trackingIndex < lengthTrackingIndex - 1) {
          onNextIndex();
        } else {
          // Loop back to start when reaching the end
          setTrackingIndex(0);
        }
        // saya ingin semakin banyak speed semakin sedikit intervalnya
      }, 1000 / playbackSpeed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, trackingIndex, lengthTrackingIndex, onNextIndex, setTrackingIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFirst = () => {
    setIsPlaying(false);
    setTrackingIndex(0);
  };

  const handleLast = () => {
    setIsPlaying(false);
    setTrackingIndex(lengthTrackingIndex - 1);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    onPrevIndex();
  };

  const handleNext = () => {
    setIsPlaying(false);
    onNextIndex();
  };

  // Color scheme for overlay on satellite/street view - Updated for smoke black background
  const bgColor = 'rgba(0, 0, 0, 0.3)'; // Smoke black semi-transparent
  const secondBgColor = 'rgba(0, 0, 0, 0.1)'; // Darker background for buttons and sliders
  const borderColor = 'rgba(255, 255, 255, 0.2)';
  const textColor = 'white';
  const accentColor = '#4C58FA'; // Light blue for better contrast on dark background
  const highlightColor = '#B0B2FF';
  const buttonBg = 'rgba(17 17 17 / 0.85)';
  const buttonHoverBg = 'rgba(255, 255, 255, 0.2)';
  const sliderBg = 'rgba(255, 255, 255, 0.2)';
  const sliderTrackBg = 'rgba(255, 255, 255, 0.3)';

  if (!isTrackingTimeline) return null;

  return (
    <Box
      marginBottom={4}
      pointerEvents="auto"
      animation={isLure ? `${pulseBoxShadow} 1s infinite` : undefined}
      borderRadius="xl">
      <VStack
        bg={bgColor}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.12)"
        backdropFilter="blur(1px)"
        align="stretch">
        {/* Header with close button */}
        <Button
          w="100%"
          p={0}
          variant="ghost"
          bg="transparent"
          _hover={{ bg: secondBgColor }}
          borderTopRadius="xl"
          borderBottomRadius="none"
          onClick={() => setIsOpen(!isOpen)}>
          <HStack justify="space-between" w="100%" px={4} py={2}>
            <HStack spacing={2}>
              <Icon as={FiClock} color={highlightColor} boxSize={4} />
              <Text fontSize="sm" fontWeight="600" color={textColor}>
                Tracking Timeline
              </Text>
            </HStack>

            <HStack spacing={2}>
              {/* minimize and maximize */}
              <Tooltip label="Minimize" placement="top">
                <IconButton
                  size="xs"
                  aria-label="Minimize"
                  variant="ghost"
                  _hover={{ bg: 'black' }}
                  icon={<Icon color="white" as={isOpen ? FiMinus : FiChevronUp} />}
                  onClick={() => setIsOpen(!isOpen)}
                />
              </Tooltip>

              <Tooltip label="Tutup timeline" placement="top">
                <IconButton
                  size="xs"
                  aria-label="Close timeline"
                  variant="ghost"
                  colorScheme="red"
                  _hover={{ bg: 'red.500', color: 'white' }}
                  icon={<Icon as={FiX} />}
                  onClick={() => setIsTrackingTimeline(false)}
                />
              </Tooltip>
            </HStack>
          </HStack>
        </Button>

        <Collapse
          in={isOpen}
          animateOpacity
          style={{
            width: '100%',
          }}>
          <VStack spacing={3} p={4} pt={0} align="stretch">
            {/* Coordinate details, display timestamp and user?.name */}
            {coordinateDetail && (
              <Box
                bg="rgba(11, 11, 11, 0.4)"
                borderRadius="lg"
                p={1}
                textAlign="center"
                boxShadow="inset 0 0 10px rgba(0, 0, 0, 0.2)">
                <Text fontSize="xs" color={textColor} fontWeight="600">
                  {coordinateDetail.user?.nama ?? 'Pengguna tidak dikenal'} -{' '}
                  {getShortDateTime(coordinateDetail.timestamp)}{' '}
                </Text>
              </Box>
            )}

            {/* Progress indicator */}
            <Box w="100%">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" color={textColor} fontWeight="500">
                  {trackingIndex + 1} / {lengthTrackingIndex}
                </Text>
                <HStack>
                <Popover placement="top">
                <PopoverTrigger>
                  <Box>
                    <Tooltip label="Atur kecepatan" placement="top">
                      <Button
                        size="sm"
                        variant="ghost"
                        bg={buttonBg}
                        color={textColor}
                        _hover={{ bg: buttonHoverBg }}
                        leftIcon={<Icon as={FiZap} />}
                        fontSize="xs"
                        fontWeight="600"
                        px={3}
                        h="26px"
                        w="75px"
                        borderRadius="full">
                        {playbackSpeed}x
                      </Button>
                    </Tooltip>
                  </Box>
                </PopoverTrigger>
                <PopoverContent 
                  bg={buttonBg} 
                  borderColor="rgba(255, 255, 255, 0.1)" 
                  boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
                  w="200px">
                  <PopoverArrow bg={buttonBg} />
                  <PopoverBody p={4}>
                    <VStack spacing={3}>
                      <Text fontSize="xs" color={textColor} fontWeight="600">
                        Kecepatan Pemutaran
                      </Text>
                      
                      {/* Speed preset buttons */}
                      <HStack spacing={1} w="100%">
                        {[0.25, 0.5, 1, 1.5, 2].map((speed) => (
                          <Button
                            key={speed}
                            size="xs"
                            variant={playbackSpeed === speed ? "solid" : "ghost"}
                            bg={playbackSpeed === speed ? accentColor : "transparent"}
                            color={playbackSpeed === speed ? "white" : textColor}
                            _hover={{ 
                              bg: playbackSpeed === speed ? accentColor : buttonHoverBg 
                            }}
                            onClick={() => setPlaybackSpeed(speed)}
                            fontSize="xs"
                            fontWeight="600"
                            flex={1}
                            h="24px">
                            {speed}x
                          </Button>
                        ))}
                      </HStack>

                      {/* Custom speed slider */}
                      <Box w="100%">
                        <Text fontSize="2xs" color={textColor} mb={2} opacity={0.8}>
                          Kustom
                        </Text>
                        <Slider
                          value={playbackSpeed}
                          onChange={setPlaybackSpeed}
                          min={0.25}
                          max={2}
                          step={0.25}
                          size="sm"
                          colorScheme="blue">
                          <SliderTrack h={2} borderRadius="full" bg={sliderTrackBg}>
                            <SliderFilledTrack bg={accentColor} />
                          </SliderTrack>
                          <SliderThumb
                            boxSize={4}
                            bg={accentColor}
                            _hover={{ bg: accentColor, transform: 'scale(1.1)' }}
                            _active={{ bg: accentColor }}
                            boxShadow="0 2px 6px rgba(0, 0, 0, 0.3)"
                          />
                        </Slider>
                      </Box>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
                <Text fontSize="xs" color={highlightColor} fontWeight="600" w="50px" textAlign="right">
                  {isPlaying ? 'Diputar' : 'Dijeda'}
                </Text>
                </HStack>
              </HStack>
              <Slider
                value={trackingIndex + 1}
                onChange={(value) => setTrackingIndex(value - 1)}
                min={1}
                max={lengthTrackingIndex}
                step={1}
                size="sm"
                colorScheme="blue">
                <SliderTrack h={3} borderRadius="full" bg={sliderBg}>
                  <SliderFilledTrack bg={accentColor} />
                </SliderTrack>
                <SliderThumb
                  boxSize={5}
                  bg={accentColor}
                  _hover={{ bg: accentColor, transform: 'scale(1.1)' }}
                  _active={{ bg: accentColor }}
                  boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
                />
              </Slider>
            </Box>

            {/* Control buttons */}
            <HStack spacing={2} w="100%" justify="center">
              <Tooltip label="Ke awal" placement="top">
                <IconButton
                  size="md"
                  aria-label="Ke awal"
                  variant="ghost"
                  bg={buttonBg}
                  color={textColor}
                  _hover={{ bg: buttonHoverBg }}
                  icon={<Icon as={FiSkipBack} />}
                  onClick={handleFirst}
                  isDisabled={trackingIndex === 0}
                />
              </Tooltip>

              <Tooltip label="Sebelumnya" placement="top">
                <IconButton
                  size="md"
                  aria-label="Sebelumnya"
                  variant="ghost"
                  bg={buttonBg}
                  color={textColor}
                  _hover={{ bg: buttonHoverBg }}
                  icon={<Icon as={FiChevronLeft} />}
                  onClick={handlePrev}
                  isDisabled={trackingIndex === 0}
                />
              </Tooltip>

              <Tooltip label={isPlaying ? 'Jeda' : 'Mainkan'} placement="top">
                <IconButton
                  size="lg"
                  aria-label={isPlaying ? 'Jeda' : 'Mainkan'}
                  variant="ghost"
                  bg={isPlaying ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}
                  _hover={{ bg: isPlaying ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)' }}
                  color={isPlaying ? '#FCA5A5' : '#86EFAC'}
                  icon={<Icon as={isPlaying ? FiPause : FiPlay} />}
                  onClick={handlePlayPause}
                />
              </Tooltip>

              <Tooltip label="Selanjutnya" placement="top">
                <IconButton
                  size="md"
                  aria-label="Selanjutnya"
                  variant="ghost"
                  bg={buttonBg}
                  color={textColor}
                  _hover={{ bg: buttonHoverBg }}
                  icon={<Icon as={FiChevronRight} />}
                  onClick={handleNext}
                  isDisabled={trackingIndex >= lengthTrackingIndex - 1}
                />
              </Tooltip>

              <Tooltip label="Ke akhir" placement="top">
                <IconButton
                  size="md"
                  aria-label="Ke akhir"
                  variant="ghost"
                  bg={buttonBg}
                  color={textColor}
                  _hover={{ bg: buttonHoverBg }}
                  icon={<Icon as={FiSkipForward} />}
                  onClick={handleLast}
                  isDisabled={trackingIndex >= lengthTrackingIndex - 1}
                />
              </Tooltip>
            </HStack>
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};
