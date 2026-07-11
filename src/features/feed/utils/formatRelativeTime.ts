// Convierte una fecha en texto relativo segun el idioma elegido.
export const formatRelativeTime = (publishedAt: string, currentDate: Date, language: 'es' | 'en' = 'es') => {
  const publishedDate = new Date(publishedAt);
  const differenceInMinutes = Math.max(
    0,
    Math.floor((currentDate.getTime() - publishedDate.getTime()) / 60000),
  );

  if (differenceInMinutes < 1) {
    return language === 'en' ? 'Now' : 'Ahora';
  }

  if (differenceInMinutes < 60) {
    return language === 'en' ? `${differenceInMinutes} min ago` : `Hace ${differenceInMinutes} min`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return language === 'en'
      ? `${differenceInHours}h ago`
      : `Hace ${differenceInHours}hs`;
  }

  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInDays === 1) {
    return language === 'en' ? '1 day ago' : 'Hace 1 día';
  }

  return language === 'en'
    ? `${differenceInDays} days ago`
    : `Hace ${differenceInDays} días`;
};
