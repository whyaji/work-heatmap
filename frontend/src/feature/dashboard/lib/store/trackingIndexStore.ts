import { create } from 'zustand';

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
}

export const useTrackingIndexStore = create<TrackingIndexStore>((set) => ({
  isTrackingTimeline: false,
  setIsTrackingTimeline: (isTrackingTimeline: boolean) => set({ isTrackingTimeline }),
  trackingIndex: 0,
  length: 0,
  setLength: (length: number) => set({ length }),
  setTrackingIndex: (trackingIndex: number) => set({ trackingIndex }),
  onNextIndex: () =>
    set((state) =>
      state.length > state.trackingIndex + 1 ? { trackingIndex: state.trackingIndex + 1 } : {}
    ),
  onPrevIndex: () =>
    set((state) => (state.trackingIndex > 0 ? { trackingIndex: state.trackingIndex - 1 } : {})),
}));
