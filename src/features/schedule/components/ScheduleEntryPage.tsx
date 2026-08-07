import { normalizeRoleKey } from '../../../utils/roleLabels';
import { AdminCareerSelectionPage } from './AdminCareerSelectionPage';
import { SchedulePage } from './SchedulePage';

const getCurrentUserRoleKey = () => {
  try {
    const roles = JSON.parse(localStorage.getItem('unstapp_user_roles') ?? '[]');

    return normalizeRoleKey(Array.isArray(roles) ? roles.join(' ') : String(roles ?? ''));
  } catch {
    return 'student';
  }
};

export const ScheduleEntryPage = () => {
  const currentUserRoleKey = getCurrentUserRoleKey();

  return ['admin', 'teacher'].includes(currentUserRoleKey) ? <AdminCareerSelectionPage /> : <SchedulePage />;
};
