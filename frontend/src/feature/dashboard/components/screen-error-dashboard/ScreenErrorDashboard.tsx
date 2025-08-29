import { Alert, AlertDescription, AlertIcon, AlertTitle, Box } from '@chakra-ui/react';
import { FC } from 'react';

export const ScreenErrorDashboard: FC<{
  bgColor?: string;
}> = ({ bgColor = 'gray.50' }) => {
  return (
    <Box minH="100vh" bg={bgColor} p={8}>
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>Gagal mengambil data. Silakan coba lagi.</AlertDescription>
      </Alert>
    </Box>
  );
};
