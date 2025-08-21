import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '@/lib/auth';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    // Check if user is authenticated
    if (!context.auth?.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          // Store the current location to redirect back after login
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box>
      <Outlet />
    </Box>
  );
}
