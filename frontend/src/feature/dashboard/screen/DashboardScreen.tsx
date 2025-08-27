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
  Divider,
  Collapse,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiActivity,
  FiMapPin,
  FiShield,
  FiFilter,
  FiCalendar,
  FiUser,
  FiMaximize,
  FiMinimize,
  FiMenu,
  FiChevronDown,
} from 'react-icons/fi';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { CoordinateHistoryFilters } from '@/lib/api/coordinateHistoryApi';
import { getUsers } from '@/lib/api/userApi';
import 'leaflet/dist/leaflet.css';
import {
  HeatmapCoordinateDataProcessor,
  HeatmapH3DataProcessor,
} from '../components/maps-heatmap/MapsHeatmaps';
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
import { CoordinateHistoryType, H3Type } from '@/types/coordinateHistory.type';
import { LatLngExpression } from 'leaflet';
import {
  listMapTileOptions,
  MapsHeatmapLayerControl,
} from '../components/maps-heatmap-layer-control/MapsHeatmapLayerControl';
import { useLoading } from '@/lib/loading/LoadingProvider';
import { RefreshButton } from '../components/refresh-button/RefreshButton';
import moment from 'moment';
import { AreaType } from '@/types/area.type';
import {
  useInfiniteCoordinateHistory,
  useInfiniteCoordinateHistoryH3,
} from '../hooks/useInfiniteFetchCoordinate.hook';

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

export const DashboardScreen = () => {
  const { showLoading, hideLoading } = useLoading();
  const { user, logout } = useAuth();
  const toast = useToast();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen: isSidebarOpen, onToggle: toggleSidebar, onOpen: onSidebarOpen } = useDisclosure();
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const hasAppliedFilters = useRef(false);
  const hasPressFilter = useRef(false);
  const [windowBounds, setWindowBounds] = useState<{
    north: number;
    south: number;
    east: number;
    west: number;
  } | null>(null);

  // onFirstMount set if not mobile then open sidebar just run on first time
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isMobile && isFirstMount.current) {
      onSidebarOpen();
      isFirstMount.current = false;
    }
  }, [isMobile, onSidebarOpen]);

  const [blokOpacity, setBlokOpacity] = useState(0.2);
  const [nearbyDistance, setNearbyDistance] = useState(50);
  const [tempNearbyDistance, setTempNearbyDistance] = useState(50);
  const [radius, setRadius] = useState(30);
  const [tempRadius, setTempRadius] = useState(30);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setNearbyDistance(tempNearbyDistance);
    }, 800);

    return () => clearTimeout(timeout);
  }, [tempNearbyDistance]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRadius(tempRadius);
    }, 800);

    return () => clearTimeout(timeout);
  }, [tempRadius]);

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showClusteredMarkers, setShowClusteredMarkers] = useState(true);
  const [showMarker, setShowMarker] = useState(true);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const [selectedMapTileIndex, setSelectedMapTileIndex] = useState(0);
  const selectedMapTile = listMapTileOptions[selectedMapTileIndex];
  const [mapZoom, setMapZoom] = useState(7);
  const mapCenter: LatLngExpression = [0, 114.5];

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

  const [filterArea, setFilterArea] = useState<{
    regional: string;
    wilayah: string;
    estate: string;
    afdeling: string;
  }>({
    regional: '',
    wilayah: '',
    estate: '',
    afdeling: '',
  });

  const lastThirtyDays = moment().subtract(30, 'days').hour(0).minute(0).format('YYYY-MM-DDTHH:mm');
  const endTodayWithTime = moment().hour(23).minute(59).second(59).format('YYYY-MM-DDTHH:mm');

  const [startDate, setStartDate] = useState(lastThirtyDays);
  const [endDate, setEndDate] = useState(endTodayWithTime);

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRegionalId, setSelectedRegionalId] = useState<string>('');
  const [selectedWilayahId, setSelectedWilayahId] = useState<string>('');
  const [selectedEstateId, setSelectedEstateId] = useState<string>('');
  const [selectedAfdelingId, setSelectedAfdelingId] = useState<string>('');
  const [selectedGeoJsonBlok, setSelectedGeoJsonBlok] = useState<BlokGeoJSON | null>(null);
  const [coordinateHistoryData, setCoordinateHistoryData] = useState<CoordinateHistoryType[]>([]);
  const [coordinateHistoryH3Data, setCoordinateHistoryH3Data] = useState<H3Type[]>([]);

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

  const isUsingH3 = mapZoom < 14;

  // Auto-paginated coordinate history query
  const {
    data: allCoordinateData,
    isLoading: isLoadingCoordinateHistory,
    isError: isErrorCoordinateHistory,
    refetch: refetchCoordinateHistory,
  } = useInfiniteCoordinateHistory(
    filters,
    windowBounds,
    hasAppliedFilters.current && windowBounds !== null && !isUsingH3
  );

  // Auto-paginated H3 coordinate history query
  const {
    data: allH3Data,
    h3Stats,
    isLoading: isLoadingCoordinateHistoryH3,
    isError: isErrorCoordinateHistoryH3,
    refetch: refetchCoordinateHistoryH3,
  } = useInfiniteCoordinateHistoryH3(
    { ...filters, resolution: String(9) },
    windowBounds,
    hasAppliedFilters.current && windowBounds !== null && isUsingH3
  );

  // Update state when data is completely loaded
  useEffect(() => {
    if (!isLoadingCoordinateHistory && allCoordinateData.length > 0) {
      setCoordinateHistoryData(allCoordinateData);
    }
  }, [allCoordinateData, isLoadingCoordinateHistory]);

  useEffect(() => {
    if (!isLoadingCoordinateHistoryH3 && allH3Data.length > 0) {
      setCoordinateHistoryH3Data(allH3Data);
    }
  }, [allH3Data, isLoadingCoordinateHistoryH3]);

  const refreshingCoordData = isLoadingCoordinateHistory || isLoadingCoordinateHistoryH3;

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
    if (!hasAppliedFilters.current) {
      toast({
        title: 'No Filters Applied',
        description: 'Please apply filters first to refresh data.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isUsingH3) {
      await refetchCoordinateHistoryH3();
    } else {
      await refetchCoordinateHistory();
    }
    toast({
      title: 'Data Refreshed',
      description: 'All tracking data has been updated.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const getSelectedWilayahFilterArea = (dataWilayah: AreaType[], selectedWilayahId: string) => {
    const selectedWilayahAbbr =
      dataWilayah.find((wilayah) => String(wilayah.id) === selectedWilayahId)?.abbr ?? null;
    const splitWilayahAbbr = selectedWilayahAbbr ? selectedWilayahAbbr.split(' ')[1] : null;
    const wilayahAddZero = (splitWilayahAbbr ?? '').length === 1 ? `0${splitWilayahAbbr}` : null;
    const wilayah = (splitWilayahAbbr ?? '').length > 1 ? splitWilayahAbbr : wilayahAddZero;

    return wilayah;
  };

  const getSelectedEstateFilterArea = (dataEstate: AreaType[], selectedEstateId: string) => {
    const selectedEstateAbbr =
      dataEstate.find((estate) => String(estate.id) === selectedEstateId)?.abbr ?? null;
    return selectedEstateAbbr;
  };

  const getSelectedAfdelingFilterArea = (dataAfdeling: AreaType[], selectedAfdelingId: string) => {
    const selectedAfdelingAbbr =
      dataAfdeling.find((afdeling) => String(afdeling.id) === selectedAfdelingId)?.abbr ?? null;
    const selectedAfdelingShortName = selectedAfdelingAbbr
      ? selectedAfdelingAbbr.split('-')[1]
      : null; // ex, OA
    return selectedAfdelingShortName;
  };

  const getAreaGeoJsonBlok = async (
    wilayah: string | null,
    estate: string | null,
    afdeling: string | null
  ) => {
    if (estate || wilayah) {
      showLoading();
      try {
        if (estate) {
          const geoJsonBlok = await getGeoJsonBlok(estate, afdeling);
          setSelectedGeoJsonBlok(geoJsonBlok as BlokGeoJSON);
        } else if (wilayah) {
          const estates = dataEstate.map((estate) => estate.abbr);
          const geoJsonListResponse = await Promise.all(
            estates.map((estate) => getGeoJsonBlok(estate, afdeling))
          );
          const geoJsonListSuccess = geoJsonListResponse.filter(
            (geoJson): geoJson is { type: string; features: any[] } =>
              'type' in geoJson && 'features' in geoJson && geoJson.features.length > 0
          );
          const geoJson =
            geoJsonListSuccess && geoJsonListSuccess.length > 0
              ? {
                  type: geoJsonListSuccess[0].type,
                  features: geoJsonListSuccess.flatMap((geoJson) => geoJson.features),
                }
              : null;
          setSelectedGeoJsonBlok(geoJson as BlokGeoJSON);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Gagal mengambil data blok',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        hasAppliedFilters.current = true;
        hideLoading();
      }
    }
  };

  const handleFilterChange = useCallback(() => {
    toast({
      title: 'Filters Applied',
      description: 'Fetching data with applied filters...',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });

    const filterChangeAsync = async () => {
      const newFilters: CoordinateHistoryFilters = {
        page: '1',
        limit: filters.limit,
      };

      if (startDate) newFilters.startDate = startDate;
      if (endDate) newFilters.endDate = endDate;
      if (selectedUserId) newFilters.userId = selectedUserId;

      setFilters(newFilters);

      const newFilterArea = {
        regional: selectedRegionalId,
        wilayah: selectedWilayahId,
        estate: selectedEstateId,
        afdeling: selectedAfdelingId,
      };

      const filterAreaChanged = Object.keys(filterArea).some(
        (key) =>
          filterArea[key as keyof typeof filterArea] !==
          newFilterArea[key as keyof typeof newFilterArea]
      );

      if (!isLoadingEstates) {
        const wilayah = getSelectedWilayahFilterArea(dataWilayah, selectedWilayahId);
        if (wilayah && filterAreaChanged) {
          const estate = getSelectedEstateFilterArea(dataEstate, selectedEstateId);
          const afdeling = getSelectedAfdelingFilterArea(dataAfdeling, selectedAfdelingId);
          await getAreaGeoJsonBlok(wilayah, estate, afdeling);
          setFilterArea(newFilterArea);
        } else {
          hasAppliedFilters.current = true;
        }
      }
    };

    filterChangeAsync();
  }, [
    startDate,
    endDate,
    selectedUserId,
    filters.limit,
    selectedRegionalId,
    selectedWilayahId,
    selectedEstateId,
    selectedAfdelingId,
    dataWilayah,
    dataEstate,
    dataAfdeling,
    isLoadingEstates,
  ]);

  const stats = useMemo(() => {
    let totalCoordinates = 0;
    let uniqueUsers = 0;
    let isLoading = false;
    let dataSource = '';

    if (isUsingH3) {
      isLoading = isLoadingCoordinateHistoryH3;
      dataSource = 'H3';

      if (h3Stats) {
        // Use server-side calculated stats for H3 (more accurate)
        totalCoordinates = h3Stats.totalCoordinates ?? 0;
        uniqueUsers = h3Stats.totalUniqueUsers ?? 0;
      }
    } else {
      isLoading = isLoadingCoordinateHistory;
      dataSource = 'Coordinates';

      if (allCoordinateData.length > 0) {
        totalCoordinates = allCoordinateData.length;
        uniqueUsers = new Set(allCoordinateData.map((coord) => coord.user_id)).size;
      }
    }

    return {
      stats: [
        {
          label: 'Total Coordinates',
          number: totalCoordinates.toString(),
          helpText: `${dataSource.toLowerCase()} tracking points`,
          icon: FiMapPin,
          color: 'blue',
          gradient: 'linear(to-r, blue.400, blue.600)',
        },
        {
          label: 'Active Users',
          number: uniqueUsers.toString(),
          helpText: 'unique workers',
          icon: FiUsers,
          color: 'green',
          gradient: 'linear(to-r, green.400, green.600)',
        },
      ],
      isLoading,
      dataSource,
      totalCoordinates,
      uniqueUsers,
    };
  }, [
    isUsingH3,
    allCoordinateData,
    allH3Data,
    h3Stats,
    isLoadingCoordinateHistory,
    isLoadingCoordinateHistoryH3,
  ]);

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  if (isErrorCoordinateHistory || isErrorUsers || isErrorCoordinateHistoryH3) {
    return (
      <Box minH="100vh" bg={bgColor} p={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>Gagal mengambil data. Silakan coba lagi.</AlertDescription>
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
            p={4}
            borderBottomWidth="1px"
            borderBottomColor="gray.200"
            bg={bgColor}>
            <HStack spacing={3}>
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
              <Box
                bgGradient="linear(to-r, purple.500, blue.500)"
                color="white"
                borderRadius="lg"
                animation={`${pulse} 3s infinite`}>
                <Icon as={FiActivity} boxSize={5} />
              </Box>
              <VStack spacing={0} align="start">
                <Text fontSize="md" color="gray.800" fontWeight="black">
                  CBI Work Area Plus
                </Text>
                <Text fontSize="xs" color="gray.500">
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
                  {stats.stats.map((stat, index) => (
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
                  {/* Regional Select */}
                  <FormControl>
                    <Select
                      value={selectedRegionalId}
                      onChange={(e) => {
                        setSelectedRegionalId(e.target.value);
                        setSelectedWilayahId('');
                        setSelectedEstateId('');
                        setSelectedAfdelingId('');
                      }}
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
                      onChange={(e) => {
                        setSelectedWilayahId(e.target.value);
                        setSelectedEstateId('');
                        setSelectedAfdelingId('');
                      }}
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
                      onChange={(e) => {
                        setSelectedEstateId(e.target.value);
                        setSelectedAfdelingId('');
                      }}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        hasAppliedFilters.current = false;
                        hasPressFilter.current = true;
                        handleFilterChange();
                      }}
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
                      hasAppliedFilters.current = false;
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

                <Divider />
                <VStack spacing={3} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Customize Heatmap
                  </Text>
                  {/* input number for nearby distance */}
                  <Text fontSize="xs" color="gray.500">
                    Nearby Distance (meter)
                  </Text>
                  <Input
                    type="number"
                    min={1}
                    value={String(tempNearbyDistance)}
                    onChange={(e) => setTempNearbyDistance(Number(e.target.value))}
                    size="sm"
                    borderRadius="lg"
                  />

                  {/* input number for radius heatmap point */}
                  <Text fontSize="xs" color="gray.500">
                    Radius Heatmap Point (meter)
                  </Text>
                  <Input
                    type="number"
                    min={1}
                    value={String(tempRadius)}
                    onChange={(e) => setTempRadius(Number(e.target.value))}
                    size="sm"
                    borderRadius="lg"
                  />
                </VStack>
              </VStack>
            </Box>
          </Collapse>
        </Box>

        {/* Resize Handle */}
        {!isMobile && (
          <Box
            ref={resizeHandleRef}
            position="absolute"
            right={0}
            top={0}
            bottom={0}
            w="2px"
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
        )}
      </Box>
      {/* Top Header Panel */}
      <Box
        position="absolute"
        top={isMobile ? 24 : 4}
        left={4}
        right={4}
        zIndex={20}
        pointerEvents="none">
        <Flex justify="space-between" align="start">
          {/* Left side - Toggle Sidebar Button and Brand */}
          <HStack spacing={3} pointerEvents="auto" />
          {/* Right side - Controls */}
          <HStack spacing={2} pointerEvents="auto">
            {/* Refresh Button */}
            <RefreshButton
              refreshingCoordData={refreshingCoordData}
              handleRefresh={handleRefresh}
              controlsBg={controlsBg}
              borderColor={borderColor}
            />

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
                // animation={`${float} 3s ease-in-out infinite`}
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

      {/* Map Controls */}
      <MapsHeatmapLayerControl
        areaOpacity={selectedGeoJsonBlok ? blokOpacity : undefined}
        setAreaOpacity={selectedGeoJsonBlok ? setBlokOpacity : undefined}
        selectedMapTileIndex={selectedMapTileIndex}
        setSelectedMapTileIndex={setSelectedMapTileIndex}
        isUsingH3={isUsingH3}
        showHeatmap={showHeatmap}
        showClusteredMarkers={showClusteredMarkers}
        showMarker={showMarker}
        setShowHeatmap={setShowHeatmap}
        setShowClusteredMarkers={setShowClusteredMarkers}
        setShowMarker={setShowMarker}
      />

      {/* Map Container */}
      <Box p={0} h="full">
        <MapContainer
          center={mapCenter}
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
          {(isUsingH3 || (coordinateHistoryData.length === 0 && isLoadingCoordinateHistory)) && (
            <HeatmapH3DataProcessor
              data={coordinateHistoryH3Data}
              showHeatmap={showHeatmap}
              showH3Markers={showMarker}
              radius={radius}
            />
          )}
          {(!isUsingH3 ||
            (coordinateHistoryH3Data.length === 0 && isLoadingCoordinateHistoryH3)) && (
            <HeatmapCoordinateDataProcessor
              data={coordinateHistoryData}
              showHeatmap={showHeatmap}
              showClusteredMarkers={showClusteredMarkers}
              showIndividualMarkers={showMarker}
              nearbyDistance={nearbyDistance}
              radius={radius}
            />
          )}
          <MapBoundsListener
            windowBounds={windowBounds}
            setWindowBounds={setWindowBounds}
            onWindowBoundsChange={() => {
              if (hasPressFilter.current) {
                hasAppliedFilters.current = true;
              }
            }}
          />
        </MapContainer>
      </Box>
    </Box>
  );
};
