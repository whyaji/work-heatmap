import { create } from 'zustand';

import { CoordinateHistoryType } from '@/types/coordinateHistory.type';

// Zustand store for loading state
interface TrackingIndexStore {
  isTrackingTimeline: boolean;
  setIsTrackingTimeline: (isTrackingTimeline: boolean) => void;
  trackingIndex: number;
  length: number;
  setLength: (length: number) => void;
  setTrackingIndex: (trackingIndex: number) => void;
  onNextIndex: () => void;
  onPrevIndex: () => void;
  coordinateDetail: CoordinateHistoryType | null;
  setCoordinateDetail: (coordinateDetail: CoordinateHistoryType) => void;
}

export const useTrackingIndexStore = create<TrackingIndexStore>((set) => ({
  isTrackingTimeline: false,
  trackingIndex: 0,
  length: 0,
  coordinateDetail: null,
  setIsTrackingTimeline: (isTrackingTimeline: boolean) => {
    set({ isTrackingTimeline });
    set({ trackingIndex: 0 });
    set({ coordinateDetail: null });
  },
  setLength: (length: number) => set({ length }),
  setTrackingIndex: (trackingIndex: number) => set({ trackingIndex }),
  onNextIndex: () =>
    set((state) =>
      state.length > state.trackingIndex + 1 ? { trackingIndex: state.trackingIndex + 1 } : {}
    ),
  onPrevIndex: () =>
    set((state) => (state.trackingIndex > 0 ? { trackingIndex: state.trackingIndex - 1 } : {})),
  setCoordinateDetail: (coordinateDetail) => set({ coordinateDetail }),
}));
