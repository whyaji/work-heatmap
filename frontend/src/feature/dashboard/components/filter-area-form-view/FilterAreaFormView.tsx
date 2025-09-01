import { FormControl, Select, Text, VStack } from '@chakra-ui/react';
import { FC } from 'react';

import { AreaType } from '@/types/area.type';

import { useFilterAreaForm } from '../../hooks/useFIlterAreaForm.hook';
import { useTrackingIndexStore } from '../../lib/store/trackingIndexStore';

export const FilterAreaFormView: FC<{
  isLoading: boolean;
  filterAreaFormState: ReturnType<typeof useFilterAreaForm>;
  dataRegional: AreaType[];
  dataWilayah: AreaType[];
  dataEstate: AreaType[];
  dataAfdeling: AreaType[];
}> = ({ isLoading, filterAreaFormState, dataRegional, dataWilayah, dataEstate, dataAfdeling }) => {
  const isTrackingTimeline = useTrackingIndexStore((state) => state.isTrackingTimeline);
  const {
    selectedRegionalId,
    selectedWilayahId,
    selectedEstateId,
    selectedAfdelingId,
    handleChangeRegional,
    handleChangeWilayah,
    handleChangeEstate,
    handleChangeAfdeling,
  } = filterAreaFormState;

  const disabledFilters = isLoading || isTrackingTimeline;

  return (
    <VStack spacing={3} align="stretch">
      <Text fontSize="sm" fontWeight="semibold" color="gray.700">
        Area
      </Text>
      {/* Regional Select */}
      <FormControl>
        <Select
          value={selectedRegionalId}
          onChange={(e) => handleChangeRegional(e.target.value)}
          size="sm"
          borderRadius="lg"
          disabled={disabledFilters}
          placeholder="Pilih Regional">
          {dataRegional.map((regional) => (
            <option key={regional.id} value={regional.id.toString()}>
              {regional.nama}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Wilayah Select */}
      <FormControl>
        <Select
          value={selectedWilayahId}
          onChange={(e) => handleChangeWilayah(e.target.value)}
          size="sm"
          borderRadius="lg"
          disabled={disabledFilters}
          placeholder="Pilih Wilayah">
          {dataWilayah.map((wilayah) => (
            <option key={wilayah.id} value={wilayah.id.toString()}>
              {wilayah.nama}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Estate Select */}
      <FormControl>
        <Select
          value={selectedEstateId}
          onChange={(e) => handleChangeEstate(e.target.value)}
          size="sm"
          borderRadius="lg"
          disabled={disabledFilters}
          placeholder="Pilih Estate">
          {dataEstate.map((estate) => (
            <option key={estate.id} value={estate.id.toString()}>
              {estate.nama}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Afdeling Select */}
      <FormControl>
        <Select
          value={selectedAfdelingId}
          onChange={(e) => handleChangeAfdeling(e.target.value)}
          size="sm"
          borderRadius="lg"
          disabled={disabledFilters}
          placeholder="Pilih Afdeling">
          {dataAfdeling.map((afdeling) => (
            <option key={afdeling.id} value={afdeling.id.toString()}>
              {afdeling.nama}
            </option>
          ))}
        </Select>
      </FormControl>
    </VStack>
  );
};
