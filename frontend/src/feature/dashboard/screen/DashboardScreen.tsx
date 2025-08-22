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
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
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
} from 'react-icons/fi';
import { useState, useMemo, useCallback, useRef } from 'react';
import { keyframes } from '@emotion/react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { getCoordinateHistory, CoordinateHistoryFilters } from '@/lib/api/coordinateHistoryApi';
import { getUsers } from '@/lib/api/userApi';
import 'leaflet/dist/leaflet.css';
import { HeatmapDataProcessor } from '../components/maps-heatmap/MapsHeatmaps';
import { MapContainer, TileLayer } from 'react-leaflet';
import { ZoomControls, ZoomListener } from '@/components/maps-location';

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
  const { isOpen: isFiltersOpen, onOpen: onFiltersOpen, onClose: onFiltersClose } = useDisclosure();
  const {
    isOpen: isMapLayersOpen,
    onOpen: onMapLayersOpen,
    onClose: onMapLayersClose,
  } = useDisclosure();
  const filtersRef = useRef<HTMLButtonElement>(null);
  const mapLayersRef = useRef<HTMLButtonElement>(null);

  const [selectedMapTile, setSelectedMapTile] = useState(listUrl[0]);
  const [mapZoom, setMapZoom] = useState(12);

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

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const controlsBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(45, 55, 72, 0.95)');

  const {
    data: coordinateHistoryResponse,
    isLoading: isLoadingCoordinateHistory,
    isError: isErrorCoordinateHistory,
    refetch: refetchCoordinateHistory,
  } = useQuery({
    queryKey: ['coordinateHistory', filters],
    queryFn: () => getCoordinateHistory(filters),
  });

  const { data: usersResponse, isError: isErrorUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

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
    onFiltersClose();
  }, [startDate, endDate, selectedUserId, filters.limit, onFiltersClose]);

  const stats = useMemo(() => {
    if (!coordinateHistoryResponse?.data) return [];

    const data = coordinateHistoryResponse.data;
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
    <Box
      h="100vh"
      w="full"
      bg={bgColor}
      position="relative"
      overflow="hidden"
      sx={{
        '& .dashboard-panel': {
          '&:hover': {
            '& *': {
              pointerEvents: 'auto !important',
            },
          },
        },
      }}>
      {/* Full Screen Map Container */}
      <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={1}>
        {isLoadingCoordinateHistory ? (
          <Box
            w="full"
            h="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.100">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text color="gray.500" fontSize="lg">
                Loading coordinate data...
              </Text>
            </VStack>
          </Box>
        ) : coordinateHistoryResponse?.data && coordinateHistoryResponse.data.length > 0 ? (
          // <MapsHeatmaps data={coordinateHistoryResponse.data} />
          <Box p={0} h="full">
            <MapContainer
              center={[-2.548926, 118.014863]}
              zoom={mapZoom}
              className="w-full h-full"
              zoomControl={false}
              scrollWheelZoom={true}
              attributionControl={false}>
              <TileLayer url={selectedMapTile.value} attribution={selectedMapTile.source} />
              <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
              <ZoomListener onZoomChange={setMapZoom} />
              <HeatmapDataProcessor data={coordinateHistoryResponse.data} />
            </MapContainer>
          </Box>
        ) : (
          <Box
            w="full"
            h="full"
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center">
            <VStack spacing={4}>
              <Icon as={FiMap} size="60px" color="gray.400" />
              <Text color="gray.500" fontSize="lg">
                No coordinate data available
              </Text>
              <Text color="gray.400" fontSize="sm">
                Try adjusting your filters or refresh the data
              </Text>
            </VStack>
          </Box>
        )}
      </Box>

      {/* Floating Header Panel */}
      <Box
        position="absolute"
        top={{ base: 2, md: 4 }}
        left={{ base: 2, md: 4 }}
        right={{ base: 2, md: 4 }}
        zIndex={20}
        pointerEvents="none"
        className="dashboard-panel">
        <Flex
          justify="space-between"
          align="start"
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 2, md: 0 }}>
          {/* Left side - Brand and Title */}
          <Card
            bg={controlsBg}
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor={borderColor}
            borderRadius={{ base: 'lg', md: 'xl' }}
            shadow="xl"
            p={{ base: 2, md: 3 }}
            pointerEvents="auto"
            animation={`${slideIn} 0.5s ease-out`}
            w={{ base: 'full', md: 'auto' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.pointerEvents = 'auto';
              e.currentTarget.style.userSelect = 'none';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.pointerEvents = 'auto';
              e.currentTarget.style.userSelect = 'auto';
            }}>
            <HStack spacing={{ base: 2, md: 3 }}>
              <Box
                p={{ base: 1.5, md: 2 }}
                bgGradient="linear(to-r, purple.500, blue.500)"
                color="white"
                borderRadius="lg"
                animation={`${pulse} 3s infinite`}>
                <Icon as={FiActivity} boxSize={{ base: 4, md: 5 }} />
              </Box>
              <VStack spacing={0} align="start">
                <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.800" fontWeight="black">
                  CWA Control Center
                </Text>
                <Text fontSize={{ base: '2xs', md: 'xs' }} color="gray.500">
                  Quality Control Worker Analytics
                </Text>
              </VStack>
            </HStack>
          </Card>

          {/* Right side - User Menu and Controls */}
          <HStack
            spacing={{ base: 1, md: 2 }}
            pointerEvents="auto"
            justify={{ base: 'center', md: 'end' }}>
            {/* Tile Layer Selector */}
            <Tooltip label="Map Layers">
              <IconButton
                aria-label="Map layers"
                icon={<FiLayers />}
                variant="ghost"
                size={{ base: 'sm', md: 'md' }}
                onClick={onMapLayersOpen}
                bg={controlsBg}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="lg"
                _hover={{ bg: 'rgba(255, 255, 255, 0.98)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.pointerEvents = 'auto';
                  e.currentTarget.style.userSelect = 'none';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.pointerEvents = 'auto';
                  e.currentTarget.style.userSelect = 'auto';
                }}
              />
            </Tooltip>
            {/* Refresh Button */}
            <Tooltip label="Refresh Data">
              <IconButton
                aria-label="Refresh data"
                icon={<FiRefreshCw />}
                variant="ghost"
                size={{ base: 'sm', md: 'md' }}
                isLoading={refreshing}
                onClick={handleRefresh}
                bg={controlsBg}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="lg"
                _hover={{ bg: 'rgba(255, 255, 255, 0.98)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.pointerEvents = 'auto';
                  e.currentTarget.style.userSelect = 'none';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.pointerEvents = 'auto';
                  e.currentTarget.style.userSelect = 'auto';
                }}
              />
            </Tooltip>

            {/* Filters Button */}
            <Tooltip label="Data Filters">
              <IconButton
                ref={filtersRef}
                aria-label="Open filters"
                icon={<FiFilter />}
                variant="ghost"
                size={{ base: 'sm', md: 'md' }}
                onClick={onFiltersOpen}
                bg={controlsBg}
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                shadow="lg"
                _hover={{ bg: 'rgba(255, 255, 255, 0.98)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.pointerEvents = 'auto';
                  e.currentTarget.style.userSelect = 'none';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.pointerEvents = 'auto';
                  e.currentTarget.style.userSelect = 'auto';
                }}
              />
            </Tooltip>

            {/* Fullscreen Button */}
            <Tooltip label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
              <IconButton
                aria-label={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                icon={isFullScreen ? <FiMinimize /> : <FiMaximize />}
                onClick={handleFullScreen}
                size={{ base: 'sm', md: 'md' }}
                bgGradient="linear(to-r, purple.500, blue.500)"
                color="white"
                _hover={{
                  bgGradient: 'linear(to-r, purple.600, blue.600)',
                  transform: 'scale(1.05)',
                }}
                borderRadius="lg"
                shadow="lg"
                animation={`${float} 3s ease-in-out infinite`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.pointerEvents = 'auto';
                  e.currentTarget.style.userSelect = 'none';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.pointerEvents = 'auto';
                  e.currentTarget.style.userSelect = 'auto';
                }}
              />
            </Tooltip>

            {/* User Menu */}
            <Menu>
              <MenuButton
                as={Button}
                bg={controlsBg}
                variant="ghost"
                size={{ base: 'sm', md: 'md' }}>
                <HStack spacing={{ base: 1, md: 2 }}>
                  <Avatar size={{ base: 'xs', md: 'sm' }} name={user?.username} bg="purple.500" />
                  <VStack spacing={0} align="start" display={{ base: 'none', sm: 'flex' }}>
                    <Text fontSize={{ base: '2xs', md: 'xs' }} fontWeight="semibold">
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

      {/* Floating Stats Panel - Top Right */}
      <Box
        position="absolute"
        top={{ base: 48, md: 48 }}
        right={{ base: 2, md: 4 }}
        zIndex={15}
        pointerEvents="none"
        className="dashboard-panel">
        <VStack spacing={{ base: 1, md: 2 }} align="stretch" pointerEvents="auto">
          {stats.map((stat, index) => (
            <Card
              key={index}
              bg={controlsBg}
              backdropFilter="blur(10px)"
              shadow="xl"
              border="1px solid"
              borderColor={borderColor}
              _hover={{
                shadow: '2xl',
                transform: 'translateX(-4px)',
                borderColor: `${stat.color}.200`,
              }}
              transition="all 0.3s"
              borderRadius="lg"
              overflow="hidden"
              animation={`${slideIn} 0.5s ease-out ${index * 0.1}s both`}
              minW={{ base: '140px', md: '160px' }}
              maxW={{ base: '160px', md: '200px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.pointerEvents = 'auto';
                e.currentTarget.style.userSelect = 'none';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.pointerEvents = 'auto';
                e.currentTarget.style.userSelect = 'auto';
              }}>
              <Box h="2px" bgGradient={stat.gradient} />
              <CardBody p={{ base: 2, md: 3 }}>
                <Stat>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={{ base: 1.5, md: 2 }} align="center">
                      <Box
                        p={{ base: 1.5, md: 2 }}
                        bgGradient={stat.gradient}
                        color="white"
                        borderRadius="md"
                        _hover={{ transform: 'scale(1.1)' }}
                        transition="all 0.2s">
                        <Icon as={stat.icon} boxSize={{ base: 2.5, md: 3 }} />
                      </Box>
                      <VStack spacing={0} align="start">
                        <StatLabel
                          color="gray.600"
                          fontSize={{ base: '2xs', md: 'xs' }}
                          fontWeight="medium">
                          {stat.label}
                        </StatLabel>
                        <StatNumber
                          color="gray.800"
                          fontSize={{ base: 'md', md: 'lg' }}
                          fontWeight="black">
                          {stat.number}
                        </StatNumber>
                        <StatHelpText color="gray.500" fontSize={{ base: '2xs', md: 'xs' }} mb={0}>
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
                  }}>
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

      {/* Filters Drawer */}
      <Drawer
        isOpen={isFiltersOpen}
        placement="right"
        onClose={onFiltersClose}
        finalFocusRef={filtersRef}
        size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" color="gray.800" fontWeight="bold" fontSize="lg">
            Data Filters
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch" pt={4}>
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
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  size="md"
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
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  size="md"
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
                  size="md"
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

              <HStack justify="center" pt={4}>
                <Button
                  colorScheme="blue"
                  leftIcon={<FiFilter />}
                  onClick={handleFilterChange}
                  size="lg"
                  borderRadius="xl"
                  fontWeight="semibold">
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSelectedUserId('');
                    setFilters({ page: '1', limit: '100' });
                  }}
                  size="lg"
                  borderRadius="xl"
                  fontWeight="semibold"
                  borderColor="gray.300"
                  color="gray.700"
                  _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}>
                  Clear Filters
                </Button>
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
