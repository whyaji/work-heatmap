import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import moment from 'moment';
import { FC, useCallback, useState } from 'react';
import { FiDownload, FiFileText, FiX } from 'react-icons/fi';

import { CoordinateHistoryFilters } from '@/lib/api/coordinateHistoryApi';
import { CoordinateHistoryType } from '@/types/coordinateHistory.type';

const coordinateHistoryToGeoJson = (
  coordinateHistoryData: CoordinateHistoryType[],
  filters: CoordinateHistoryFilters,
  today: string
) => {
  return {
    type: 'FeatureCollection',
    properties: {
      filter_start_at: filters.startDate,
      filter_end_at: filters.endDate,
      filter_user_id: filters.userId ?? null,
      export_at: today,
    },
    features: coordinateHistoryData.map((coordinate) => ({
      type: 'Feature',
      properties: {
        id: coordinate.id,
        user_id: coordinate.user_id,
        timestamp: coordinate.timestamp,
        user_username: coordinate.user?.username,
        user_nama: coordinate.user?.nama,
        user_jabatan: coordinate.user?.jabatan,
      },
      geometry: {
        type: 'Point',
        coordinates: [Number(coordinate.lon), Number(coordinate.lat)],
      },
    })),
  };
};

export const ExportDataModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  coordinateHistoryData: CoordinateHistoryType[];
  filters: CoordinateHistoryFilters;
}> = ({ isOpen, onClose, coordinateHistoryData, filters }) => {
  const [isExporting, setIsExporting] = useState(false);
  const toast = useToast();

  const exportAsGeoJSON = useCallback(async () => {
    if (!coordinateHistoryData || coordinateHistoryData.length === 0) {
      toast({
        title: 'Error',
        description: 'Tidak ada data yang tersedia untuk diekspor',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsExporting(true);
    const today = moment().format('DD-MM-YYYY-HH-mm-ss');
    try {
      if (!coordinateHistoryData || coordinateHistoryData.length === 0) {
        throw new Error('No data available for export');
      }

      const geoJsonData = coordinateHistoryToGeoJson(coordinateHistoryData, filters, today);
      const jsonString = JSON.stringify(geoJsonData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      const link = document.createElement('a');
      link.download = `cwa-coordinates-${today}.geojson`;
      link.href = URL.createObjectURL(blob);
      link.click();

      // Clean up the URL object
      URL.revokeObjectURL(link.href);

      toast({
        title: 'Berhasil',
        description: 'File GeoJSON berhasil diekspor',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal mengekspor file GeoJSON',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  }, [coordinateHistoryData, toast]);

  const exportAsCSV = useCallback(async () => {
    setIsExporting(true);
    try {
      if (!coordinateHistoryData || coordinateHistoryData.length === 0) {
        toast({
          title: 'Error',
          description: 'Tidak ada data yang tersedia untuk diekspor',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create CSV header
      const headers = [
        'ID',
        'User ID',
        'User Username',
        'User Nama',
        'User Jabatan',
        'Latitude',
        'Longitude',
        'Timestamp',
      ];

      // Create CSV rows
      const csvRows = [
        headers.join(','),
        ...coordinateHistoryData.map((coordinate) =>
          [
            coordinate.id,
            coordinate.user_id,
            coordinate.user?.username ?? null,
            coordinate.user?.nama ?? null,
            coordinate.user?.jabatan ?? null,
            coordinate.lat,
            coordinate.lon,
            coordinate.timestamp,
          ].join(',')
        ),
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.download = `cwa-coordinates-${moment().format('DD-MM-YYYY-HH-mm-ss')}.csv`;
      link.href = URL.createObjectURL(blob);
      link.click();

      // Clean up the URL object
      URL.revokeObjectURL(link.href);

      toast({
        title: 'Berhasil',
        description: 'File CSV berhasil diekspor',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Gagal mengekspor file CSV',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  }, [coordinateHistoryData, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent
        margin={5}
        borderRadius="xl"
        overflow="hidden"
        boxShadow="2xl"
        border="1px solid"
        borderColor="gray.100">
        <ModalHeader borderBottom="1px solid" borderColor="gray.100">
          <Flex align="center" gap={3}>
            <Box p={2} bg="green.100" borderRadius="lg">
              <Icon as={FiDownload} color="green.600" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                Ekspor Data
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="normal">
                Download data koordinat dalam berbagai format
              </Text>
            </Box>
          </Flex>
        </ModalHeader>

        <ModalCloseButton top={4} right={4} borderRadius="full" _hover={{ bg: 'gray.100' }} />

        <ModalBody py={6}>
          <VStack spacing={4}>
            <Text color="gray.600" textAlign="center" fontSize="sm">
              Pilih format yang Anda inginkan untuk mengekspor data koordinat
            </Text>

            <Divider />

            <VStack spacing={3} width="full">
              <Button
                onClick={exportAsGeoJSON}
                isLoading={isExporting}
                loadingText="Mengekspor GeoJSON..."
                width="full"
                size="lg"
                bgGradient="linear(to-r, green.500, green.600)"
                color="white"
                _hover={{
                  bgGradient: 'linear(to-r, green.600, green.700)',
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s"
                leftIcon={<Icon as={FiFileText} boxSize={5} />}
                borderRadius="lg"
                fontWeight="medium">
                GeoJSON
              </Button>

              <Button
                onClick={exportAsCSV}
                isLoading={isExporting}
                loadingText="Mengekspor CSV..."
                width="full"
                size="lg"
                bgGradient="linear(to-r, orange.500, orange.600)"
                color="white"
                _hover={{
                  bgGradient: 'linear(to-r, orange.600, orange.700)',
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s"
                leftIcon={<Icon as={FiFileText} boxSize={5} />}
                borderRadius="lg"
                fontWeight="medium">
                CSV
              </Button>
            </VStack>

            <Box mt={4} p={3} bg="green.50" borderRadius="lg" width="full">
              <HStack spacing={2}>
                <Icon as={FiFileText} color="green.600" boxSize={4} />
                <Text fontSize="xs" color="green.700">
                  <strong>Info:</strong> GeoJSON ideal untuk aplikasi pemetaan dan software GIS,
                  sedangkan CSV bagus untuk analisis spreadsheet dan pemrosesan data.
                </Text>
              </HStack>
            </Box>

            {coordinateHistoryData && coordinateHistoryData.length > 0 && (
              <Box mt={2} p={3} bg="blue.50" borderRadius="lg" width="full">
                <Text fontSize="xs" color="blue.700" textAlign="center">
                  <strong>Ringkasan Data:</strong> {coordinateHistoryData.length} titik koordinat
                  tersedia untuk diekspor
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.100" bg="gray.50" gap={3}>
          <Button
            variant="ghost"
            onClick={onClose}
            leftIcon={<Icon as={FiX} />}
            _hover={{ bg: 'gray.200' }}
            borderRadius="lg">
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
