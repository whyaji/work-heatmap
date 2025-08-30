import { createFileRoute, redirect } from '@tanstack/react-router';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

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
  component: ComponentLoginScreen,
});

const envType = import.meta.env.VITE_ENV;
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function ComponentLoginScreen() {
  if (envType === 'development') {
    return <LoginScreen />;
  } else if (envType === 'production' || envType === 'staging') {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
        <LoginScreen />
      </GoogleReCaptchaProvider>
    );
  } else {
    console.error('Invalid environment type:', envType);
    return <div>Error: Invalid environment type</div>;
  }
}
