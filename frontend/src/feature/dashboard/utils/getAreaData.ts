import { getGeoJsonBlok } from '@/lib/api/areaApi';
import { AreaType } from '@/types/area.type';

import { BlokGeoJSON } from '../types/blockGeoJson.type';

export const getSelectedWilayahFilterArea = (
  dataWilayah: AreaType[],
  selectedWilayahId: string
) => {
  const selectedWilayahAbbr =
    dataWilayah.find((wilayah) => String(wilayah.id) === selectedWilayahId)?.abbr ?? null;
  const splitWilayahAbbr = selectedWilayahAbbr ? selectedWilayahAbbr.split(' ')[1] : null;
  const wilayahAddZero = (splitWilayahAbbr ?? '').length === 1 ? `0${splitWilayahAbbr}` : null;
  const wilayah = (splitWilayahAbbr ?? '').length > 1 ? splitWilayahAbbr : wilayahAddZero;

  return wilayah;
};

export const getSelectedRegionalFilterArea = (
  dataRegional: AreaType[],
  selectedRegionalId: string
) => {
  const selectedRegionalAbbr =
    dataRegional.find((regional) => String(regional.id) === selectedRegionalId)?.abbr ?? null;
  const splitRegionalAbbr = selectedRegionalAbbr ? selectedRegionalAbbr.split(' ')[1] : null;
  const regionalAddZero = (splitRegionalAbbr ?? '').length === 1 ? `0${splitRegionalAbbr}` : null;
  const regional = (splitRegionalAbbr ?? '').length > 1 ? splitRegionalAbbr : regionalAddZero;

  return regional;
};

export const getSelectedEstateFilterArea = (dataEstate: AreaType[], selectedEstateId: string) => {
  const selectedEstateAbbr =
    dataEstate.find((estate) => String(estate.id) === selectedEstateId)?.abbr ?? null;
  return selectedEstateAbbr;
};

export const getSelectedAfdelingFilterArea = (
  dataAfdeling: AreaType[],
  selectedAfdelingId: string
) => {
  const selectedAfdelingAbbr =
    dataAfdeling.find((afdeling) => String(afdeling.id) === selectedAfdelingId)?.abbr ?? null;
  const selectedAfdelingShortName = selectedAfdelingAbbr
    ? selectedAfdelingAbbr.split('-')[1]
    : null; // ex, OA
  return selectedAfdelingShortName;
};

export const getAreaGeoJsonBlokData = async ({
  dataEstate,
  estate,
  wilayah,
  afdeling,
  regional,
}: {
  dataEstate: AreaType[];
  estate: string | null;
  wilayah: string | null;
  afdeling: string | null;
  regional: string | null;
}) => {
  try {
    if (estate) {
      const geoJsonBlok = await getGeoJsonBlok(estate, afdeling);
      if ('type' in geoJsonBlok && 'features' in geoJsonBlok) {
        return geoJsonBlok as BlokGeoJSON;
      }
      throw new Error('Error fetching area geojson blok');
    } else if (wilayah || regional) {
      const estates = dataEstate.map((estate) => estate.abbr);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const geoJsonListResponse: { type: string; features: any[] }[] = [];

      for (const estate of estates) {
        try {
          const geoJson = await getGeoJsonBlok(estate, afdeling);
          if (
            geoJson &&
            'type' in geoJson &&
            'features' in geoJson &&
            geoJson.features.length > 0
          ) {
            geoJsonListResponse.push(geoJson);
          }
        } catch (err) {
          console.error(`Error fetching GeoJSON for ${estate}:`, err);
        }
      }

      const geoJson =
        geoJsonListResponse.length > 0
          ? {
              type: geoJsonListResponse[0].type,
              features: geoJsonListResponse.flatMap((geo) => geo.features),
            }
          : null;

      return geoJson as BlokGeoJSON;
    }
  } catch {
    throw new Error('Error fetching area geojson blok');
  }
};
