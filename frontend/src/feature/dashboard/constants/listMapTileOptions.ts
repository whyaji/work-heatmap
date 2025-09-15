export interface MapTileOption {
  label: string;
  value: string;
  subdomains?: string[];
  attribution?: string;
  source: string;
  thumbnail: string;
  description: string;
}

const listMapTileOptions: MapTileOption[] = [
  {
    label: 'Satellite View',
    value:
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      '&copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    source: 'Esri World Imagery',
    thumbnail: '/satellite-view.jpg',
    description: 'High-resolution satellite imagery',
  },
  {
    label: 'Street View',
    value: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    source: 'OpenStreetMap',
    thumbnail: '/street-view.jpg',
    description: 'Detailed street-level view',
  },
];

export default listMapTileOptions;
