import { createFileRoute, redirect } from '@tanstack/react-router';

import { OnboardingScreen } from '@/feature/onboarding/screen/OnboardingScreen';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    // If user is already authenticated, redirect to dashboard
    if (context.auth?.isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      });
    }
  },
  component: OnboardingScreen,
});
