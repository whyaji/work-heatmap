declare module 'react-leaflet-heatmap-layer-v3' {
  import { Component } from 'react';

  export interface HeatmapLayerProps {
    points: Array<[number, number, number]> | Array<[number, number]>;
    longitudeExtractor?: (point: any) => number;
    latitudeExtractor?: (point: any) => number;
    intensityExtractor?: (point: any) => number;
    max?: number;
    radius?: number;
    blur?: number;
    maxZoom?: number;
    gradient?: { [key: number]: string };
    minOpacity?: number;
    useLocalExtrema?: boolean;
    onAdd?: (map: any) => void;
    onRemove?: (map: any) => void;
  }

  export class HeatmapLayer extends Component<HeatmapLayerProps> {}
}
