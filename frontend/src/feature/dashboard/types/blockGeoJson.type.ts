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
