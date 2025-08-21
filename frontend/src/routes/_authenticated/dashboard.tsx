import { DashboardScreen } from '@/feature/dashboard/screen/DashboardScreen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardScreen,
});
