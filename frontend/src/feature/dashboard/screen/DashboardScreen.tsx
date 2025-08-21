import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Avatar,
  Badge,
  Icon,
  Progress,
  Flex,
  useToast,
  useColorModeValue,
  Grid,
  GridItem,
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Circle,
} from '@chakra-ui/react';
import {
  FiMap,
  FiUsers,
  FiActivity,
  FiCheckCircle,
  FiTarget,
  FiNavigation,
  FiMapPin,
  FiShield,
  FiSettings,
  FiBell,
  FiFilter,
  FiDownload,
  FiEye,
  FiAlertTriangle,
  FiThermometer,
  FiZap,
  FiMoreVertical,
  FiRefreshCw,
  FiBarChart2,
} from 'react-icons/fi';
import { useState } from 'react';
import { keyframes } from '@emotion/react';
import { useAuth } from '@/lib/auth';

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
  const { user, logout } = useAuth();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
    toast({
      title: 'Data Refreshed',
      description: 'All tracking data has been updated.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const stats = [
    {
      label: 'Active Workers',
      number: '247',
      change: '+12',
      changePercent: '5.1%',
      isPositive: true,
      helpText: 'workers online now',
      icon: FiUsers,
      color: 'blue',
      gradient: 'linear(to-r, blue.400, blue.600)',
    },
    {
      label: 'Areas Covered',
      number: '156',
      change: '+8',
      changePercent: '5.4%',
      isPositive: true,
      helpText: 'active locations',
      icon: FiMap,
      color: 'green',
      gradient: 'linear(to-r, green.400, green.600)',
    },
    {
      label: 'Quality Checks',
      number: '2,847',
      change: '+186',
      changePercent: '7.0%',
      isPositive: true,
      helpText: 'completed today',
      icon: FiCheckCircle,
      color: 'purple',
      gradient: 'linear(to-r, purple.400, purple.600)',
    },
    {
      label: 'Efficiency Rate',
      number: '94.2%',
      change: '-1.2%',
      changePercent: '1.3%',
      isPositive: false,
      helpText: 'vs last week',
      icon: FiTarget,
      color: 'orange',
      gradient: 'linear(to-r, orange.400, orange.600)',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      worker: 'Ahmad Rizki',
      action: 'Completed quality check',
      location: 'Zone A-12',
      time: '2 minutes ago',
      status: 'success',
      avatar: null,
    },
    {
      id: 2,
      worker: 'Sari Dewi',
      action: 'Started inspection',
      location: 'Zone B-08',
      time: '5 minutes ago',
      status: 'active',
      avatar: null,
    },
    {
      id: 3,
      worker: 'Budi Santoso',
      action: 'Reported issue',
      location: 'Zone C-15',
      time: '8 minutes ago',
      status: 'warning',
      avatar: null,
    },
    {
      id: 4,
      worker: 'Rina Putri',
      action: 'Completed route',
      location: 'Zone D-03',
      time: '12 minutes ago',
      status: 'success',
      avatar: null,
    },
  ];

  const heatmapData = [
    { zone: 'Zone A', activity: 85, workers: 12, color: 'red' },
    { zone: 'Zone B', activity: 72, workers: 8, color: 'orange' },
    { zone: 'Zone C', activity: 94, workers: 15, color: 'red' },
    { zone: 'Zone D', activity: 58, workers: 6, color: 'yellow' },
    { zone: 'Zone E', activity: 91, workers: 14, color: 'red' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'active':
        return 'blue';
      case 'warning':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header */}
      <Box
        bg={cardBg}
        shadow="lg"
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}>
        <Container maxW="container.xl" py={4}>
          <Flex alignItems="center" justify="space-between">
            <HStack spacing={4}>
              <Box
                p={3}
                bgGradient="linear(to-r, purple.500, blue.500)"
                color="white"
                borderRadius="xl"
                animation={`${pulse} 3s infinite`}>
                <Icon as={FiActivity} boxSize={6} />
              </Box>
              <VStack spacing={0} align="start">
                <Heading size="lg" color="gray.800" fontWeight="black">
                  CWA Control Center
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Quality Control Worker Analytics
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={4}>
              <IconButton
                aria-label="Notifications"
                icon={<FiBell />}
                variant="ghost"
                size="lg"
                position="relative">
                <Circle size="8px" bg="red.500" position="absolute" top="2" right="2" />
              </IconButton>

              <IconButton
                aria-label="Refresh data"
                icon={<FiRefreshCw />}
                variant="ghost"
                size="lg"
                isLoading={refreshing}
                onClick={handleRefresh}
              />

              <Menu>
                <MenuButton as={Button} variant="ghost" size="lg">
                  <HStack spacing={3}>
                    <Avatar size="sm" name={user?.username} bg="purple.500" />
                    <VStack spacing={0} align="start">
                      <Text fontSize="sm" fontWeight="semibold">
                        {user?.username}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {user?.nama}
                      </Text>
                    </VStack>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                  <MenuItem icon={<FiShield />} onClick={handleLogout} color="red.500">
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {stats.map((stat, index) => (
              <Card
                key={index}
                bg={cardBg}
                shadow="xl"
                border="1px solid"
                borderColor={borderColor}
                _hover={{
                  shadow: '2xl',
                  transform: 'translateY(-4px)',
                  borderColor: `${stat.color}.200`,
                }}
                transition="all 0.3s"
                borderRadius="2xl"
                overflow="hidden"
                animation={`${slideIn} 0.5s ease-out ${index * 0.1}s both`}>
                <Box h="4px" bgGradient={stat.gradient} />
                <CardBody p={6}>
                  <Stat>
                    <Flex justify="space-between" align="start">
                      <VStack spacing={3} align="start">
                        <Box
                          p={3}
                          bgGradient={stat.gradient}
                          color="white"
                          borderRadius="xl"
                          _hover={{ transform: 'scale(1.1)' }}
                          transition="all 0.2s">
                          <Icon as={stat.icon} boxSize={6} />
                        </Box>
                        <Box>
                          <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">
                            {stat.label}
                          </StatLabel>
                          <StatNumber color="gray.800" fontSize="3xl" fontWeight="black">
                            {stat.number}
                          </StatNumber>
                          <StatHelpText color="gray.500" fontSize="xs" mb={0}>
                            {stat.helpText}
                          </StatHelpText>
                        </Box>
                      </VStack>

                      <VStack spacing={1} align="end">
                        <HStack spacing={1}>
                          <StatArrow type={stat.isPositive ? 'increase' : 'decrease'} />
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color={stat.isPositive ? 'green.500' : 'red.500'}>
                            {stat.changePercent}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.400">
                          {stat.change} today
                        </Text>
                      </VStack>
                    </Flex>
                  </Stat>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
            {/* Real-time Activity Map */}
            <GridItem>
              <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <VStack spacing={1} align="start">
                      <HStack spacing={2}>
                        <Icon as={FiMap} color="purple.500" boxSize={5} />
                        <Heading size="md" color="gray.800">
                          Real-time Worker Map
                        </Heading>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        Live tracking of all active workers
                      </Text>
                    </VStack>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Filter"
                        icon={<FiFilter />}
                        size="sm"
                        variant="ghost"
                      />
                      <IconButton
                        aria-label="View full map"
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                      />
                    </HStack>
                  </Flex>
                </CardHeader>
                <CardBody pt={2}>
                  <Box
                    w="full"
                    h="400px"
                    bg="gray.100"
                    borderRadius="xl"
                    border="2px solid"
                    borderColor="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    overflow="hidden">
                    <VStack spacing={4}>
                      <Icon as={FiMap} size="60px" color="gray.400" />
                      <Text color="gray.500" fontSize="lg">
                        Interactive Map View
                      </Text>
                      <Text color="gray.400" fontSize="sm">
                        Live worker positions & routes
                      </Text>
                    </VStack>

                    {/* Simulated map markers */}
                    <Circle
                      size="12px"
                      bg="green.400"
                      position="absolute"
                      top="20%"
                      left="25%"
                      animation={`${pulse} 2s infinite`}
                    />
                    <Circle
                      size="10px"
                      bg="blue.400"
                      position="absolute"
                      top="60%"
                      right="30%"
                      animation={`${pulse} 1.5s infinite`}
                    />
                    <Circle
                      size="8px"
                      bg="orange.400"
                      position="absolute"
                      bottom="30%"
                      left="40%"
                      animation={`${pulse} 2.5s infinite`}
                    />
                    <Circle
                      size="14px"
                      bg="red.400"
                      position="absolute"
                      top="40%"
                      right="20%"
                      animation={`${pulse} 1.8s infinite`}
                    />
                  </Box>

                  <HStack spacing={4} mt={4} justify="center">
                    <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                      <HStack spacing={1}>
                        <Circle size="6px" bg="green.400" />
                        <Text fontSize="xs">Active (156)</Text>
                      </HStack>
                    </Badge>
                    <Badge colorScheme="orange" px={2} py={1} borderRadius="full">
                      <HStack spacing={1}>
                        <Circle size="6px" bg="orange.400" />
                        <Text fontSize="xs">Break (12)</Text>
                      </HStack>
                    </Badge>
                    <Badge colorScheme="red" px={2} py={1} borderRadius="full">
                      <HStack spacing={1}>
                        <Circle size="6px" bg="red.400" />
                        <Text fontSize="xs">Alert (3)</Text>
                      </HStack>
                    </Badge>
                  </HStack>
                </CardBody>
              </Card>
            </GridItem>

            {/* Activity Feed */}
            <GridItem>
              <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden" h="fit-content">
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <VStack spacing={1} align="start">
                      <HStack spacing={2}>
                        <Icon as={FiActivity} color="blue.500" boxSize={5} />
                        <Heading size="md" color="gray.800">
                          Recent Activity
                        </Heading>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        Live worker updates
                      </Text>
                    </VStack>
                    <IconButton
                      aria-label="More options"
                      icon={<FiMoreVertical />}
                      size="sm"
                      variant="ghost"
                    />
                  </HStack>
                </CardHeader>
                <CardBody pt={2}>
                  <VStack spacing={4} align="stretch">
                    {recentActivities.map((activity) => (
                      <Box key={activity.id}>
                        <HStack spacing={3} align="start">
                          <Avatar
                            size="sm"
                            name={activity.worker}
                            bg={`${getStatusColor(activity.status)}.500`}
                          />
                          <VStack spacing={1} align="start" flex={1}>
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                                {activity.worker}
                              </Text>
                              <Badge
                                size="sm"
                                colorScheme={getStatusColor(activity.status)}
                                borderRadius="full">
                                {activity.status}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.600">
                              {activity.action}
                            </Text>
                            <HStack spacing={2}>
                              <Icon as={FiMapPin} boxSize={3} color="gray.400" />
                              <Text fontSize="xs" color="gray.500">
                                {activity.location}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                •
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {activity.time}
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>
                        {activity.id !== recentActivities.length && <Divider mt={4} />}
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>

          {/* Heatmap Analytics & Quick Actions */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
            {/* Zone Heatmap */}
            <GridItem>
              <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
                <CardHeader>
                  <HStack justify="space-between">
                    <VStack spacing={1} align="start">
                      <HStack spacing={2}>
                        <Icon as={FiThermometer} color="red.500" boxSize={5} />
                        <Heading size="md" color="gray.800">
                          Zone Activity Heatmap
                        </Heading>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        Worker density by area
                      </Text>
                    </VStack>
                    <Button size="sm" variant="outline" leftIcon={<FiDownload />}>
                      Export
                    </Button>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {heatmapData.map((zone) => (
                      <Box key={zone.zone}>
                        <HStack justify="space-between" mb={2}>
                          <HStack spacing={3}>
                            <Circle size="12px" bg={`${zone.color}.400`} />
                            <Text fontSize="sm" fontWeight="semibold">
                              {zone.zone}
                            </Text>
                          </HStack>
                          <HStack spacing={4}>
                            <Text fontSize="sm" color="gray.600">
                              {zone.workers} workers
                            </Text>
                            <Text fontSize="sm" fontWeight="bold">
                              {zone.activity}%
                            </Text>
                          </HStack>
                        </HStack>
                        <Progress
                          value={zone.activity}
                          size="md"
                          colorScheme={zone.color}
                          borderRadius="full"
                          bg="gray.100"
                        />
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            {/* Quick Actions */}
            <GridItem>
              <Card bg={cardBg} shadow="xl" borderRadius="2xl" overflow="hidden">
                <CardHeader>
                  <HStack spacing={2}>
                    <Icon as={FiZap} color="orange.500" boxSize={5} />
                    <Heading size="md" color="gray.800">
                      Quick Actions
                    </Heading>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={2} spacing={4}>
                    <Button
                      size="lg"
                      leftIcon={<FiMap />}
                      bgGradient="linear(to-r, blue.400, blue.600)"
                      color="white"
                      _hover={{ bgGradient: 'linear(to-r, blue.500, blue.700)' }}
                      borderRadius="xl"
                      h="auto"
                      py={4}
                      flexDirection="column">
                      <Icon as={FiMap} boxSize={6} />
                      <Text fontSize="sm">Live Map</Text>
                    </Button>

                    <Button
                      size="lg"
                      leftIcon={<FiUsers />}
                      bgGradient="linear(to-r, green.400, green.600)"
                      color="white"
                      _hover={{ bgGradient: 'linear(to-r, green.500, green.700)' }}
                      borderRadius="xl"
                      h="auto"
                      py={4}
                      flexDirection="column">
                      <Icon as={FiUsers} boxSize={6} />
                      <Text fontSize="sm">Workers</Text>
                    </Button>

                    <Button
                      size="lg"
                      leftIcon={<FiBarChart2 />}
                      bgGradient="linear(to-r, purple.400, purple.600)"
                      color="white"
                      _hover={{ bgGradient: 'linear(to-r, purple.500, purple.700)' }}
                      borderRadius="xl"
                      h="auto"
                      py={4}
                      flexDirection="column">
                      <Icon as={FiBarChart2} boxSize={6} />
                      <Text fontSize="sm">Analytics</Text>
                    </Button>

                    <Button
                      size="lg"
                      leftIcon={<FiTarget />}
                      bgGradient="linear(to-r, orange.400, orange.600)"
                      color="white"
                      _hover={{ bgGradient: 'linear(to-r, orange.500, orange.700)' }}
                      borderRadius="xl"
                      h="auto"
                      py={4}
                      flexDirection="column">
                      <Icon as={FiTarget} boxSize={6} />
                      <Text fontSize="sm">QC Reports</Text>
                    </Button>
                  </SimpleGrid>

                  <Divider my={6} />

                  <VStack spacing={3}>
                    <Button
                      size="md"
                      variant="outline"
                      leftIcon={<FiNavigation />}
                      w="full"
                      borderRadius="xl">
                      Route Optimization
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      leftIcon={<FiAlertTriangle />}
                      w="full"
                      borderRadius="xl"
                      colorScheme="red">
                      Emergency Alerts
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};
