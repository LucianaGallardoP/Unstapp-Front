// Convierte una fecha en "Hace X min/hs/dias".
export const formatRelativeTime = (publishedAt: string, currentDate: Date) => {
  const publishedDate = new Date(publishedAt);
  const differenceInMinutes = Math.max(
    0,
    Math.floor((currentDate.getTime() - publishedDate.getTime()) / 60000),
  );

  if (differenceInMinutes < 1) {
    return 'Ahora';
  }

  if (differenceInMinutes < 60) {
    return `Hace ${differenceInMinutes} min`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `Hace ${differenceInHours}hs`;
  }

  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInDays === 1) {
    return 'Hace 1 dia';
  }

  return `Hace ${differenceInDays} dias`;
};
