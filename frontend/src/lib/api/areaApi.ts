import { api } from './api';

const areaApi = api['area'];

export const getRegional = async () => {
  const response = await areaApi.regional.$get();
  return response.json();
};

export const getRegionalsWilayah = async (regionalId: string) => {
  const response = await areaApi.regional[':id'].wilayah.$get({
    param: {
      id: regionalId,
    },
  });
  return response.json();
};

export const getWilayahsEstate = async (wilayahId: string) => {
  const response = await areaApi.wilayah[':id'].estate.$get({
    param: {
      id: wilayahId,
    },
  });
  return response.json();
};

export const getEstatesAfdeling = async (estateId: string) => {
  const response = await areaApi.estate[':id'].afdeling.$get({
    param: {
      id: estateId,
    },
  });
  return response.json();
};

export const getGeoJsonBlok = async (estateId: string, afdelingId: string | null) => {
  const response = await areaApi['geo-json-blok'].$get({
    query: {
      estate: estateId,
      ...(afdelingId && { afdeling: afdelingId }),
    },
  });
  return response.json();
};
