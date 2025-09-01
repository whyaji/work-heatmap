import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  Collapse,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Progress,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FC, useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiMenu, FiSkipBack, FiSkipForward } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';

import { User } from '@/lib/api/userApi';
import { AreaType } from '@/types/area.type';

import { useFilterAreaForm } from '../../hooks/useFIlterAreaForm.hook';
import { useFilterDataForm } from '../../hooks/useFilterDataForm.hook';
import { useTrackingIndexStore } from '../../lib/store/trackingIndexStore';
import { CustomizeFormView } from '../customize-form-view/CustomizeFormView';
import { FilterAreaFormView } from '../filter-area-form-view/FilterAreaFormView';
import { FilterDataFormView } from '../filter-data-form-view/FilterDataFormView';
import { SideBarResizeHandle } from '../side-bar-resize-handle/SideBarResizeHandle';

// Animation keyframes
const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

export const SideBarDashboard: FC<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  borderColor?: string;
  bgColor?: string;
  controlsBg?: string;
  stats: {
    label: string;
    number: string;
    helpText: string;
    icon: IconType;
    color: string;
    gradient: string;
  }[];
  isLoadingAreaData: boolean;
  dataRegional: AreaType[];
  dataWilayah: AreaType[];
  dataEstate: AreaType[];
  dataAfdeling: AreaType[];
  filterAreaFormState: ReturnType<typeof useFilterAreaForm>;
  userListData: User[];
  filterDataFormState: ReturnType<typeof useFilterDataForm>;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  tempRadius: number;
  setTempRadius: (radius: number) => void;
  isExportImageOpen?: boolean;
}> = ({
  isSidebarOpen,
  toggleSidebar,
  isMobile,
  borderColor = 'gray.200',
  bgColor = 'white',
  controlsBg = 'white',
  stats,
  isLoadingAreaData,
  dataRegional,
  dataWilayah,
  dataEstate,
  dataAfdeling,
  filterAreaFormState,
  userListData,
  filterDataFormState,
  onApplyFilters,
  onClearFilters,
  tempRadius,
  setTempRadius,
  isExportImageOpen = false,
}) => {
  const isTrackingTimeline = useTrackingIndexStore((state) => state.isTrackingTimeline);
  const setIsTrackingTimeline = useTrackingIndexStore((state) => state.setIsTrackingTimeline);
  const trackingIndex = useTrackingIndexStore((state) => state.trackingIndex);
  const onNextIndex = useTrackingIndexStore((state) => state.onNextIndex);
  const onPrevIndex = useTrackingIndexStore((state) => state.onPrevIndex);
  const lengthTrackingIndex = useTrackingIndexStore((state) => state.length);

  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  // Handle sidebar resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        // Prevent text selection and other interactions
        e.preventDefault();
        e.stopPropagation();

        const newWidth = e.clientX;
        if (newWidth >= 250 && newWidth <= 1000) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Re-enable text selection after resize
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };

    if (isResizing) {
      // Disable text selection during resize
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';

      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Clean up user-select styles
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isResizing]);
  return (
    <Box
      ref={sidebarRef}
      position="absolute"
      left={2}
      right={isMobile ? 2 : undefined}
      top={2}
      bottom={isSidebarOpen ? 2 : undefined}
      borderRadius={10}
      w={isMobile ? undefined : sidebarWidth}
      bg="white"
      borderRight="1px solid"
      borderColor={borderColor}
      boxShadow="xl"
      zIndex={30}
      transition={isResizing ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}
      overflow="hidden">
      {/* Sidebar Content */}
      <Box
        w={isMobile ? undefined : sidebarWidth}
        h="full"
        overflow="hidden"
        display="flex"
        flexDirection="column">
        {/* Header */}
        <HStack
          justify="space-between"
          align="center"
          top={0}
          zIndex={10}
          p={isMobile ? 2 : 4}
          borderBottomWidth="1px"
          borderBottomColor="gray.200"
          bg={bgColor}>
          <HStack spacing={3} w="full">
            {!isExportImageOpen && (
              <IconButton
                aria-label="Toggle sidebar"
                icon={isSidebarOpen ? <FiChevronDown /> : <FiMenu />}
                variant="ghost"
                size="md"
                onClick={toggleSidebar}
                bg={controlsBg}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="lg"
                _hover={{ bg: 'rgba(255, 255, 255, 0.98)' }}
                transition="all 0.3s ease"
              />
            )}
            <Box bgGradient="linear(to-r, purple.500, blue.500)" color="white" borderRadius="lg">
              <Image src="/cwa-logo.jpeg" alt="CWA Logo" boxSize={10} borderRadius={10} />
            </Box>
            <VStack spacing={0} align="start">
              <Text fontSize={isMobile ? 'sm' : 'md'} color="gray.800" fontWeight="black">
                CBI Work Area Plus
              </Text>
              <Text fontSize={'xs'} color="gray.500">
                Quality Control Worker Analytics
              </Text>
            </VStack>
          </HStack>
        </HStack>
        {/* Scrollable Content Container */}
        <Collapse in={isSidebarOpen} animateOpacity>
          <Box
            flex="1"
            overflowY="auto"
            h="full"
            overflowX="hidden"
            css={{
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#CBD5E0',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#A0AEC0',
              },
            }}>
            <VStack align="stretch" p={4} spacing={4}>
              {/* Stats Section */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Statistics
                </Text>
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    shadow="md"
                    border="1px solid"
                    borderColor={borderColor}
                    _hover={{
                      shadow: 'lg',
                      transform: 'translateY(-2px)',
                      borderColor: `${stat.color}.200`,
                    }}
                    transition="all 0.3s"
                    borderRadius="lg"
                    overflow="hidden"
                    animation={`${slideIn} 0.5s ease-out ${index * 0.1}s both`}>
                    <Box h="2px" bgGradient={stat.gradient} />
                    <CardBody p={3}>
                      <Stat>
                        <Flex justify="space-between" align="center">
                          <HStack spacing={2} align="center">
                            <Box
                              p={2}
                              bgGradient={stat.gradient}
                              color="white"
                              borderRadius="md"
                              _hover={{ transform: 'scale(1.1)' }}
                              transition="all 0.2s">
                              <Icon as={stat.icon} boxSize={3} />
                            </Box>
                            <VStack spacing={0} align="start">
                              <StatLabel color="gray.600" fontSize="xs" fontWeight="medium">
                                {stat.label}
                              </StatLabel>
                              <StatNumber color="gray.800" fontSize="lg" fontWeight="black">
                                {stat.number}
                              </StatNumber>
                              <StatHelpText color="gray.500" fontSize="xs" mb={0}>
                                {stat.helpText}
                              </StatHelpText>
                            </VStack>
                          </HStack>
                        </Flex>
                      </Stat>
                    </CardBody>
                  </Card>
                ))}
              </VStack>

              {!isExportImageOpen && (
                <>
                  <Divider />
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Tracking Timeline
                  </Text>

                  {isTrackingTimeline ? (
                    <>
                      {/* Progress Bar */}
                      <Box w="100%">
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="xs" color="gray.500" fontWeight="500">
                            Progress
                          </Text>
                          <Text fontSize="xs" color="blue.500" fontWeight="600">
                            {trackingIndex + 1} / {lengthTrackingIndex}
                          </Text>
                        </HStack>
                        <Progress
                          value={
                            lengthTrackingIndex > 0
                              ? ((trackingIndex + 1) / lengthTrackingIndex) * 100
                              : 0
                          }
                          size="sm"
                          colorScheme="blue"
                          borderRadius="full"
                          bg="gray.100"
                        />
                      </Box>

                      {/* Navigation Controls */}
                      <HStack spacing={2} w="100%">
                        <Tooltip label="Go to first point" placement="top">
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => useTrackingIndexStore.getState().setTrackingIndex(0)}
                            isDisabled={trackingIndex === 0}
                            flex={1}
                            leftIcon={<Icon as={FiSkipBack} boxSize={3} />}
                            fontSize="xs"
                            className="timeline-control-btn">
                            First
                          </Button>
                        </Tooltip>

                        <Tooltip label="Previous point" placement="top">
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => onPrevIndex()}
                            isDisabled={trackingIndex === 0}
                            flex={1}
                            leftIcon={
                              <Icon as={FiChevronUp} boxSize={3} transform="rotate(-90deg)" />
                            }
                            fontSize="xs"
                            className="timeline-control-btn">
                            Prev
                          </Button>
                        </Tooltip>

                        <Tooltip label="Next point" placement="top">
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => onNextIndex()}
                            isDisabled={trackingIndex >= lengthTrackingIndex - 1}
                            flex={1}
                            leftIcon={
                              <Icon as={FiChevronUp} boxSize={3} transform="rotate(90deg)" />
                            }
                            fontSize="xs"
                            className="timeline-control-btn">
                            Next
                          </Button>
                        </Tooltip>

                        <Tooltip label="Go to last point" placement="top">
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() =>
                              useTrackingIndexStore
                                .getState()
                                .setTrackingIndex(lengthTrackingIndex - 1)
                            }
                            isDisabled={trackingIndex >= lengthTrackingIndex - 1}
                            flex={1}
                            leftIcon={<Icon as={FiSkipForward} boxSize={3} />}
                            fontSize="xs"
                            className="timeline-control-btn">
                            Last
                          </Button>
                        </Tooltip>
                      </HStack>

                      {/* Message tutup timeline untuk mengubah filter menggunakan alert*/}
                      <Button
                        size="xs"
                        variant="outline"
                        colorScheme="red"
                        onClick={() => setIsTrackingTimeline(false)}>
                        Tutup
                      </Button>
                      <Alert status="warning" variant="subtle" borderRadius="lg" p={3}>
                        <AlertIcon />
                        <AlertTitle fontSize="xs" fontWeight="normal" color="gray.700">
                          Tutup timeline untuk mengubah filter
                        </AlertTitle>
                      </Alert>
                    </>
                  ) : (
                    <Alert status="info" variant="subtle" borderRadius="lg" p={3}>
                      <AlertIcon />
                      <AlertTitle fontSize="xs" fontWeight="normal" color="gray.700">
                        Pilih salah satu koordinat untuk melihat timeline
                      </AlertTitle>
                    </Alert>
                  )}
                </>
              )}

              <Divider />

              {/* Area Section */}
              <FilterAreaFormView
                isLoading={isLoadingAreaData}
                dataRegional={dataRegional}
                dataWilayah={dataWilayah}
                dataEstate={dataEstate}
                dataAfdeling={dataAfdeling}
                filterAreaFormState={filterAreaFormState}
              />

              <Divider />

              {/* Filters Section */}
              <FilterDataFormView
                userListData={userListData}
                filterDataFormState={filterDataFormState}
                onApplyFilters={onApplyFilters}
                onClearFilters={onClearFilters}
                isExportImageOpen={isExportImageOpen}
              />

              {!isExportImageOpen && (
                <>
                  <Divider />
                  <CustomizeFormView tempRadius={tempRadius} setTempRadius={setTempRadius} />
                </>
              )}
            </VStack>
          </Box>
        </Collapse>
      </Box>

      {/* Resize Handle */}
      {!isMobile && !isExportImageOpen && (
        <SideBarResizeHandle
          resizeHandleRef={resizeHandleRef}
          isResizing={isResizing}
          setIsResizing={setIsResizing}
        />
      )}
    </Box>
  );
};
