// i want to create a constant for additional area, there id and file geojson in server/lib/geojson-files
export const ADDITIONAL_AREA = {
  SRE: {
    id: 100001,
    abbr: 'SRE',
    nama: 'SUNGAI RANGIT ESTATE',
    wilayah: 3,
    regional: 1,
  },
};

export const SearchAdditionalAreaByWilayah = (wilayah: number) => {
  return Object.values(ADDITIONAL_AREA).filter((area) => area.wilayah === wilayah);
};

export const SearchAdditionalAreaByRegional = (regional: number) => {
  return Object.values(ADDITIONAL_AREA).filter((area) => area.regional === regional);
};

export const FindAdditionalAreaByEstateAbbr = (estate: string) => {
  return Object.values(ADDITIONAL_AREA).find((area) => area.abbr === estate);
};

import SREGeoJson from '../lib/geojson-files/SRE.json';

export const getAdditionalAreaFile = async (estate: string) => {
  switch (estate) {
    case 'SRE':
      return SREGeoJson;
    default:
      throw new Error(`GeoJSON file for estate "${estate}" not found.`);
  }
};
