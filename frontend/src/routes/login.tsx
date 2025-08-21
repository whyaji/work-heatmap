import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginScreen } from '@/feature/auth/screen/LoginScreen';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    // If user is already authenticated, redirect to dashboard
    if (context.auth?.isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: LoginScreen,
});
