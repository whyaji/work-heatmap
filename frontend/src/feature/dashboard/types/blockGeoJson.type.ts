export type BlokGeoJSON = {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    properties: {
      block: string;
      estate: string;
      afdeling: string;
    };
    geometry: {
      type: 'Polygon';
      coordinates: [number, number][][];
    };
  }[];
};

export type AfdelingGeoJSON = {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    properties: {
      estate: string;
      afdeling: string;
      center: [number, number];
    };
    geometry: {
      type: 'Polygon';
      coordinates: [number, number][][];
    };
  }[];
};

export type EstateGeoJSON = {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    properties: {
      estate: string;
      center: [number, number];
    };
    geometry: {
      type: 'Polygon';
      coordinates: [number, number][][];
    };
  }[];
};
