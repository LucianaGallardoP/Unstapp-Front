import { AdminCareerSelectionPage } from './AdminCareerSelectionPage';
import { SchedulePage } from './SchedulePage';

const getIsCurrentUserAdmin = () => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return Array.isArray(roles) && roles.some((role) => String(role).toLowerCase().includes('admin'));
  } catch {
    return false;
  }
};

export const ScheduleEntryPage = () => {
  return getIsCurrentUserAdmin() ? <AdminCareerSelectionPage /> : <SchedulePage />;
};