import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Container,
  Heading,
  HStack,
  Icon,
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

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Feature data untuk CWA+ QC Worker Tracking
const features = [
  {
    icon: FiMap,
    title: 'Real-time Maps Integration',
    description:
      'Track worker locations in real-time with interactive maps and geofencing capabilities',
    color: 'blue',
    gradient: 'linear(to-r, blue.400, blue.600)',
  },
  {
    icon: FiActivity,
    title: 'Heatmap Analytics',
    description:
      'Visualize work density and performance patterns across different areas with dynamic heatmaps',
    color: 'red',
    gradient: 'linear(to-r, red.400, red.600)',
  },
  {
    icon: FiUsers,
    title: 'Worker Management',
    description:
      'Efficiently manage QC teams, assign tasks, and monitor individual performance metrics',
    color: 'green',
    gradient: 'linear(to-r, green.400, green.600)',
  },
  {
    icon: FiTarget,
    title: 'Quality Checkpoints',
    description:
      'Set up digital checkpoints for quality control validation and compliance tracking',
    color: 'purple',
    gradient: 'linear(to-r, purple.400, purple.600)',
  },
  {
    icon: FiNavigation,
    title: 'Route Optimization',
    description: 'AI-powered route planning to maximize efficiency and reduce travel time',
    color: 'orange',
    gradient: 'linear(to-r, orange.400, orange.600)',
  },
  {
    icon: FiBarChart2,
    title: 'Performance Dashboard',
    description: 'Comprehensive analytics and KPI tracking for data-driven decision making',
    color: 'teal',
    gradient: 'linear(to-r, teal.400, teal.600)',
  },
];

const stats = [
  { label: 'Active Workers', value: '2,500+', icon: FiUsers },
  { label: 'Areas Covered', value: '150+', icon: FiMap },
  { label: 'Daily Checks', value: '10K+', icon: FiCheckCircle },
  { label: 'Efficiency Boost', value: '85%', icon: FiTrendingUp },
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
      <Box
        bgGradient="linear(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
        color="white"
        py={20}
        position="relative"
        overflow="hidden">
        {/* Animated background elements */}
        <Box
          position="absolute"
          top="10%"
          left="10%"
          w="100px"
          h="100px"
          bg="whiteAlpha.100"
          borderRadius="full"
          animation={`${float} 6s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          top="60%"
          right="15%"
          w="150px"
          h="150px"
          bg="whiteAlpha.100"
          borderRadius="full"
          animation={`${float} 8s ease-in-out infinite reverse`}
        />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} alignItems="center">
            <VStack
              spacing={8}
              align={{ base: 'center', lg: 'start' }}
              textAlign={{ base: 'center', lg: 'left' }}>
              <Badge
                colorScheme="whiteAlpha"
                px={3}
                py={1}
                borderRadius="full"
                textTransform="none"
                fontSize="sm"
                animation={`${pulse} 2s infinite`}>
                <HStack spacing={2}>
                  <Icon as={FiZap} />
                  <Text>Powered by AI & Real-time Analytics</Text>
                </HStack>
              </Badge>

              <Heading size="3xl" fontWeight="black" lineHeight="shorter">
                CWA+
                <Text
                  as="span"
                  display="block"
                  bgGradient="linear(to-r, yellow.300, orange.300)"
                  bgClip="text">
                  CBI Work Area Plus
                </Text>
              </Heading>

              <Text fontSize="xl" maxW="xl" opacity={0.9}>
                Revolutionize your quality control operations with real-time worker tracking,
                intelligent heatmaps, and comprehensive performance analytics. Monitor, optimize,
                and scale your QC processes like never before.
              </Text>

              <HStack spacing={4}>
                <Link to="/login">
                  <Button
                    size="lg"
                    bg="white"
                    color="purple.600"
                    _hover={{ bg: 'gray.100', transform: 'translateY(-2px)' }}
                    px={8}
                    py={6}
                    fontSize="lg"
                    fontWeight="bold"
                    borderRadius="xl"
                    boxShadow="lg"
                    transition="all 0.3s">
                    <Icon as={FiEye} mr={2} />
                    Akses Dashboard
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  colorScheme="whiteAlpha"
                  px={8}
                  py={6}
                  fontSize="lg"
                  borderRadius="xl"
                  borderWidth="2px"
                  _hover={{ bg: 'whiteAlpha.200' }}>
                  Demo Live
                </Button>
              </HStack>
            </VStack>

            {/* Hero illustration placeholder */}
            <Center>
              <Box
                w="full"
                maxW="500px"
                h="400px"
                bg="whiteAlpha.200"
                borderRadius="2xl"
                border="2px solid"
                borderColor="whiteAlpha.300"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                overflow="hidden">
                <VStack spacing={4}>
                  <Icon as={FiMap} size="80px" opacity={0.7} />
                  <Text fontSize="lg" opacity={0.8}>
                    Interactive Map Preview
                  </Text>
                </VStack>

                {/* Floating elements */}
                <Box
                  position="absolute"
                  top="20%"
                  left="20%"
                  bg="green.400"
                  w="12px"
                  h="12px"
                  borderRadius="full"
                  animation={`${pulse} 1.5s infinite`}
                />
                <Box
                  position="absolute"
                  top="60%"
                  right="30%"
                  bg="red.400"
                  w="10px"
                  h="10px"
                  borderRadius="full"
                  animation={`${pulse} 2s infinite`}
                />
                <Box
                  position="absolute"
                  bottom="30%"
                  left="40%"
                  bg="yellow.400"
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  animation={`${pulse} 1.8s infinite`}
                />
              </Box>
            </Center>
          </SimpleGrid>
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
                Kombinasi sempurna antara teknologi GPS, AI analytics, dan interface intuitif untuk
                mengoptimalkan operasi quality control Anda.
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
