import { Spinner, Center, Text, VStack } from '@chakra-ui/react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <Center minH="100vh" bg="gray.50">
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text color="gray.600" fontSize="lg">
          {message}
        </Text>
      </VStack>
    </Center>
  );
};
