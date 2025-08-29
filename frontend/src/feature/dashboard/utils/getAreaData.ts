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
}: {
  dataEstate: AreaType[];
  estate: string | null;
  wilayah: string | null;
  afdeling: string | null;
}) => {
  try {
    if (estate) {
      const geoJsonBlok = await getGeoJsonBlok(estate, afdeling);
      if ('type' in geoJsonBlok && 'features' in geoJsonBlok) {
        return geoJsonBlok as BlokGeoJSON;
      }
      throw new Error('Error fetching area geojson blok');
    } else if (wilayah) {
      const estates = dataEstate.map((estate) => estate.abbr);
      const geoJsonListResponse = await Promise.all(
        estates.map((estate) => getGeoJsonBlok(estate, afdeling))
      );
      const geoJsonListSuccess = geoJsonListResponse.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (geoJson): geoJson is { type: string; features: any[] } =>
          'type' in geoJson && 'features' in geoJson && geoJson.features.length > 0
      );
      const geoJson =
        geoJsonListSuccess && geoJsonListSuccess.length > 0
          ? {
              type: geoJsonListSuccess[0].type,
              features: geoJsonListSuccess.flatMap((geoJson) => geoJson.features),
            }
          : null;
      return geoJson as BlokGeoJSON;
    }
  } catch {
    throw new Error('Error fetching area geojson blok');
  }
};
