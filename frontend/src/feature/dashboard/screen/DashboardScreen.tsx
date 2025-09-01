import 'leaflet/dist/leaflet.css';

import {
  Box,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { LatLngExpression } from 'leaflet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiMapPin, FiUsers } from 'react-icons/fi';
import { MapContainer, TileLayer } from 'react-leaflet';

import { ZoomControls, ZoomListener } from '@/components/maps-location';
import {
  getEstatesAfdeling,
  getRegional,
  getRegionalsWilayah,
  getWilayahsEstate,
} from '@/lib/api/areaApi';
import { CoordinateHistoryFilters } from '@/lib/api/coordinateHistoryApi';
import { getUsers } from '@/lib/api/userApi';
import { useLoading } from '@/lib/loading/useLoading.hook';
import { CoordinateHistoryType } from '@/types/coordinateHistory.type';

import { BloksPolygonLayer } from '../components/bloks-polygon-layer/BloksPolygonLayer';
import { ExportDataModal } from '../components/export-data-modal/ExportDataModal';
import { ExportImageModal } from '../components/export-image-modal/ExportImageModal';
import {
  HeatmapCoordinateDataProcessor,
  HeatmapTrackingTimeLine,
} from '../components/maps-heatmap/MapsHeatmaps';
import { MapsHeatmapLayerControl } from '../components/maps-heatmap-layer-control/MapsHeatmapLayerControl';
import { ScreenErrorDashboard } from '../components/screen-error-dashboard/ScreenErrorDashboard';
import { SideBarDashboard } from '../components/side-bar-dashboard/SideBarDashboard';
import { TopHeaderPanel } from '../components/top-header-panel/TopHeaderPanel';
import listMapTileOptions from '../constants/listMapTileOptions';
import { useFilterAreaForm } from '../hooks/useFIlterAreaForm.hook';
import { useFilterDataForm } from '../hooks/useFilterDataForm.hook';
import { useInfiniteCoordinateHistory } from '../hooks/useInfiniteFetchCoordinate.hook';
import { useTrackingIndexStore } from '../lib/store/trackingIndexStore';
import { BlokGeoJSON } from '../types/blockGeoJson.type';
import {
  getAreaGeoJsonBlokData,
  getSelectedAfdelingFilterArea,
  getSelectedEstateFilterArea,
  getSelectedWilayahFilterArea,
} from '../utils/getAreaData';

export const DashboardScreen = () => {
  // Global
  const { showLoading, hideLoading } = useLoading();
  const toast = useToast();

  // Sidebar State
  const {
    isOpen: isSidebarOpen,
    onToggle: toggleSidebar,
    onOpen: onSidebarOpen,
    onClose: onSidebarClose,
  } = useDisclosure();

  // Component State
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const controlsBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(45, 55, 72, 0.95)');
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isFirstMount = useRef(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };
  useEffect(() => {
    if (!isMobile && isFirstMount.current) {
      onSidebarOpen();
      isFirstMount.current = false;
    }
  }, [isMobile, onSidebarOpen]);

  // Map State
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showClusteredMarkers, setShowClusteredMarkers] = useState(true);
  const [showMarker, setShowMarker] = useState(true);
  const [blokOpacity, setBlokOpacity] = useState(0.2);
  const [showPolyline, setShowPolyline] = useState(true);
  const [radius, setRadius] = useState(30);
  const [tempRadius, setTempRadius] = useState(30);
  const [selectedMapTileIndex, setSelectedMapTileIndex] = useState(0);
  const [mapZoom, setMapZoom] = useState(7);
  const isUsingH3 = false;
  const selectedMapTile = listMapTileOptions[selectedMapTileIndex];
  const mapCenter: LatLngExpression = [0, 114.5];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setRadius(tempRadius);
    }, 800);

    return () => clearTimeout(timeout);
  }, [tempRadius]);

  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(prev - 1, 1));
  };

  // Filter State
  const hasAppliedFilters = useRef(false);
  const hasPressFilter = useRef(false);

  // Coordinate data filters
  const filterDataFormState = useFilterDataForm();
  const { filters, setFilters, startDate, endDate, selectedUserId } = filterDataFormState;

  const { data: usersResponse, isError: isErrorUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  const userListData = usersResponse?.data ?? [];

  // Filter Area Form State
  const filterAreaFormState = useFilterAreaForm();
  const {
    selectedRegionalId,
    selectedWilayahId,
    selectedEstateId,
    selectedAfdelingId,
    filterArea,
    setFilterArea,
  } = filterAreaFormState;

  const {
    data: regionals,
    isLoading: isLoadingRegionals,
    isError: isErrorRegionals,
  } = useQuery({
    queryKey: ['regionals'],
    queryFn: () => getRegional(),
  });

  const {
    data: wilayahs,
    isLoading: isLoadingWilayahs,
    isError: isErrorWilayahs,
  } = useQuery({
    queryKey: ['wilayahs', selectedRegionalId],
    queryFn: () => getRegionalsWilayah(selectedRegionalId),
    enabled: !!selectedRegionalId,
  });

  const {
    data: estates,
    isLoading: isLoadingEstates,
    isError: isErrorEstates,
  } = useQuery({
    queryKey: ['estates', selectedWilayahId],
    queryFn: () => getWilayahsEstate(selectedWilayahId),
    enabled: !!selectedWilayahId,
  });

  const {
    data: afdelings,
    isLoading: isLoadingAfdelings,
    isError: isErrorAfdelings,
  } = useQuery({
    queryKey: ['afdelings', selectedEstateId],
    queryFn: () => getEstatesAfdeling(selectedEstateId),
    enabled: !!selectedEstateId,
  });

  const isLoadingAreaData =
    isLoadingRegionals || isLoadingWilayahs || isLoadingEstates || isLoadingAfdelings;

  const dataRegional = !isErrorRegionals && regionals && 'data' in regionals ? regionals.data : [];
  const dataWilayah = !isErrorWilayahs && wilayahs && 'data' in wilayahs ? wilayahs.data : [];
  const dataEstate = !isErrorEstates && estates && 'data' in estates ? estates.data : [];
  const dataAfdeling = !isErrorAfdelings && afdelings && 'data' in afdelings ? afdelings.data : [];

  // Coordinate History Data
  const [selectedGeoJsonBlok, setSelectedGeoJsonBlok] = useState<BlokGeoJSON | null>(null);
  const [coordinateHistoryData, setCoordinateHistoryData] = useState<CoordinateHistoryType[]>([]);
  const [coordinatePersonalTrackingData, setCoordinatePersonalTrackingData] = useState<
    CoordinateHistoryType[] | null
  >(null);
  const isTrackingTimeline = useTrackingIndexStore((state) => state.isTrackingTimeline);

  // Auto-paginated coordinate history query
  const {
    data: allCoordinateData,
    isLoading: isLoadingCoordinateHistory,
    isError: isErrorCoordinateHistory,
    refetch: refetchCoordinateHistory,
  } = useInfiniteCoordinateHistory(filters, hasAppliedFilters.current && !isUsingH3);
  const refreshingCoordData = isLoadingCoordinateHistory;
  // Update state when data is completely loaded
  useEffect(() => {
    if (!isLoadingCoordinateHistory) {
      setCoordinateHistoryData(allCoordinateData);
    }
  }, [allCoordinateData, isLoadingCoordinateHistory]);

  // Handle Refresh
  const handleRefresh = async () => {
    if (!selectedWilayahId) {
      setSelectedGeoJsonBlok(null);
    }
    hasAppliedFilters.current = true;
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

    await refetchCoordinateHistory();
    hasAppliedFilters.current = false;
    toast({
      title: 'Data Refreshed',
      description: 'All tracking data has been updated.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const getAreaGeoJsonBlok = async (
    wilayah: string | null,
    estate: string | null,
    afdeling: string | null
  ) => {
    if (estate || wilayah) {
      showLoading();
      try {
        const geoJsonBlok = await getAreaGeoJsonBlokData({
          dataEstate,
          estate,
          wilayah,
          afdeling,
        });
        if (geoJsonBlok) {
          setSelectedGeoJsonBlok(geoJsonBlok);
        } else {
          throw new Error('Error fetching area geojson blok');
        }
      } catch {
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

  const onApplyFilters = () => {
    if (isMobile) onSidebarClose();
    if (selectedWilayahId === '') {
      setSelectedGeoJsonBlok(null);
    }
    hasAppliedFilters.current = false;
    hasPressFilter.current = true;
    handleFilterChange();
  };

  const onClearFilters = () => {
    filterDataFormState.clearFilters();
    hasAppliedFilters.current = false;
  };

  const stats = useMemo(() => {
    let totalCoordinates = 0;
    let uniqueUsers = 0;
    let isLoading = false;

    isLoading = isLoadingCoordinateHistory;

    if (allCoordinateData.length > 0) {
      totalCoordinates = allCoordinateData.length;
      uniqueUsers = new Set(allCoordinateData.map((coord) => coord.user_id)).size;
    }

    return {
      stats: [
        {
          label: 'Total Kordinat',
          number: totalCoordinates.toString(),
          helpText: `Titik koordinat`,
          icon: FiMapPin,
          color: 'blue',
          gradient: 'linear(to-r, blue.400, blue.600)',
        },
        {
          label: 'Pengguna Aktif',
          number: uniqueUsers.toString(),
          helpText: 'pengguna',
          icon: FiUsers,
          color: 'green',
          gradient: 'linear(to-r, green.400, green.600)',
        },
      ],
      isLoading,
      totalCoordinates,
      uniqueUsers,
    };
  }, [isUsingH3, allCoordinateData, isLoadingCoordinateHistory]);

  // State modal export image
  const {
    isOpen: isExportImageOpen,
    onOpen: onExportImageOpen,
    onClose: onExportImageClose,
  } = useDisclosure();

  const captureBoxRef = useRef<HTMLDivElement>(null); // Create a ref for the main Box

  const {
    isOpen: isExportDataOpen,
    onOpen: onExportDataOpen,
    onClose: onExportDataClose,
  } = useDisclosure();

  if (isErrorCoordinateHistory || isErrorUsers) {
    return <ScreenErrorDashboard bgColor={bgColor} />;
  }

  return (
    <>
      <Box
        ref={captureBoxRef}
        h="100vh"
        w="full"
        bg={bgColor}
        position="relative"
        overflow="hidden">
        {isMobile !== undefined && (
          <>
            {/* Left Sidebar */}
            <SideBarDashboard
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              isMobile={isMobile}
              stats={stats.stats}
              isLoadingAreaData={isLoadingAreaData}
              dataRegional={dataRegional}
              dataWilayah={dataWilayah}
              dataEstate={dataEstate}
              dataAfdeling={dataAfdeling}
              filterAreaFormState={filterAreaFormState}
              userListData={userListData}
              filterDataFormState={filterDataFormState}
              onApplyFilters={onApplyFilters}
              onClearFilters={onClearFilters}
              tempRadius={tempRadius}
              setTempRadius={setTempRadius}
              isExportImageOpen={isExportImageOpen}
            />

            {!isExportImageOpen && (
              <TopHeaderPanel
                isMobile={isMobile}
                refreshingCoordData={refreshingCoordData}
                handleRefresh={handleRefresh}
                controlsBg={controlsBg}
                borderColor={borderColor}
                isFullScreen={isFullScreen}
                handleFullScreen={handleFullScreen}
                handleOpenExportImage={onExportImageOpen}
                handleOpenExportData={onExportDataOpen}
              />
            )}
          </>
        )}

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
          showPolyline={isTrackingTimeline ? showPolyline : undefined}
          setShowPolyline={isTrackingTimeline ? setShowPolyline : undefined}
        />

        {/* Map Container */}
        <Box p={0} h="full">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{
              width: '100%',
              height: '100%',
              zIndex: 10,
            }}
            minZoom={2}
            zoomControl={false}
            attributionControl={false}>
            <TileLayer url={selectedMapTile.value} attribution={selectedMapTile.source} />
            {selectedGeoJsonBlok && (
              <BloksPolygonLayer blokGeoJSON={selectedGeoJsonBlok} opacity={blokOpacity} />
            )}
            <ZoomListener onZoomChange={setMapZoom} />
            {isMobile !== undefined && !isExportImageOpen && (
              <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} isMobile={isMobile} />
            )}
            {!isTrackingTimeline && (
              <HeatmapCoordinateDataProcessor
                data={coordinateHistoryData}
                showHeatmap={showHeatmap}
                showClusteredMarkers={showClusteredMarkers}
                showIndividualMarkers={showMarker}
                radius={radius}
                hasArea={selectedGeoJsonBlok !== null}
                setCoordinatePersonalTrackingData={setCoordinatePersonalTrackingData}
              />
            )}
            {isTrackingTimeline && coordinatePersonalTrackingData !== null && (
              <HeatmapTrackingTimeLine
                data={coordinatePersonalTrackingData}
                showPolyline={showPolyline}
                showIndividualMarkers={showMarker}
                showHeatmap={showHeatmap}
                radius={radius}
              />
            )}
          </MapContainer>
        </Box>
      </Box>
      <ExportImageModal
        isOpen={isExportImageOpen}
        onClose={onExportImageClose}
        captureBoxRef={captureBoxRef}
      />
      <ExportDataModal
        isOpen={isExportDataOpen}
        onClose={onExportDataClose}
        coordinateHistoryData={coordinateHistoryData}
        filters={filters}
      />
    </>
  );
};
