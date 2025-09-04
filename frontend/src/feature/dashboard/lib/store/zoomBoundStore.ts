import { LatLngBounds } from 'leaflet';
import { create } from 'zustand';

interface ZoomBoundStore {
  zoom: number;
  bounds: LatLngBounds;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: LatLngBounds) => void;
}

export const useZoomBoundStore = create<ZoomBoundStore>((set) => ({
  zoom: 0,
  bounds: new LatLngBounds([0, 0], [0, 0]),
  setZoom: (zoom: number) => set({ zoom }),
  setBounds: (bounds: LatLngBounds) => set({ bounds }),
}));
