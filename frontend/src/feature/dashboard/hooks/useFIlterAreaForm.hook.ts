import { useState } from 'react';

export const useFilterAreaForm = () => {
  const [filterArea, setFilterArea] = useState<{
    regional: string;
    wilayah: string;
    estate: string;
    afdeling: string;
  }>({
    regional: '',
    wilayah: '',
    estate: '',
    afdeling: '',
  });
  const [selectedRegionalId, setSelectedRegionalId] = useState<string>('');
  const [selectedWilayahId, setSelectedWilayahId] = useState<string>('');
  const [selectedEstateId, setSelectedEstateId] = useState<string>('');
  const [selectedAfdelingId, setSelectedAfdelingId] = useState<string>('');

  const handleChangeRegional = (value: string) => {
    setSelectedRegionalId(value);
    setSelectedWilayahId('');
    setSelectedEstateId('');
    setSelectedAfdelingId('');
  };

  const handleChangeWilayah = (value: string) => {
    setSelectedWilayahId(value);
    setSelectedEstateId('');
    setSelectedAfdelingId('');
  };

  const handleChangeEstate = (value: string) => {
    setSelectedEstateId(value);
    setSelectedAfdelingId('');
  };

  const handleChangeAfdeling = (value: string) => {
    setSelectedAfdelingId(value);
  };

  return {
    selectedRegionalId,
    selectedWilayahId,
    selectedEstateId,
    selectedAfdelingId,
    handleChangeRegional,
    handleChangeWilayah,
    handleChangeEstate,
    handleChangeAfdeling,
    filterArea,
    setFilterArea,
  };
};
