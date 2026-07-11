import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type LanguageCode = 'es' | 'en';
type TranslationKey =
  | 'language.es'
  | 'language.en'
  | 'language.toggleToEnglish'
  | 'language.toggleToSpanish'
  | 'nav.feed'
  | 'nav.calendar'
  | 'nav.schedule'
  | 'nav.profile'
  | 'topbar.notifications'
  | 'topbar.closeNotifications'
  | 'topbar.deleteAll'
  | 'topbar.loadingNotifications'
  | 'topbar.emptyNotifications'
  | 'topbar.unreadNotifications'
  | 'topbar.darkSelected'
  | 'topbar.lightSelected'
  | 'topbar.toLight'
  | 'topbar.toDark'
  | 'search.placeholder'
  | 'search.close'
  | 'search.people'
  | 'search.posts'
  | 'search.noResults'
  | 'login.welcome'
  | 'login.subtitle'
  | 'login.dniPlaceholder'
  | 'login.password'
  | 'login.showPassword'
  | 'login.hidePassword'
  | 'login.forgot'
  | 'login.firstTime'
  | 'login.submit'
  | 'login.loading'
  | 'login.error'
  | 'login.sessionExpired'
  | 'auth.continue'
  | 'auth.validating'
  | 'auth.backToLogin'
  | 'auth.recoverTitle'
  | 'auth.recoverSubtitle'
  | 'auth.recoverError'
  | 'auth.recoverSuccess'
  | 'auth.createPassword'
  | 'auth.createPasswordSubtitle'
  | 'auth.repeatPassword'
  | 'auth.savePassword'
  | 'auth.saving'
  | 'auth.passwordsDontMatch'
  | 'auth.invalidToken'
  | 'auth.done'
  | 'auth.doneSubtitle'
  | 'auth.start'
  | 'auth.hasAccount'
  | 'feed.all'
  | 'feed.myCareer'
  | 'feed.admin'
  | 'feed.loading'
  | 'feed.updating'
  | 'feed.emptyCategory'
  | 'post.comments'
  | 'post.closeComments'
  | 'post.noComments'
  | 'post.writeComment'
  | 'post.loginToComment'
  | 'post.sendComment'
  | 'post.deletePost'
  | 'post.deletePublication'
  | 'post.deleteConfirmTitle'
  | 'post.deleteConfirmText'
  | 'post.delete'
  | 'post.cancel'
  | 'post.deleting'
  | 'post.likeError'
  | 'post.deleteError'
  | 'post.imageAlt'
  | 'post.viewImage'
  | 'post.closeImage'
  | 'post.fileAttachment'
  | 'createPost.title'
  | 'createPost.placeholder'
  | 'createPost.media'
  | 'createPost.publish'
  | 'createPost.publishing'
  | 'createPost.remove'
  | 'createPost.previewAlt'
  | 'createPost.rejected'
  | 'createPost.error'
  | 'calendar.academicAgenda'
  | 'calendar.previousMonth'
  | 'calendar.nextMonth'
  | 'calendar.selectDay'
  | 'calendar.dayEvents'
  | 'calendar.createEvent'
  | 'calendar.loadingEvents'
  | 'calendar.emptyDay'
  | 'calendar.viewFilters'
  | 'calendar.exams'
  | 'calendar.classes'
  | 'calendar.events'
  | 'calendar.holidays'
  | 'calendar.deleteEvent'
  | 'calendar.deleteEventTitle'
  | 'calendar.deleteEventText'
  | 'calendar.removeFromCalendar'
  | 'calendar.cancel'
  | 'calendar.delete'
  | 'calendar.deleting'
  | 'profile.posts'
  | 'profile.myPosts'
  | 'profile.loading'
  | 'profile.edit'
  | 'profile.logout'
  | 'profile.follow'
  | 'profile.following'
  | 'profile.followers'
  | 'profile.followingCount'
  | 'profile.followError'
  | 'profile.publications'
  | 'profile.role.admin'
  | 'profile.role.teacher'
  | 'profile.role.bar'
  | 'profile.role.student'
  | 'schedule.backToCareers'
  | 'schedule.loadingContext'
  | 'schedule.campus'
  | 'schedule.daySchedule'
  | 'schedule.subject'
  | 'schedule.subjects'
  | 'schedule.hour'
  | 'schedule.hours'
  | 'schedule.emptyDay'
  | 'schedule.problemTitle'
  | 'schedule.problemText'
  | 'schedule.report'
  | 'common.close'
  | 'common.cancel'
  | 'common.delete'
  | 'common.deleting';

type TranslationMap = Record<TranslationKey, string>;

interface LanguageContextValue {
  language: LanguageCode;
  isEnglish: boolean;
  toggleLanguage: () => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
}

const LANGUAGE_STORAGE_KEY = 'unstapp_language';

const translations: Record<LanguageCode, TranslationMap> = {
  es: {
    'language.es': 'ES',
    'language.en': 'EN',
    'language.toggleToEnglish': 'Cambiar a inglés',
    'language.toggleToSpanish': 'Cambiar a español',
    'nav.feed': 'FEED',
    'nav.calendar': 'CALENDARIO',
    'nav.schedule': 'HORARIO',
    'nav.profile': 'PERFIL',
    'topbar.notifications': 'Notificaciones',
    'topbar.closeNotifications': 'Cerrar notificaciones',
    'topbar.deleteAll': 'Eliminar todas',
    'topbar.loadingNotifications': 'Cargando notificaciones...',
    'topbar.emptyNotifications': 'No hay notificaciones pendientes.',
    'topbar.unreadNotifications': 'Hay notificaciones nuevas',
    'topbar.darkSelected': 'Oscuro',
    'topbar.lightSelected': 'Claro',
    'topbar.toLight': 'Cambiar a modo claro',
    'topbar.toDark': 'Cambiar a modo oscuro',
    'search.placeholder': 'Buscar...',
    'search.close': 'Cerrar búsqueda',
    'search.people': 'Personas',
    'search.posts': 'Publicaciones',
    'search.noResults': 'No se encontraron coincidencias para "{query}"',
    'login.welcome': 'Bienvenido',
    'login.subtitle': 'Accede a tu comunidad académica y gestiona tu vida universitaria.',
    'login.dniPlaceholder': 'Ingresá tu DNI',
    'login.password': 'Contraseña',
    'login.showPassword': 'Mostrar contraseña',
    'login.hidePassword': 'Ocultar contraseña',
    'login.forgot': '¿Olvidaste tu contraseña?',
    'login.firstTime': '¿Es tu primera vez ingresando?',
    'login.submit': 'Iniciar Sesión',
    'login.loading': 'Iniciando sesión...',
    'login.error': 'Usuario o contraseña incorrectos',
    'login.sessionExpired': 'Tu sesión expiró. Iniciá sesión nuevamente.',
    'auth.continue': 'Continuar',
    'auth.validating': 'Validando...',
    'auth.backToLogin': 'Volver al inicio de sesión',
    'auth.recoverTitle': 'Recuperar contraseña',
    'auth.recoverSubtitle': 'Ingresá tu DNI para validar tu cuenta y crear una nueva contraseña.',
    'auth.recoverError': 'No se pudo iniciar la recuperación de contraseña.',
    'auth.recoverSuccess': 'Te enviamos un enlace al correo asociado a tu DNI.',
    'auth.createPassword': 'Crear contraseña',
    'auth.createPasswordSubtitle': 'Ingresá y confirmá tu nueva contraseña para acceder a Unstapp.',
    'auth.repeatPassword': 'Repetir contraseña',
    'auth.savePassword': 'Guardar contraseña',
    'auth.saving': 'Guardando...',
    'auth.passwordsDontMatch': 'Las contraseñas no coinciden.',
    'auth.invalidToken': 'El enlace de registro no es válido o está incompleto. Asegurate de abrir el enlace completo que recibiste por correo.',
    'auth.done': '¡Todo listo!',
    'auth.doneSubtitle': 'Ya podés empezar a disfrutar de tu experiencia en Unstapp.',
    'auth.start': 'Comenzar',
    'auth.hasAccount': '¿Ya tenés cuenta?',
    'feed.all': 'Todo',
    'feed.myCareer': 'Mi carrera',
    'feed.admin': 'Administrativo',
    'feed.loading': 'Cargando publicaciones...',
    'feed.updating': 'Actualizando publicaciones...',
    'feed.emptyCategory': 'No hay publicaciones recientes en esta categoría.',
    'post.comments': 'Comentarios',
    'post.closeComments': 'Cerrar comentarios',
    'post.noComments': 'Todavía no hay comentarios.',
    'post.writeComment': 'Escribir comentario',
    'post.loginToComment': 'Iniciá sesión para comentar',
    'post.sendComment': 'Enviar comentario',
    'post.deletePost': 'Eliminar Publicación',
    'post.deletePublication': 'Abrir menú de publicación',
    'post.deleteConfirmTitle': 'Eliminar publicación',
    'post.deleteConfirmText': '¿Estás seguro de eliminar esta publicación?',
    'post.delete': 'Eliminar',
    'post.cancel': 'Cancelar',
    'post.deleting': 'Eliminando...',
    'post.likeError': 'No se pudo procesar el like',
    'post.deleteError': 'No se pudo eliminar la publicación.',
    'post.imageAlt': 'Contenido multimedia de la publicación',
    'post.viewImage': 'Ver imagen completa',
    'post.closeImage': 'Cerrar imagen',
    'post.fileAttachment': 'Archivo adjunto',
    'createPost.title': 'Nueva Publicación',
    'createPost.placeholder': '¿Qué querés compartir con el campus?',
    'createPost.media': 'Agregar multimedia',
    'createPost.publish': 'Publicar',
    'createPost.publishing': 'Publicando',
    'createPost.remove': 'Eliminar',
    'createPost.previewAlt': 'Previsualización del archivo seleccionado',
    'createPost.rejected': 'Tu publicación fue rechazada por nuestro filtro automatizado debido a contenido inapropiado.',
    'createPost.error': 'No se pudo publicar. Intentalo nuevamente.',
    'calendar.academicAgenda': 'Agenda Académica',
    'calendar.previousMonth': 'Ver mes anterior',
    'calendar.nextMonth': 'Ver mes siguiente',
    'calendar.selectDay': 'Seleccionar día {day}',
    'calendar.dayEvents': 'Eventos del día',
    'calendar.createEvent': 'Crear nuevo evento',
    'calendar.loadingEvents': 'Cargando eventos...',
    'calendar.emptyDay': 'No hay eventos para este día.',
    'calendar.viewFilters': 'Filtros de Vista',
    'calendar.exams': 'Exámenes',
    'calendar.classes': 'Clases',
    'calendar.events': 'Eventos',
    'calendar.holidays': 'Feriados',
    'calendar.deleteEvent': 'Eliminar evento',
    'calendar.deleteEventTitle': '¿Eliminar evento?',
    'calendar.deleteEventText': 'Esta acción quitará el evento {title} del calendario.',
    'calendar.removeFromCalendar': 'Confirmar eliminación de evento',
    'calendar.cancel': 'Cancelar',
    'calendar.delete': 'Eliminar',
    'calendar.deleting': 'Eliminando...',
    'profile.posts': 'Publicaciones',
    'profile.myPosts': 'Mis Publicaciones',
    'profile.loading': 'Cargando perfil...',
    'profile.edit': 'Editar Perfil',
    'profile.logout': 'Cerrar Sesión',
    'profile.follow': 'Seguir',
    'profile.following': 'Siguiendo',
    'profile.followers': 'SEGUIDORES',
    'profile.followingCount': 'SIGUIENDO',
    'profile.followError': 'No se pudo actualizar el seguimiento',
    'profile.publications': 'PUBLICACIONES',
    'profile.role.admin': 'Administrador',
    'profile.role.teacher': 'Docente',
    'profile.role.bar': 'Bar',
    'profile.role.student': 'Alumno',
    'schedule.backToCareers': 'Volver a Carreras',
    'schedule.loadingContext': 'Cargando contexto...',
    'schedule.campus': 'Sede',
    'schedule.daySchedule': 'Cronograma del día',
    'schedule.subject': 'materia',
    'schedule.subjects': 'materias',
    'schedule.hour': 'hora',
    'schedule.hours': 'horas',
    'schedule.emptyDay': 'No hay clases cargadas para este día.',
    'schedule.problemTitle': '¿Problemas con tu horario?',
    'schedule.problemText': 'Si detectás inconsistencias en las aulas o materias, reportalo inmediatamente a bedelía para su corrección.',
    'schedule.report': 'Reportar',
    'common.close': 'Cerrar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.deleting': 'Eliminando...',
  },
  en: {
    'language.es': 'ES',
    'language.en': 'EN',
    'language.toggleToEnglish': 'Switch to English',
    'language.toggleToSpanish': 'Switch to Spanish',
    'nav.feed': 'FEED',
    'nav.calendar': 'CALENDAR',
    'nav.schedule': 'SCHEDULE',
    'nav.profile': 'PROFILE',
    'topbar.notifications': 'Notifications',
    'topbar.closeNotifications': 'Close notifications',
    'topbar.deleteAll': 'Delete all',
    'topbar.loadingNotifications': 'Loading notifications...',
    'topbar.emptyNotifications': 'No pending notifications.',
    'topbar.unreadNotifications': 'There are new notifications',
    'topbar.darkSelected': 'Dark',
    'topbar.lightSelected': 'Light',
    'topbar.toLight': 'Switch to light mode',
    'topbar.toDark': 'Switch to dark mode',
    'search.placeholder': 'Search...',
    'search.close': 'Close search',
    'search.people': 'People',
    'search.posts': 'Posts',
    'search.noResults': 'No matches found for "{query}"',
    'login.welcome': 'Welcome',
    'login.subtitle': 'Access your academic community and manage your university life.',
    'login.dniPlaceholder': 'Enter your DNI',
    'login.password': 'Password',
    'login.showPassword': 'Show password',
    'login.hidePassword': 'Hide password',
    'login.forgot': 'Forgot your password?',
    'login.firstTime': 'Is this your first time signing in?',
    'login.submit': 'Sign In',
    'login.loading': 'Signing in...',
    'login.error': 'Incorrect user or password',
    'login.sessionExpired': 'Your session expired. Sign in again.',
    'auth.continue': 'Continue',
    'auth.validating': 'Validating...',
    'auth.backToLogin': 'Back to sign in',
    'auth.recoverTitle': 'Recover password',
    'auth.recoverSubtitle': 'Enter your DNI to validate your account and create a new password.',
    'auth.recoverError': 'Password recovery could not be started.',
    'auth.recoverSuccess': 'We sent a link to the email associated with your DNI.',
    'auth.createPassword': 'Create password',
    'auth.createPasswordSubtitle': 'Enter and confirm your new password to access Unstapp.',
    'auth.repeatPassword': 'Repeat password',
    'auth.savePassword': 'Save password',
    'auth.saving': 'Saving...',
    'auth.passwordsDontMatch': 'Passwords do not match.',
    'auth.invalidToken': 'The registration link is invalid or incomplete. Make sure you open the full link you received by email.',
    'auth.done': 'All set!',
    'auth.doneSubtitle': 'You can now start enjoying your Unstapp experience.',
    'auth.start': 'Start',
    'auth.hasAccount': 'Already have an account?',
    'feed.all': 'All',
    'feed.myCareer': 'My career',
    'feed.admin': 'Administrative',
    'feed.loading': 'Loading posts...',
    'feed.updating': 'Updating posts...',
    'feed.emptyCategory': 'There are no recent posts in this category.',
    'post.comments': 'Comments',
    'post.closeComments': 'Close comments',
    'post.noComments': 'There are no comments yet.',
    'post.writeComment': 'Write a comment',
    'post.loginToComment': 'Sign in to comment',
    'post.sendComment': 'Send comment',
    'post.deletePost': 'Delete Post',
    'post.deletePublication': 'Open post menu',
    'post.deleteConfirmTitle': 'Delete post',
    'post.deleteConfirmText': 'Are you sure you want to delete this post?',
    'post.delete': 'Delete',
    'post.cancel': 'Cancel',
    'post.deleting': 'Deleting...',
    'post.likeError': 'The like could not be processed',
    'post.deleteError': 'The post could not be deleted.',
    'post.imageAlt': 'Post multimedia content',
    'post.viewImage': 'View full image',
    'post.closeImage': 'Close image',
    'post.fileAttachment': 'Attached file',
    'createPost.title': 'New Post',
    'createPost.placeholder': 'What do you want to share with campus?',
    'createPost.media': 'Add media',
    'createPost.publish': 'Publish',
    'createPost.publishing': 'Publishing',
    'createPost.remove': 'Remove',
    'createPost.previewAlt': 'Selected file preview',
    'createPost.rejected': 'Your post was rejected by our automated filter due to inappropriate content.',
    'createPost.error': 'Could not publish. Please try again.',
    'calendar.academicAgenda': 'Academic Agenda',
    'calendar.previousMonth': 'View previous month',
    'calendar.nextMonth': 'View next month',
    'calendar.selectDay': 'Select day {day}',
    'calendar.dayEvents': 'Day events',
    'calendar.createEvent': 'Create new event',
    'calendar.loadingEvents': 'Loading events...',
    'calendar.emptyDay': 'There are no events for this day.',
    'calendar.viewFilters': 'View Filters',
    'calendar.exams': 'Exams',
    'calendar.classes': 'Classes',
    'calendar.events': 'Events',
    'calendar.holidays': 'Holidays',
    'calendar.deleteEvent': 'Delete event',
    'calendar.deleteEventTitle': 'Delete event?',
    'calendar.deleteEventText': 'This action will remove the event {title} from the calendar.',
    'calendar.removeFromCalendar': 'Confirm event deletion',
    'calendar.cancel': 'Cancel',
    'calendar.delete': 'Delete',
    'calendar.deleting': 'Deleting...',
    'profile.posts': 'Posts',
    'profile.myPosts': 'My Posts',
    'profile.loading': 'Loading profile...',
    'profile.edit': 'Edit Profile',
    'profile.logout': 'Log Out',
    'profile.follow': 'Follow',
    'profile.following': 'Following',
    'profile.followers': 'FOLLOWERS',
    'profile.followingCount': 'FOLLOWING',
    'profile.followError': 'Follow status could not be updated',
    'profile.publications': 'POSTS',
    'profile.role.admin': 'Administrator',
    'profile.role.teacher': 'Teacher',
    'profile.role.bar': 'Bar',
    'profile.role.student': 'Student',
    'schedule.backToCareers': 'Back to Careers',
    'schedule.loadingContext': 'Loading context...',
    'schedule.campus': 'Campus',
    'schedule.daySchedule': 'Day schedule',
    'schedule.subject': 'subject',
    'schedule.subjects': 'subjects',
    'schedule.hour': 'hour',
    'schedule.hours': 'hours',
    'schedule.emptyDay': 'There are no classes loaded for this day.',
    'schedule.problemTitle': 'Problems with your schedule?',
    'schedule.problemText': 'If you detect inconsistencies in classrooms or subjects, report it immediately to administration for correction.',
    'schedule.report': 'Report',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.deleting': 'Deleting...',
  },
};

const getInitialLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') {
    return 'es';
  }

  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return storedLanguage === 'en' || storedLanguage === 'es' ? storedLanguage : 'es';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<LanguageCode>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((currentLanguage) => (currentLanguage === 'es' ? 'en' : 'es'));
  }, []);

  const t = useCallback((key: TranslationKey, values?: Record<string, string | number>) => {
    let text = translations[language][key] ?? translations.es[key] ?? key;

    if (values) {
      Object.entries(values).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
      });
    }

    return text;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isEnglish: language === 'en',
      toggleLanguage,
      t,
    }),
    [language, t, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
};
