import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Link } from '@tanstack/react-router';
import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiEye,
  FiMap,
  FiNavigation,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from 'react-icons/fi';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Feature data untuk CWA+ QC Worker Tracking
const features = [
  {
    icon: FiMap,
    title: 'Integrasi Peta Real-time',
    description:
      'Lacak lokasi pekerja secara real-time dengan peta interaktif dan kemampuan geofencing',
    color: 'blue',
    gradient: 'linear(to-r, blue.400, blue.600)',
  },
  {
    icon: FiActivity,
    title: 'Analisis Heatmap',
    description:
      'Visualisasikan kepadatan kerja dan pola kinerja di berbagai area dengan heatmap dinamis',
    color: 'red',
    gradient: 'linear(to-r, red.400, red.600)',
  },
  {
    icon: FiUsers,
    title: 'Manajemen Pekerja',
    description: 'Kelola tim QC secara efisien, tetapkan tugas, dan pantau metrik kinerja individu',
    color: 'green',
    gradient: 'linear(to-r, green.400, green.600)',
  },
  {
    icon: FiTarget,
    title: 'Checkpoint Kualitas',
    description: 'Atur checkpoint digital untuk validasi kontrol kualitas dan pelacakan kepatuhan',
    color: 'purple',
    gradient: 'linear(to-r, purple.400, purple.600)',
  },
  {
    icon: FiNavigation,
    title: 'Optimasi Rute',
    description:
      'Perencanaan rute berbasis AI untuk memaksimalkan efisiensi dan mengurangi waktu perjalanan',
    color: 'orange',
    gradient: 'linear(to-r, orange.400, orange.600)',
  },
  {
    icon: FiBarChart2,
    title: 'Dashboard Kinerja',
    description:
      'Analitik komprehensif dan pelacakan KPI untuk pengambilan keputusan berbasis data',
    color: 'teal',
    gradient: 'linear(to-r, teal.400, teal.600)',
  },
];

const stats = [
  { label: 'Pekerja Aktif', value: '2,500+', icon: FiUsers },
  { label: 'Area Tercover', value: '150+', icon: FiMap },
  { label: 'Pemeriksaan Harian', value: '10K+', icon: FiCheckCircle },
  { label: 'Peningkatan Efisiensi', value: '85%', icon: FiTrendingUp },
];

export const OnboardingScreen = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box>
      {/* Hero Section */}
      <Box position="relative" overflow="hidden" display="flex" alignItems="center">
        {/* Background Image */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          filter="blur(5px)"
          backgroundImage="url('/onboarding-banner.jpg')"
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
        />

        {/* Gradient Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-b, rgba(24, 47, 147, 0.9) 0%, rgba(61, 23, 98, 0.8) 50%, rgba(111, 36, 120, 0.7) 100%)"
        />

        {/* Secondary gradient for better text readability */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(135deg, rgba(3, 5, 15, 0.4) 0%, rgba(59, 34, 85, 0.3) 50%, rgba(108, 48, 115, 0.2) 100%)"
        />

        {/* Content */}
        <Container maxW="container.xl" position="relative" zIndex={2} py={10}>
          <VStack spacing={8} align={'center'} textAlign={'center'}>
            <Badge
              bg="whiteAlpha.100"
              color="white"
              px={4}
              py={2}
              borderRadius="full"
              textTransform="none"
              fontSize="sm"
              backdropFilter="blur(10px)"
              border="1px solid"
              borderColor="whiteAlpha.500"
              animation={`${pulse} 5s infinite`}>
              <HStack spacing={2}>
                {/* image cbi-logo-with-text.png */}
                <Image src="/cbi-logo-with-text.png" alt="CBI Logo" height={12} />
                {/* image cwa-logo.jpeg with border radius */}
                <Image src="/cwa-logo.jpeg" alt="CWA Logo" height={12} borderRadius="full" />
              </HStack>
            </Badge>

            <Heading
              size="3xl"
              fontWeight="black"
              lineHeight="shorter"
              color="white"
              textShadow="0 2px 4px rgba(0,0,0,0.3)">
              CWA
              <Text as="span" color="green.400">
                +
              </Text>
              <Text
                as="span"
                display="block"
                bgGradient="linear(to-r, yellow.300, orange.200)"
                bgClip="text"
                border="1px solid"
                textShadow="none">
                CBI Work Area Plus
              </Text>
            </Heading>

            <Text
              fontSize="xl"
              maxW="xl"
              color="whiteAlpha.900"
              textShadow="0 1px 2px rgba(0,0,0,0.2)"
              lineHeight="tall">
              Revolusioner operasi kontrol kualitas Anda dengan pelacakan pekerja real-time, heatmap
              cerdas, dan analitik kinerja komprehensif. Pantau, optimalkan, dan skala proses QC
              Anda seperti sebelumnya.
            </Text>

            <HStack spacing={4}>
              <Link to="/login">
                <Button
                  size="lg"
                  bg="white"
                  color="purple.600"
                  _hover={{
                    bg: 'gray.50',
                    transform: 'translateY(-2px)',
                    boxShadow: 'xl',
                  }}
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="lg"
                  transition="all 0.3s"
                  backdropFilter="blur(10px)">
                  <Icon as={FiEye} mr={2} />
                  Akses Dashboard
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={16} bg={bgGradient}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            {stats.map((stat, index) => (
              <VStack key={index} spacing={3}>
                <Box
                  p={4}
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow="lg"
                  _hover={{ transform: 'translateY(-5px)' }}
                  transition="all 0.3s">
                  <Icon as={stat.icon} boxSize={8} color="purple.500" />
                </Box>
                <VStack spacing={1}>
                  <Text fontSize="3xl" fontWeight="black" color="purple.600">
                    {stat.value}
                  </Text>
                  <Text fontSize="sm" color={textColor} textAlign="center">
                    {stat.label}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg={cardBg}>
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center" maxW="3xl">
              <Badge colorScheme="purple" px={3} py={1} borderRadius="full">
                Fitur Unggulan
              </Badge>
              <Heading size="2xl" fontWeight="black" color="gray.800">
                Teknologi Terdepan untuk
                <Text
                  as="span"
                  display="block"
                  bgGradient="linear(to-r, purple.600, blue.600)"
                  bgClip="text">
                  Quality Control Modern
                </Text>
              </Heading>
              <Text fontSize="xl" color={textColor} maxW="2xl">
                Kombinasi sempurna antara teknologi GPS, analitik AI, dan antarmuka intuitif untuk
                mengoptimalkan operasi kontrol kualitas Anda.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {features.map((feature, index) => (
                <Card
                  key={index}
                  bg={cardBg}
                  shadow="xl"
                  border="1px solid"
                  borderColor="gray.100"
                  _hover={{
                    shadow: '2xl',
                    transform: 'translateY(-8px)',
                    borderColor: `${feature.color}.200`,
                  }}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  borderRadius="2xl"
                  overflow="hidden"
                  position="relative">
                  {/* Gradient overlay */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="4px"
                    bgGradient={feature.gradient}
                  />

                  <CardBody p={8}>
                    <VStack spacing={6} align="start">
                      <Box
                        p={4}
                        bgGradient={feature.gradient}
                        color="white"
                        borderRadius="xl"
                        _hover={{ transform: 'rotate(5deg) scale(1.1)' }}
                        transition="all 0.3s">
                        <Icon as={feature.icon} boxSize={8} />
                      </Box>

                      <VStack align="start" spacing={3}>
                        <Heading size="lg" color="gray.800" fontWeight="bold">
                          {feature.title}
                        </Heading>
                        <Text color={textColor} fontSize="md" lineHeight="tall">
                          {feature.description}
                        </Text>
                      </VStack>

                      <Button
                        variant="ghost"
                        colorScheme={feature.color}
                        size="sm"
                        rightIcon={<Icon as={FiNavigation} />}
                        _hover={{ bg: `${feature.color}.50` }}>
                        Pelajari Lebih Lanjut
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        py={20}
        bgGradient="linear(135deg, #1a1a1a 0%, #2d3748 50%, #4a5568 100%)"
        color="white"
        position="relative"
        overflow="hidden">
        {/* Background pattern */}
        <Box
          position="absolute"
          inset={0}
          opacity={0.1}
          backgroundImage="radial-gradient(circle at 25% 25%, white 2px, transparent 2px)"
          backgroundSize="50px 50px"
        />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={10} textAlign="center">
            <VStack spacing={6}>
              <Badge colorScheme="whiteAlpha" px={3} py={1} borderRadius="full">
                Mulai Hari Ini
              </Badge>
              <Heading size="2xl" fontWeight="black">
                Siap Mengoptimalkan
                <Text
                  as="span"
                  display="block"
                  bgGradient="linear(to-r, yellow.300, orange.300)"
                  bgClip="text">
                  Quality Control Anda?
                </Text>
              </Heading>
              <Text fontSize="xl" maxW="2xl" opacity={0.9}>
                Bergabunglah dengan ribuan profesional QC yang telah merasakan peningkatan efisiensi
                hingga 85% dengan CWA+ Worker Tracking System.
              </Text>
            </VStack>

            <HStack spacing={6} flexWrap="wrap" justify="center">
              <Link to="/login">
                <Button
                  size="xl"
                  bgGradient="linear(to-r, purple.500, blue.500)"
                  _hover={{
                    bgGradient: 'linear(to-r, purple.600, blue.600)',
                    transform: 'translateY(-2px)',
                  }}
                  px={10}
                  py={8}
                  fontSize="lg"
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="2xl"
                  leftIcon={<Icon as={FiEye} />}>
                  Akses Dashboard
                </Button>
              </Link>
            </HStack>

            <HStack spacing={8} pt={8} opacity={0.7}>
              <HStack spacing={2}>
                <Icon as={FiShield} />
                <Text fontSize="sm">Enterprise Security</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FiUsers} />
                <Text fontSize="sm">24/7 Support</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FiZap} />
                <Text fontSize="sm">Setup dalam 5 Menit</Text>
              </HStack>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};
