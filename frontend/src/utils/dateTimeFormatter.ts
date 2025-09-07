export const getShortDateTime = (stringDate: string) => {
  return new Date(stringDate).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
