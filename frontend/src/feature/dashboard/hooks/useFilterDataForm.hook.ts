import moment from 'moment';
import { useState } from 'react';

import { CoordinateHistoryFilters } from '@/lib/api/coordinateHistoryApi';

export const useFilterDataForm = () => {
  const [filters, setFilters] = useState<CoordinateHistoryFilters>({
    page: '1',
    limit: '1000',
  });
  const lastThirtyDays = moment().subtract(7, 'days').hour(0).minute(0).format('YYYY-MM-DDTHH:mm');
  const endTodayWithTime = moment().hour(23).minute(59).second(59).format('YYYY-MM-DDTHH:mm');
  const [startDate, setStartDate] = useState(lastThirtyDays);
  const [endDate, setEndDate] = useState(endTodayWithTime);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedUserId('');
    setFilters({ page: '1', limit: '100' });
  };

  return {
    filters,
    setFilters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedUserId,
    setSelectedUserId,
    clearFilters,
  };
};
