export interface MapTileOption {
  label: string;
  value: string;
  source: string;
  thumbnail: string;
  description: string;
}

const listMapTileOptions: MapTileOption[] = [
  {
    label: 'Satellite View',
    value:
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    source: 'Esri World Imagery',
    thumbnail: '/satellite-view.jpg',
    description: 'High-resolution satellite imagery',
  },
  {
    label: 'Street View',
    value: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    source: 'OpenStreetMap',
    thumbnail: '/street-view.jpg',
    description: 'Detailed street-level view',
  },
];

export default listMapTileOptions;
