import type { CareerDto } from '../features/schedule/types/schedule.dtos';

const normalizeCareerName = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const getCareerIdsByNames = (careers: CareerDto[], assignedCareerNames: string[]) => {
  const assignedNames = new Set(
    assignedCareerNames
      .map(normalizeCareerName)
      .filter(Boolean),
  );

  if (assignedNames.size === 0) {
    return [];
  }

  return careers
    .filter((career) => assignedNames.has(normalizeCareerName(career.name)))
    .map((career) => career.id)
    .filter((careerId) => Number.isFinite(careerId));
};

export const getAssignedCareers = (
  careers: CareerDto[],
  assignedCareerIds: Array<number | string>,
  assignedCareerNames: string[],
) => {
  const assignedIds = new Set(assignedCareerIds.map(String));
  const assignedNames = new Set(
    assignedCareerNames
      .map(normalizeCareerName)
      .filter(Boolean),
  );

  if (assignedIds.size === 0 && assignedNames.size === 0) {
    return [];
  }

  return careers.filter((career) => (
    assignedIds.has(String(career.id)) ||
    assignedNames.has(normalizeCareerName(career.name))
  ));
};
