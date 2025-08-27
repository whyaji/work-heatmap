import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter } from '@tanstack/react-router';
import { ChakraProvider } from '@chakra-ui/react';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import './index.css';
import reportWebVitals from './reportWebVitals.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/auth/AuthProvider';
import { LoadingProvider } from './lib/loading/LoadingProvider.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 0,
    },
  },
});

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    // auth will initially be undefined
    // We'll be passing down the auth state from within a React component
    auth: undefined!,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Main App component that handles authentication context
function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <AuthProvider router={router}>
            {/* AuthProvider will render RouterProvider internally */}
          </AuthProvider>
          <LoadingProvider />
        </ChakraProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
