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
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import moment from 'moment';
import { FC, RefObject, useCallback, useState } from 'react';
import { FiDownload, FiFileText, FiImage, FiX } from 'react-icons/fi';

export const ExportImageModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  captureBoxRef: RefObject<HTMLDivElement | null>;
}> = ({ isOpen, onClose, captureBoxRef }) => {
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const toast = useToast();

  const exportAsPNG = useCallback(async () => {
    setIsExportingImage(true);
    try {
      if (!captureBoxRef.current) {
        throw new Error('Dashboard container not found');
      }

      const dataUrl = await toPng(captureBoxRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff', // Ensure background is captured
      });

      const link = document.createElement('a');
      link.download = `cwa-map-${moment().format('DD-MM-YYYY-HH-mm-ss')}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: 'Berhasil',
        description: 'PNG berhasil diekspor',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Gagal',
        description: 'Gagal mengekspor PNG',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExportingImage(false);
    }
  }, [toast, captureBoxRef]);

  const exportAsPDF = useCallback(async () => {
    setIsExportingPDF(true);
    try {
      if (!captureBoxRef.current) {
        throw new Error('Dashboard container not found');
      }

      const dataUrl = await toPng(captureBoxRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff', // Ensure background is captured
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [img.width, img.height],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      pdf.save(`cwa-map-${moment().format('DD-MM-YYYY-HH-mm-ss')}.pdf`);

      toast({
        title: 'Berhasil',
        description: 'PDF berhasil diekspor',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: 'Gagal',
        description: 'Gagal mengekspor PDF',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExportingPDF(false);
    }
  }, [toast, captureBoxRef]);

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
            <Box p={2} bg="blue.100" borderRadius="lg">
              <Icon as={FiDownload} color="blue.600" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                Ekspor Map
              </Text>
              <Text fontSize="sm" color="gray.600" fontWeight="normal">
                Simpan map Anda sebagai file
              </Text>
            </Box>
          </Flex>
        </ModalHeader>

        <ModalCloseButton top={4} right={4} borderRadius="full" _hover={{ bg: 'gray.100' }} />

        <ModalBody py={6}>
          <VStack spacing={4}>
            <Text color="gray.600" textAlign="center" fontSize="sm">
              Pilih format yang Anda inginkan untuk mengekspor gambar map
            </Text>

            <Divider />

            <VStack spacing={3} width="full">
              <Button
                onClick={exportAsPNG}
                isLoading={isExportingImage}
                isDisabled={isExportingPDF}
                loadingText="Mengekspor PNG..."
                width="full"
                size="lg"
                bgGradient="linear(to-r, blue.500, blue.600)"
                color="white"
                _hover={{
                  bgGradient: 'linear(to-r, blue.600, blue.700)',
                  transform: 'translateY(-1px)',
                  boxShadow: 'lg',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s"
                leftIcon={<Icon as={FiImage} boxSize={5} />}
                borderRadius="lg"
                fontWeight="medium">
                PNG
              </Button>

              <Button
                onClick={exportAsPDF}
                isLoading={isExportingPDF}
                isDisabled={isExportingImage}
                loadingText="Mengekspor PDF..."
                width="full"
                size="lg"
                bgGradient="linear(to-r, red.500, red.600)"
                color="white"
                _hover={{
                  bgGradient: 'linear(to-r, red.600, red.700)',
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
                PDF
              </Button>
            </VStack>

            <Box mt={4} p={3} bg="blue.50" borderRadius="lg" width="full">
              <HStack spacing={2}>
                <Icon as={FiImage} color="blue.600" boxSize={4} />
                <Text fontSize="xs" color="blue.700">
                  <strong>Tips:</strong> PNG format adalah format yang baik untuk gambar dengan
                  kualitas tinggi, sedangkan PDF adalah format yang baik untuk berbagi dan mencetak.
                </Text>
              </HStack>
            </Box>
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
