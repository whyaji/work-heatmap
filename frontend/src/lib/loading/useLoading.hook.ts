import { useLoadingStore } from '../store/loadingStore';

export const useLoading = () => {
  const showLoading = useLoadingStore((state) => state.showLoading);
  const hideLoading = useLoadingStore((state) => state.hideLoading);

  return { showLoading, hideLoading };
};
