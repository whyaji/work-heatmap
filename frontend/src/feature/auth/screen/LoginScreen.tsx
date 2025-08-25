import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Badge,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Divider,
  Link,
  useToast,
} from '@chakra-ui/react';
import {
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiMap,
  FiActivity,
  FiUsers,
  FiShield,
  FiCheckCircle,
  FiTarget,
  FiZap,
} from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { keyframes } from '@emotion/react';
import { Route } from '@/routes/login';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';

// Animation keyframes
const float = keyframes`
    0% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  `;

const pulse = keyframes`
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 0.8; }
  `;

const slideIn = keyframes`
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  `;

// Types
interface LoginFormData {
  username: string;
  password: string;
}

export const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search: any = Route.useSearch();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = search.redirect || '/dashboard';
      navigate({ to: redirectTo as any });
    }
  }, [isAuthenticated, navigate, search.redirect]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.username}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      reset();

      // Redirect to the intended page or dashboard
      const redirectTo = search.redirect || '/dashboard';
      window.location.href = redirectTo as any;
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bgColor} position="relative" overflow="hidden">
      {/* Background animated elements */}
      <Box
        position="absolute"
        top="10%"
        left="5%"
        w="200px"
        h="200px"
        bgGradient="linear(to-r, purple.400, blue.400)"
        borderRadius="full"
        filter="blur(60px)"
        opacity={0.3}
        animation={`${float} 8s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="20%"
        right="10%"
        w="300px"
        h="300px"
        bgGradient="linear(to-r, blue.400, teal.400)"
        borderRadius="full"
        filter="blur(80px)"
        opacity={0.2}
        animation={`${float} 10s ease-in-out infinite reverse`}
      />

      <Container maxW="7xl" minH="100vh" py={8}>
        <Flex minH="full" align="center" justify="center">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={0} maxW="6xl" w="full">
            {/* Left Panel - Branding & Visual */}
            <Box
              bgGradient="linear(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)"
              color="white"
              p={{ base: 8, lg: 12 }}
              borderLeftRadius={{ base: '2xl', lg: '2xl' }}
              borderRightRadius={{ base: '2xl', lg: 'none' }}
              borderBottomRadius={{ base: 'none', lg: '2xl' }}
              position="relative"
              overflow="hidden"
              minH={{ base: '300px', lg: '600px' }}>
              {/* Decorative elements */}
              <Box
                position="absolute"
                top="20%"
                left="10%"
                w="80px"
                h="80px"
                bg="whiteAlpha.200"
                borderRadius="full"
                animation={`${float} 6s ease-in-out infinite`}
              />
              <Box
                position="absolute"
                bottom="30%"
                right="15%"
                w="60px"
                h="60px"
                bg="whiteAlpha.150"
                borderRadius="full"
                animation={`${float} 8s ease-in-out infinite reverse`}
              />

              <VStack
                spacing={8}
                align="start"
                h="full"
                justify="center"
                position="relative"
                zIndex={1}>
                <VStack spacing={4} align="start">
                  <Badge
                    colorScheme="whiteAlpha"
                    px={3}
                    py={1}
                    borderRadius="full"
                    animation={`${pulse} 2s infinite`}>
                    <HStack spacing={2}>
                      <Icon as={FiShield} boxSize={3} />
                      <Text fontSize="sm">Secure Login</Text>
                    </HStack>
                  </Badge>

                  <Heading size="2xl" fontWeight="black" lineHeight="shorter">
                    Welcome to
                    <Text
                      as="span"
                      display="block"
                      bgGradient="linear(to-r, yellow.300, orange.300)"
                      bgClip="text">
                      CWA+ Dashboard
                    </Text>
                  </Heading>

                  <Text fontSize="lg" opacity={0.9} maxW="md">
                    Access your Quality Control Worker Tracking system. Monitor teams, analyze
                    performance, and optimize operations in real-time.
                  </Text>
                </VStack>

                {/* Features showcase */}
                <VStack spacing={4} align="start" w="full">
                  <HStack spacing={3} animation={`${slideIn} 0.5s ease-out`}>
                    <Icon as={FiMap} boxSize={5} />
                    <Text>Real-time Location Tracking</Text>
                  </HStack>
                  <HStack spacing={3} animation={`${slideIn} 0.5s ease-out 0.1s both`}>
                    <Icon as={FiActivity} boxSize={5} />
                    <Text>Advanced Heatmap Analytics</Text>
                  </HStack>
                  <HStack spacing={3} animation={`${slideIn} 0.5s ease-out 0.2s both`}>
                    <Icon as={FiUsers} boxSize={5} />
                    <Text>Team Performance Monitoring</Text>
                  </HStack>
                </VStack>

                {/* Stats */}
                <SimpleGrid columns={3} spacing={6} w="full" pt={4}>
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold">
                      2.5K+
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      Active Workers
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold">
                      150+
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      Areas Covered
                    </Text>
                  </VStack>
                  <VStack spacing={1}>
                    <Text fontSize="2xl" fontWeight="bold">
                      99.9%
                    </Text>
                    <Text fontSize="xs" opacity={0.8}>
                      Uptime
                    </Text>
                  </VStack>
                </SimpleGrid>
              </VStack>
            </Box>

            {/* Right Panel - Login Form */}
            <Card
              bg={cardBg}
              borderRightRadius={{ base: '2xl', lg: '2xl' }}
              borderLeftRadius={{ base: '2xl', lg: 'none' }}
              borderTopRadius={{ base: 'none', lg: '2xl' }}
              shadow="2xl"
              border="1px solid"
              borderColor="gray.100"
              minH={{ base: 'auto', lg: '600px' }}>
              <CardBody p={{ base: 8, lg: 12 }}>
                <VStack spacing={8} h="full" justify="center">
                  <VStack spacing={2} textAlign="center">
                    <Heading size="xl" color="gray.800" fontWeight="bold">
                      Sign In
                    </Heading>
                    <Text color="gray.600" fontSize="lg">
                      Enter your credentials to access your dashboard
                    </Text>
                  </VStack>

                  <Box w="full" maxW="sm">
                    <VStack spacing={6}>
                      <FormControl isInvalid={!!errors.username}>
                        <FormLabel color="gray.700" fontWeight="semibold">
                          Username
                        </FormLabel>
                        <InputGroup size="lg">
                          <InputLeftElement>
                            <Icon as={FiUser} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            {...register('username', { required: 'Username is required' })}
                            placeholder="Enter your username"
                            bg="gray.50"
                            border="2px solid"
                            borderColor="gray.200"
                            _hover={{ borderColor: 'purple.300' }}
                            _focus={{
                              borderColor: 'purple.500',
                              bg: 'white',
                              boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                            }}
                            borderRadius="xl"
                          />
                        </InputGroup>
                        <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!errors.password}>
                        <FormLabel color="gray.700" fontWeight="semibold">
                          Password
                        </FormLabel>
                        <InputGroup size="lg">
                          <InputLeftElement>
                            <Icon as={FiLock} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            {...register('password', { required: 'Password is required' })}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            bg="gray.50"
                            border="2px solid"
                            borderColor="gray.200"
                            _hover={{ borderColor: 'purple.300' }}
                            _focus={{
                              borderColor: 'purple.500',
                              bg: 'white',
                              boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                            }}
                            borderRadius="xl"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSubmit(onSubmit)();
                              }
                            }}
                          />
                          <InputRightElement>
                            <IconButton
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              icon={<Icon as={showPassword ? FiEyeOff : FiEye} />}
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPassword(!showPassword)}
                              color="gray.400"
                              _hover={{ color: 'gray.600' }}
                            />
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                      </FormControl>

                      <Button
                        onClick={handleSubmit(onSubmit)}
                        size="lg"
                        width="full"
                        bgGradient="linear(to-r, purple.500, blue.500)"
                        color="white"
                        _hover={{
                          bgGradient: 'linear(to-r, purple.600, blue.600)',
                          transform: 'translateY(-2px)',
                          boxShadow: 'xl',
                        }}
                        _active={{ transform: 'translateY(0)' }}
                        isLoading={isSubmitting}
                        loadingText="Signing in..."
                        fontWeight="bold"
                        borderRadius="xl"
                        transition="all 0.3s"
                        leftIcon={<Icon as={FiCheckCircle} />}>
                        Sign In to Dashboard
                      </Button>
                    </VStack>
                  </Box>

                  <VStack spacing={4} pt={4}>
                    <HStack spacing={4} opacity={0.7}>
                      <HStack spacing={1}>
                        <Icon as={FiShield} boxSize={4} />
                        <Text fontSize="sm">Secure</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={FiZap} boxSize={4} />
                        <Text fontSize="sm">Fast Access</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Icon as={FiTarget} boxSize={4} />
                        <Text fontSize="sm">24/7 Available</Text>
                      </HStack>
                    </HStack>

                    <Divider />

                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      Don't have an account?{' '}
                      <Link
                        color="purple.500"
                        fontWeight="semibold"
                        _hover={{ color: 'purple.600' }}>
                        Contact your administrator
                      </Link>
                    </Text>

                    <Text fontSize="xs" color="gray.400" textAlign="center">
                      Demo credentials: username: "demo", password: "demo"
                    </Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Flex>
      </Container>
    </Box>
  );
};
