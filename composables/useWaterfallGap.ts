export const useWaterfallGap = () => {
  const { width } = useWindowSize();
  return computed(() => (width.value > 768 ? 14 : 4));
};
