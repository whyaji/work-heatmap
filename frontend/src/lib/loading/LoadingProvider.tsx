import {
  Box,
  Center,
  Image,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

import { useLoadingStore } from '../store/loadingStore';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const pulseDot = keyframes`
  0%, 100% {
    transform: scale(1);
    margin-left: 6px;
    margin-right: 6px;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.5;
    margin-left: 0;
    margin-right: 0;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

export const LoadingProvider = () => {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <Modal isOpen={isLoading} onClose={() => {}} isCentered>
      <ModalOverlay bg="blackAlpha.500" />
      <ModalContent
        bg="transparent"
        shadow="none"
        display="flex"
        alignItems="center"
        justifyContent="center">
        <Center>
          <Box
            p={8}
            bg="rgba(255, 255, 255, 0.95)"
            borderRadius="2xl"
            shadow="2xl"
            border="1px solid"
            borderColor="whiteAlpha.200"
            backdropFilter="blur(20px)"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-200px',
              width: '200px',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: `${shimmer} 2s infinite`,
            }}>
            <VStack spacing={6}>
              {/* Enhanced Logo with pulse animation */}
              <Box position="relative" animation={`${pulse} 2s infinite`}>
                <Image
                  src="/cwa-logo.jpeg"
                  alt="App Logo"
                  boxSize="80px"
                  objectFit="contain"
                  borderRadius="full"
                  shadow="lg"
                  border="3px solid"
                  borderColor="blue.100"
                  bg="white"
                  p={1}
                />
              </Box>

              {/* Enhanced text with gradient */}
              <VStack spacing={2}>
                <Text
                  fontSize="lg"
                  fontWeight="600"
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  bgClip="text"
                  textAlign="center">
                  Memuat data...
                </Text>

                <Text fontSize="sm" color="gray.600" textAlign="center" opacity={0.8}>
                  Mohon tunggu sebentar
                </Text>
              </VStack>

              {/* Loading dots animation */}
              <Box display="flex" alignItems="center" gap={1}>
                {[0, 1, 2].map((index) => (
                  <Box
                    key={index}
                    width="8px"
                    height="8px"
                    borderRadius="full"
                    bg="blue.400"
                    animation={`${pulseDot} 2s infinite`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  />
                ))}
              </Box>
            </VStack>
          </Box>
        </Center>
      </ModalContent>
    </Modal>
  );
};
