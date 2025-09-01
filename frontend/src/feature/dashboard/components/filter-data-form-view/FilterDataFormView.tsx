import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FC } from 'react';
import { FiCalendar, FiFilter, FiUser } from 'react-icons/fi';

import { User } from '@/lib/api/userApi';

import { useFilterDataForm } from '../../hooks/useFilterDataForm.hook';
import { useTrackingIndexStore } from '../../lib/store/trackingIndexStore';

export const FilterDataFormView: FC<{
  userListData: User[];
  filterDataFormState: ReturnType<typeof useFilterDataForm>;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isExportImageOpen?: boolean;
}> = ({
  userListData,
  filterDataFormState,
  onApplyFilters,
  onClearFilters,
  isExportImageOpen = false,
}) => {
  const isTrackingTimeline = useTrackingIndexStore((state) => state.isTrackingTimeline);
  const { startDate, setStartDate, endDate, setEndDate, selectedUserId, setSelectedUserId } =
    filterDataFormState;

  const disabledFilters = isTrackingTimeline;

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
        Data Filters
      </Text>

      <FormControl>
        <FormLabel fontSize="sm" color="gray.700" fontWeight="semibold">
          <HStack spacing={2}>
            <Icon as={FiCalendar} boxSize={4} color="blue.500" />
            <Text fontSize="sm" color="gray.700" fontWeight="semibold">
              Start Date
            </Text>
          </HStack>
        </FormLabel>
        <Input
          type="datetime-local"
          disabled={disabledFilters}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="sm"
          borderRadius="lg"
          borderColor="gray.300"
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
          bg="white"
          color="gray.800"
          _placeholder={{ color: 'gray.400' }}
        />
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm" color="gray.700" fontWeight="semibold">
          <HStack spacing={2}>
            <Icon as={FiCalendar} boxSize={4} color="blue.500" />
            <Text fontSize="sm" color="gray.700" fontWeight="semibold">
              End Date
            </Text>
          </HStack>
        </FormLabel>
        <Input
          type="datetime-local"
          disabled={disabledFilters}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="sm"
          borderRadius="lg"
          borderColor="gray.300"
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
          bg="white"
          color="gray.800"
          _placeholder={{ color: 'gray.400' }}
        />
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm" color="gray.700" fontWeight="semibold">
          <HStack spacing={2}>
            <Icon as={FiUser} boxSize={4} color="blue.500" />
            <Text fontSize="sm" color="gray.700" fontWeight="semibold">
              User
            </Text>
          </HStack>
        </FormLabel>
        <Select
          value={selectedUserId}
          disabled={disabledFilters}
          onChange={(e) => setSelectedUserId(e.target.value)}
          size="sm"
          borderRadius="lg"
          placeholder="All Users"
          borderColor="gray.300"
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
          bg="white"
          color="gray.800"
          _placeholder={{ color: 'gray.400' }}>
          {userListData.map((user) => (
            <option key={user.id} value={user.id.toString()}>
              {user.nama || user.username || `User ${user.id}`}
            </option>
          ))}
        </Select>
      </FormControl>

      {!isExportImageOpen && !disabledFilters && (
        <>
          <HStack justify="center" pt={2}>
            <Button
              colorScheme="blue"
              leftIcon={<FiFilter />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                onApplyFilters();
              }}
              size="md"
              borderRadius="xl"
              fontWeight="semibold"
              w="full">
              Terapkan
            </Button>
          </HStack>

          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              onClearFilters();
            }}
            size="md"
            borderRadius="xl"
            fontWeight="semibold"
            borderColor="gray.300"
            color="gray.700"
            _hover={{ bg: 'gray.50', borderColor: 'gray.400' }}
            w="full">
            Clear
          </Button>
        </>
      )}
    </VStack>
  );
};
