import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  Icon,
  Flex,
  useToast,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  DrawerCloseButton,
  Divider,
  DrawerOverlay,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react';
import {
  FiMap,
  FiUsers,
  FiActivity,
  FiMapPin,
  FiShield,
  FiFilter,
  FiCalendar,
  FiUser,
  FiRefreshCw,
  FiLayers,
  FiMaximize,
  FiMinimize,
  FiChevronLeft,
  FiMenu,
} from 'react-icons/fi';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { getCoordinateHistory, CoordinateHistoryFilters } from '@/lib/api/coordinateHistoryApi';
import { getUsers } from '@/lib/api/userApi';
import 'leaflet/dist/leaflet.css';
import { HeatmapDataProcessor } from '../components/maps-heatmap/MapsHeatmaps';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MapBoundsListener, ZoomControls, ZoomListener } from '@/components/maps-location';
import {
  getEstatesAfdeling,
  getGeoJsonBlok,
  getRegional,
  getRegionalsWilayah,
  getWilayahsEstate,
} from '@/lib/api/areaApi';
import { BlokGeoJSON } from '../types/blockGeoJson.type';
import { BloksPolygonLayer } from '../components/bloks-polygon-layer/BloksPolygonLayer';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOutLeft = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100%); opacity: 0; }
`;

interface MapTileOption {
  label: string;
  value: string;
  source: string;
  icon: any;
  description: string;
}

const listUrl: MapTileOption[] = [
  {
    label: 'Street View',
    value: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    source: 'OpenStreetMap',
    icon: FiMap,
    description: 'Detailed street-level view',
  },
  {
    label: 'Satellite View',
    value:
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    source: 'Esri World Imagery',
    icon: FiMap,
    description: 'High-resolution satellite imagery',
  },
];

export const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [windowBounds, setWindowBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);
  const [blokOpacity, setBlokOpacity] = useState(0.5);

  const {
    isOpen: isMapLayersOpen,
    onOpen: onMapLayersOpen,
    onClose: onMapLayersClose,
  } = useDisclosure();

  const mapLayersRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const [selectedMapTile, setSelectedMapTile] = useState(listUrl[0]);
  const [mapZoom, setMapZoom] = useState(6);

  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(prev - 1, 1));
  };

  const [filters, setFilters] = useState<CoordinateHistoryFilters>({
    page: '1',
    limit: '100',
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRegionalId, setSelectedRegionalId] = useState<string>('');
  const [selectedWilayahId, setSelectedWilayahId] = useState<string>('');
  const [selectedEstateId, setSelectedEstateId] = useState<string>('');
  const [selectedAfdelingId, setSelectedAfdelingId] = useState<string>('');
  const [selectedGeoJsonBlok, setSelectedGeoJsonBlok] = useState<BlokGeoJSON | null>(null);
  const [coordinateHistoryData, setCoordinateHistoryData] = useState<any[]>([]);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const controlsBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(45, 55, 72, 0.95)');

  const {
    data: regionals,
    isLoading: isLoadingRegionals,
    isError: isErrorRegionals,
  } = useQuery({
    queryKey: ['regionals'],
    queryFn: () => getRegional(),
  });

  const dataRegional = !isErrorRegionals && regionals && 'data' in regionals ? regionals.data : [];

  const {
    data: wilayahs,
    isLoading: isLoadingWilayahs,
    isError: isErrorWilayahs,
  } = useQuery({
    queryKey: ['wilayahs', selectedRegionalId],
    queryFn: () => getRegionalsWilayah(selectedRegionalId),
    enabled: !!selectedRegionalId,
  });

  const dataWilayah = !isErrorWilayahs && wilayahs && 'data' in wilayahs ? wilayahs.data : [];

  const {
    data: estates,
    isLoading: isLoadingEstates,
    isError: isErrorEstates,
  } = useQuery({
    queryKey: ['estates', selectedWilayahId],
    queryFn: () => getWilayahsEstate(selectedWilayahId),
    enabled: !!selectedWilayahId,
  });

  const dataEstate = !isErrorEstates && estates && 'data' in estates ? estates.data : [];

  const {
    data: afdelings,
    isLoading: isLoadingAfdelings,
    isError: isErrorAfdelings,
  } = useQuery({
    queryKey: ['afdelings', selectedEstateId],
    queryFn: () => getEstatesAfdeling(selectedEstateId),
    enabled: !!selectedEstateId,
  });

  const dataAfdeling = !isErrorAfdelings && afdelings && 'data' in afdelings ? afdelings.data : [];

  const selectedEstateAbbr =
    dataEstate.find((estate: any) => String(estate.id) === selectedEstateId)?.abbr ?? null;
  const selectedAfdelingAbbr =
    dataAfdeling.find((afdeling: any) => String(afdeling.id) === selectedAfdelingId)?.abbr ?? null; // ex, AFD-OA
  const selectedAfdelingShortName = selectedAfdelingAbbr
    ? selectedAfdelingAbbr.split('-')[1]
    : null; // ex, OA

  const {
    data: geoJsonBlok,
    isLoading: isLoadingGeoJsonBlok,
    isError: isErrorGeoJsonBlok,
  } = useQuery({
    queryKey: ['geoJsonBlok', selectedEstateId, selectedAfdelingId],
    queryFn: () => getGeoJsonBlok(selectedEstateAbbr, selectedAfdelingShortName),
    enabled: selectedEstateAbbr !== null && selectedAfdelingShortName !== null,
  });

  useEffect(() => {
    if (
      geoJsonBlok &&
      !isLoadingGeoJsonBlok &&
      !isErrorGeoJsonBlok &&
      'type' in geoJsonBlok &&
      geoJsonBlok.type === 'FeatureCollection'
    ) {
      setSelectedGeoJsonBlok(geoJsonBlok as BlokGeoJSON);
    }
  }, [geoJsonBlok, isLoadingGeoJsonBlok, isErrorGeoJsonBlok]);

  // Only fetch data when filters have been applied
  const {
    data: coordinateHistoryResponse,
    isError: isErrorCoordinateHistory,
    isLoading: isLoadingCoordinateHistory,
    refetch: refetchCoordinateHistory,
  } = useQuery({
    queryKey: ['coordinateHistory', filters, windowBounds],
    queryFn: () => getCoordinateHistory(filters, windowBounds),
    enabled: hasAppliedFilters && windowBounds !== null, // Only fetch when filters are applied
  });

  const { data: usersResponse, isError: isErrorUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

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

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRefresh = async () => {
    if (!hasAppliedFilters) {
      toast({
        title: 'No Filters Applied',
        description: 'Please apply filters first to refresh data.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setRefreshing(true);
    await refetchCoordinateHistory();
    setRefreshing(false);
    toast({
      title: 'Data Refreshed',
      description: 'All tracking data has been updated.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleFilterChange = useCallback(() => {
    const newFilters: CoordinateHistoryFilters = {
      page: '1',
      limit: filters.limit,
    };

    if (startDate) newFilters.startDate = startDate;
    if (endDate) newFilters.endDate = endDate;
    if (selectedUserId) newFilters.userId = selectedUserId;

    setFilters(newFilters);
    setHasAppliedFilters(true);

    toast({
      title: 'Filters Applied',
      description: 'Fetching data with applied filters...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [startDate, endDate, selectedUserId, filters.limit]);

  const stats = useMemo(() => {
    const data = coordinateHistoryResponse?.data ?? [];

    if (!isLoadingCoordinateHistory) {
      setCoordinateHistoryData(data);
    }

    const totalCoordinates = data.length;
    const uniqueUsers = new Set(data.map((coord) => coord.user_id)).size;

    return [
      {
        label: 'Total Coordinates',
        number: totalCoordinates.toString(),
        change: '+0',
        changePercent: '0%',
        isPositive: true,
        helpText: 'tracking points',
        icon: FiMapPin,
        color: 'blue',
        gradient: 'linear(to-r, blue.400, blue.600)',
      },
      {
        label: 'Active Users',
        number: uniqueUsers.toString(),
        change: '+0',
        changePercent: '0%',
        isPositive: true,
        helpText: 'unique workers',
        icon: FiUsers,
        color: 'green',
        gradient: 'linear(to-r, green.400, green.600)',
      },
    ];
  }, [coordinateHistoryResponse]);

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isErrorCoordinateHistory || isErrorUsers) {
    return (
      <Box minH="100vh" bg={bgColor} p={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

  return (
    <Box h="100vh" w="full" bg={bgColor} position="relative" overflow="hidden">
      {/* Left Sidebar */}
      <Box
        ref={sidebarRef}
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w={isSidebarOpen ? sidebarWidth : 0}
        bg="white"
        borderRight="1px solid"
        borderColor={borderColor}
        boxShadow="xl"
        zIndex={30}
        transition={isResizing ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}
        overflow="hidden">
        {/* Sidebar Content */}
        <Box w={sidebarWidth} h="full" overflow="hidden" display="flex" flexDirection="column">
          {/* Scrollable Content Container */}
          <Box
            flex="1"
            overflowY="auto"
            overflowX="hidden"
            p={4}
            opacity={isSidebarOpen ? 1 : 0}
            transition="opacity 0.3s ease"
            animation={
              isSidebarOpen ? `${slideInLeft} 0.3s ease-out` : `${slideOutLeft} 0.3s ease-in`
            }
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
            {/* Header */}
            <VStack spacing={4} align="stretch" mb={6}>
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <Box
                    p={2}
                    bgGradient="linear(to-r, purple.500, blue.500)"
                    color="white"
                    borderRadius="lg"
                    animation={`${pulse} 3s infinite`}>
                    <Icon as={FiActivity} boxSize={5} />
                  </Box>
                  <VStack spacing={0} align="start">
                    <Text fontSize="md" color="gray.800" fontWeight="black">
                      CWA Control Center
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Quality Control Worker Analytics
                    </Text>
                  </VStack>
                </HStack>
              </HStack>

              <Divider />

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

              <Divider />

              {/* Area Section */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Area
                </Text>

                {/* slider for blok opacity */}
                <Slider
                  aria-label="slider-ex-1"
                  value={blokOpacity}
                  onChange={(value) => setBlokOpacity(value)}
                  min={0}
                  max={1}
                  step={0.05}>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>

                {/* Regional Select */}
                <FormControl>
                  <Select
                    value={selectedRegionalId}
                    onChange={(e) => setSelectedRegionalId(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    disabled={isLoadingRegionals}
                    placeholder="Select Regional">
                    {dataRegional.map((regional: any) => (
                      <option key={regional.id} value={regional.id.toString()}>
                        {regional.nama}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Wilayah Select */}
                <FormControl>
                  <Select
                    value={selectedWilayahId}
                    onChange={(e) => setSelectedWilayahId(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    disabled={isLoadingWilayahs || isLoadingRegionals}
                    placeholder="Select Wilayah">
                    {dataWilayah.map((wilayah: any) => (
                      <option key={wilayah.id} value={wilayah.id.toString()}>
                        {wilayah.nama}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Estate Select */}
                <FormControl>
                  <Select
                    value={selectedEstateId}
                    onChange={(e) => setSelectedEstateId(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    disabled={isLoadingEstates || isLoadingWilayahs || isLoadingRegionals}
                    placeholder="Select Estate">
                    {dataEstate.map((estate: any) => (
                      <option key={estate.id} value={estate.id.toString()}>
                        {estate.nama}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Afdeling Select */}
                <FormControl>
                  <Select
                    value={selectedAfdelingId}
                    onChange={(e) => setSelectedAfdelingId(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    disabled={
                      isLoadingAfdelings ||
                      isLoadingEstates ||
                      isLoadingWilayahs ||
                      isLoadingRegionals
                    }
                    placeholder="Select Afdeling">
                    {dataAfdeling.map((afdeling: any) => (
                      <option key={afdeling.id} value={afdeling.id.toString()}>
                        {afdeling.nama}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>

              <Divider />

              {/* Filters Section */}
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                  Data Filters
                </Text>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.700" fontWeight="semibold">
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} boxSize={4} color="blue.500" />
                      <Text fontSize="sm" color="gray.700" fontWeight="semibold">
                        Start Date
                      </Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                    bg="white"
                    color="gray.800"
                    _placeholder={{ color: 'gray.400' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.700" fontWeight="semibold">
                    <HStack spacing={2}>
                      <Icon as={FiCalendar} boxSize={4} color="blue.500" />
                      <Text fontSize="sm" color="gray.700" fontWeight="semibold">
                        End Date
                      </Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                    bg="white"
                    color="gray.800"
                    _placeholder={{ color: 'gray.400' }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" color="gray.700" fontWeight="semibold">
                    <HStack spacing={2}>
                      <Icon as={FiUser} boxSize={4} color="blue.500" />
                      <Text fontSize="sm" color="gray.700" fontWeight="semibold">
                        User
                      </Text>
                    </HStack>
                  </FormLabel>
                  <Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    size="sm"
                    borderRadius="lg"
                    placeholder="All Users"
                    borderColor="gray.300"
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                    bg="white"
                    color="gray.800"
                    _placeholder={{ color: 'gray.400' }}>
                    {usersResponse?.data?.map((user) => (
                      <option key={user.id} value={user.id.toString()}>
                        {user.nama || user.username || `User ${user.id}`}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <HStack justify="center" pt={2}>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FiFilter />}
                    onClick={handleFilterChange}
                    size="md"
                    borderRadius="xl"
                    fontWeight="semibold"
                    w="full">
                    Apply Filters
                  </Button>
                </HStack>

                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedUserId('');
                    setFilters({ page: '1', limit: '100' });
                    setHasAppliedFilters(false);
                  }}
                  size="md"
                  borderRadius="xl"
                  fontWeight="semibold"
                  borderColor="gray.300"
                  color="gray.700"
                  _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
                  w="full">
                  Clear Filters
                </Button>
              </VStack>
            </VStack>
          </Box>
        </Box>

        {/* Resize Handle */}
        <Box
          ref={resizeHandleRef}
          position="absolute"
          right={0}
          top={0}
          bottom={0}
          w="6px"
          bg={isResizing ? 'blue.500' : 'gray.300'}
          cursor="col-resize"
          _hover={{
            bg: 'blue.400',
            w: '8px',
            right: '-2px',
          }}
          _active={{ bg: 'blue.500' }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
          }}
          zIndex={31}
          userSelect="none"
          style={{ userSelect: 'none' }}
          transition="all 0.2s ease"
        />

        {/* Resize Overlay Indicator */}
        {isResizing && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.1)"
            zIndex={9999}
            pointerEvents="none"
            cursor="col-resize"
          />
        )}
      </Box>

      {/* Main Content Area */}
      <Box
        position="absolute"
        left={isSidebarOpen ? sidebarWidth : 0}
        top={0}
        right={0}
        bottom={0}
        transition="left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        zIndex={1}>
        {/* Top Header Panel */}
        <Box position="absolute" top={4} left={4} right={4} zIndex={20} pointerEvents="none">
          <Flex justify="space-between" align="start">
            {/* Left side - Toggle Sidebar Button and Brand */}
            <HStack spacing={3} pointerEvents="auto">
              <IconButton
                aria-label="Toggle sidebar"
                icon={isSidebarOpen ? <FiChevronLeft /> : <FiMenu />}
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

              <Card
                bg={controlsBg}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                shadow="xl"
                p={3}
                pointerEvents="auto"
                animation={`${slideIn} 0.5s ease-out`}>
                <HStack spacing={3}>
                  <Box
                    p={2}
                    bgGradient="linear(to-r, purple.500, blue.500)"
                    color="white"
                    borderRadius="lg"
                    animation={`${pulse} 3s infinite`}>
                    <Icon as={FiActivity} boxSize={5} />
                  </Box>
                  <VStack spacing={0} align="start">
                    <Text fontSize="md" color="gray.800" fontWeight="black">
                      CWA Control Center
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      Quality Control Worker Analytics
                    </Text>
                  </VStack>
                </HStack>
              </Card>
            </HStack>

            {/* Right side - Controls */}
            <HStack spacing={2} pointerEvents="auto">
              {/* Tile Layer Selector */}
              <Tooltip label="Map Layers">
                <IconButton
                  aria-label="Map layers"
                  icon={<FiLayers />}
                  variant="ghost"
                  size="md"
                  onClick={onMapLayersOpen}
                  bg={controlsBg}
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  shadow="lg"
                  _hover={{ bg: 'rgba(255, 255, 255, 0.98)' }}
                />
              </Tooltip>

              {/* Refresh Button */}
              <Tooltip label="Refresh Data">
                <IconButton
                  aria-label="Refresh data"
                  icon={<FiRefreshCw />}
                  variant="ghost"
                  size="md"
                  isLoading={refreshing}
                  onClick={handleRefresh}
                  bg={controlsBg}
                  backdropFilter="blur(10px)"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="lg"
                  shadow="lg"
                  _hover={{ bg: 'rgba(255, 255, 255, 0.98)' }}
                />
              </Tooltip>

              {/* Fullscreen Button */}
              <Tooltip label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
                <IconButton
                  aria-label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  icon={isFullScreen ? <FiMinimize /> : <FiMaximize />}
                  onClick={handleFullScreen}
                  size="md"
                  bgGradient="linear(to-r, purple.500, blue.500)"
                  color="white"
                  _hover={{
                    bgGradient: 'linear(to-r, purple.600, blue.600)',
                    transform: 'scale(1.05)',
                  }}
                  borderRadius="lg"
                  shadow="lg"
                  animation={`${float} 3s ease-in-out infinite`}
                />
              </Tooltip>

              {/* User Menu */}
              <Menu>
                <MenuButton as={Button} bg={controlsBg} variant="ghost" size="md">
                  <HStack spacing={2}>
                    <Avatar size="sm" name={user?.username} bg="purple.500" />
                    <VStack spacing={0} align="start" display={{ base: 'none', sm: 'flex' }}>
                      <Text fontSize="xs" fontWeight="semibold">
                        {user?.username}
                      </Text>
                      <Text fontSize="2xs" color="gray.500">
                        {user?.nama}
                      </Text>
                    </VStack>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiShield />} onClick={handleLogout} color="red.500">
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Box>

        {/* Map Container */}
        <Box p={0} h="full" pointerEvents={isResizing ? 'none' : 'auto'}>
          <MapContainer
            center={[-2.548926, 118.014863]}
            zoom={mapZoom}
            className="w-full h-full z-10"
            zoomControl={false}
            scrollWheelZoom={!isResizing}
            attributionControl={false}>
            <TileLayer url={selectedMapTile.value} attribution={selectedMapTile.source} />
            {selectedGeoJsonBlok && (
              <BloksPolygonLayer blokGeoJSON={selectedGeoJsonBlok} opacity={blokOpacity} />
            )}
            <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
            <ZoomListener onZoomChange={setMapZoom} />
            <HeatmapDataProcessor data={coordinateHistoryData} />
            <MapBoundsListener setWindowBounds={setWindowBounds} />
          </MapContainer>
        </Box>
      </Box>

      {/* Map Layers Drawer */}
      <Drawer
        isOpen={isMapLayersOpen}
        placement="right"
        onClose={onMapLayersClose}
        finalFocusRef={mapLayersRef}
        size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" color="gray.800" fontWeight="bold" fontSize="lg">
            Map Layers
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch" pt={4}>
              {listUrl.map((item) => (
                <Card
                  key={item.value}
                  onClick={() => {
                    setSelectedMapTile(item);
                    onMapLayersClose();
                  }}
                  cursor="pointer"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                  transition="all 0.2s">
                  <CardBody>
                    <HStack spacing={3}>
                      <Icon as={item.icon} color="purple.500" boxSize={5} />
                      <Text fontWeight="bold" color="gray.800">
                        {item.label}
                      </Text>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
