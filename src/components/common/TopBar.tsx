import { useEffect, useState } from 'react';
import {
  Bell,
  Globe2,
  Heart,
  Megaphone,
  MessageCircle,
  Moon,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../features/feed/utils/formatRelativeTime';
import { GlobalSearch } from '../../features/search';
import { searchService } from '../../features/search/services/searchService';
import { useNotifications, type NotificationType } from '../../store/notificationsContext';
import { useTheme } from '../../store/themeContext';
import { useLanguage } from '../../store/languageContext';
import { RoleAvatar } from './RoleAvatar';

interface TopBarProps {
  simple?: boolean;
}

const notificationTypeStyles: Record<NotificationType, string> = {
  interaction: 'border-[#155DFC]/20 bg-[#EFF6FF]',
  followedPost: 'border-[#1d8c57]/20 bg-[#1d8c57]/10',
  institutional: 'border-[#E7000B]/25 bg-[#E7000B]/10',
};

const notificationIconStyles: Record<NotificationType, string> = {
  interaction: 'bg-[#155DFC]/10 text-[#155DFC]',
  followedPost: 'bg-[#1d8c57]/10 text-[#1d8c57]',
  institutional: 'bg-[#E7000B]/10 text-[#E7000B]',
};

const notificationIcons = {
  interaction: MessageCircle,
  followedPost: Megaphone,
  institutional: Megaphone,
};

const normalizeSearchText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const resolveProfileIdByActorName = async (actorName: string) => {
  const cleanName = actorName.trim();

  if (!cleanName || cleanName === 'Unstapp') {
    return undefined;
  }

  try {
    const results = await searchService.globalSearch(cleanName);
    const normalizedActorName = normalizeSearchText(cleanName);
    const matchedUser = results.users.find((user) => {
      const displayName = user.fullName || user.userName || user.name || user.username || user.FullName || user.UserName || '';

      return normalizeSearchText(displayName) === normalizedActorName;
    }) ?? results.users[0];

    return matchedUser?.id ?? matchedUser?.userId;
  } catch {
    return undefined;
  }
};

const translateNotificationText = (value: string, language: 'es' | 'en') => {
  if (language === 'es') {
    return value;
  }

  return value
    .replace(/comentó en tu post/gi, 'commented on your post')
    .replace(/comento en tu post/gi, 'commented on your post')
    .replace(/comentó tu post/gi, 'commented on your post')
    .replace(/comento tu post/gi, 'commented on your post')
    .replace(/dio me gusta a tu post/gi, 'liked your post')
    .replace(/le dio me gusta a tu post/gi, 'liked your post')
    .replace(/empezó a seguirte/gi, 'started following you')
    .replace(/empezo a seguirte/gi, 'started following you')
    .replace(/comenzó a seguirte/gi, 'started following you')
    .replace(/comenzo a seguirte/gi, 'started following you')
    .replace(/publicó un nuevo post/gi, 'published a new post')
    .replace(/publico un nuevo post/gi, 'published a new post')
    .replace(/realizó una nueva publicación/gi, 'published a new post')
    .replace(/realizo una nueva publicacion/gi, 'published a new post')
    .replace(/tiene una novedad/gi, 'has an update');
};

export const TopBar = ({ simple = false }: TopBarProps) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const navigate = useNavigate();
  const {
    notifications,
    showUnreadIndicator,
    loading: notificationsLoading,
    hideUnreadIndicator,
    markNotificationAsRead,
    markAllAsRead,
    removeNotification,
    removeAllNotifications,
  } = useNotifications();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const openNotifications = () => {
    setIsNotificationsOpen(true);
    hideUnreadIndicator();
    markAllAsRead();
  };
  const handleNotificationClick = async (notification: { id: number | string; actor: string; action: string; target: string; type: NotificationType; postId?: number | string; commentId?: number | string; actorId?: number | string; profileId?: number | string }) => {
    await markNotificationAsRead(notification.id);
    setIsNotificationsOpen(false);

    const notificationText = `${notification.action} ${notification.target} ${notification.type}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const notificationContentText = `${notification.action} ${notification.target}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const isPostNotification =
      notificationText.includes('post') ||
      notificationText.includes('public') ||
      notificationText.includes('me gusta') ||
      notificationText.includes('like') ||
      notificationText.includes('coment') ||
      notificationText.includes('comment') ||
      notificationText.includes('respuesta');
    const isFollowRequest =
      !isPostNotification &&
      (
        notificationContentText.includes('segu') ||
        notificationContentText.includes('follow') ||
        notificationContentText.includes('follower')
      );
    const isCommentNotification =
      notificationText.includes('coment') ||
      notificationText.includes('comment') ||
      notificationText.includes('respuesta');
    let profileId = notification.profileId ?? notification.actorId;

    if (isFollowRequest) {
      profileId = profileId ?? await resolveProfileIdByActorName(notification.actor);

      if (profileId) {
        navigate(`/perfil/${profileId}`);
      }

      return;
    }

    if (isCommentNotification && notification.postId) {
      const params = new URLSearchParams({
        postId: String(notification.postId),
        comments: 'open',
      });

      if (notification.commentId) {
        params.set('commentId', String(notification.commentId));
      }

      navigate(`/feed?${params.toString()}`);
      return;
    }

    if (notification.postId) {
      navigate(`/feed?postId=${notification.postId}`);
      return;
    }

    if (isPostNotification) {
      navigate('/feed');
      return;
    }

    if (profileId) {
      navigate(`/perfil/${profileId}`);
      return;
    }

    if (notification.type === 'followedPost') {
      navigate('/feed');
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 h-14 border-b border-gray-100 bg-white px-3 md:h-16">
      <div className="mx-auto flex h-full w-full max-w-[430px] items-center justify-between sm:max-w-[560px] md:max-w-2xl lg:max-w-3xl">
        <div className="flex flex-1 items-center justify-start">
          {!simple && <GlobalSearch />}
        </div>

        {simple ? (
          <div className="flex flex-1 justify-center">
            <h1 className="text-[16px] font-black text-[#1E4E9D] md:text-[18px]">
              Unstapp
            </h1>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/feed')}
            className="flex flex-1 cursor-pointer justify-center border-none bg-white"
          >
            <h1 className="text-[16px] font-black text-[#1E4E9D] md:text-[18px]">
              Unstapp
            </h1>
          </button>
        )}

        <div className="flex flex-1 justify-end gap-1">
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2 text-[#526174] transition-colors hover:bg-[#EFF6FF] hover:text-[#1F2937]"
            aria-label={language === 'es' ? t('language.toggleToEnglish') : t('language.toggleToSpanish')}
            title={language === 'es' ? t('language.toggleToEnglish') : t('language.toggleToSpanish')}
          >
            <Globe2 size={19} />
            <span className="text-[10px] font-black uppercase">
              {language === 'es' ? t('language.es') : t('language.en')}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-full px-2 text-[#526174] transition-colors hover:bg-[#EFF6FF] hover:text-[#1F2937]"
            aria-label={isDarkMode ? t('topbar.toLight') : t('topbar.toDark')}
            title={isDarkMode ? t('topbar.darkSelected') : t('topbar.lightSelected')}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="hidden text-[10px] font-black uppercase sm:inline">
              {isDarkMode ? t('topbar.darkSelected') : t('topbar.lightSelected')}
            </span>
          </button>

          {!simple && (
            <div className="relative">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
                aria-label="Notificaciones"
                onClick={openNotifications}
                aria-expanded={isNotificationsOpen}
              >
                <Bell size={20} />
                {showUnreadIndicator && (
                  <span
                    className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-[#E7000B]"
                    aria-label={t('topbar.unreadNotifications')}
                  />
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setIsNotificationsOpen(false)}
                >
                  <section
                    className="notifications-panel fixed right-2 top-14 w-[calc(100vw-16px)] max-w-[360px] rounded-b-[14px] rounded-t-[22px] bg-white px-3 pb-3 pt-4 shadow-[0_14px_34px_rgba(15,23,42,0.28)] sm:right-[calc((100vw-560px)/2+12px)] sm:max-w-[390px] sm:px-4 md:right-[calc((100vw-672px)/2+12px)] md:top-16 md:max-w-[460px] lg:right-[calc((100vw-768px)/2+12px)]"
                    aria-label={t('topbar.notifications')}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <header className="flex items-start justify-between gap-3">
                      <h2 className="text-[16px] font-black uppercase leading-5 text-black md:text-[18px]">
                        {t('topbar.notifications')}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="-mr-1 -mt-2 flex h-8 w-8 items-center justify-center text-black transition-colors hover:text-[#1E4E9D]"
                        aria-label={t('topbar.closeNotifications')}
                      >
                        <X size={18} strokeWidth={1.7} />
                      </button>
                    </header>

                    <div className="mt-2 flex justify-end">
                      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                        <button
                          type="button"
                          onClick={removeAllNotifications}
                          disabled={notifications.length === 0}
                          className="text-[11px] font-black uppercase text-[#E7000B] transition-colors hover:text-[#b80009] disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          {t('topbar.deleteAll')}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 flex max-h-[min(340px,calc(100vh-120px))] flex-col gap-2 overflow-y-auto pr-1 md:max-h-[340px]">
                      {notificationsLoading && (
                        <p className="rounded-[8px] bg-[#EFF6FF] px-3 py-5 text-center text-[12px] font-semibold text-[#808080]">
                          {t('topbar.loadingNotifications')}
                        </p>
                      )}

                      {notifications.map((notification) => {
                        const translatedAction = translateNotificationText(notification.action, language);
                        const translatedTarget = translateNotificationText(notification.target, language);
                        const NotificationIcon =
                          notification.type === 'interaction' &&
                          notification.action.includes('me gusta')
                            ? Heart
                            : notificationIcons[notification.type];

                        return (
                          <article
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`notification-card flex min-h-[58px] items-start justify-between gap-3 rounded-[8px] border px-3 py-2 shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${
                              notification.read
                                ? 'border-transparent bg-[#EFF6FF]/55'
                                : notificationTypeStyles[notification.type]
                            } ${notification.postId ? 'cursor-pointer' : ''}`}
                          >
                          {notification.avatarUrl ? (
                            <RoleAvatar
                              avatarUrl={notification.avatarUrl}
                              name={notification.actor}
                              role={notification.actorRole}
                              className="mt-0.5 h-9 w-9"
                              iconClassName="h-5 w-5"
                            />
                          ) : notification.type !== 'institutional' ? (
                            <RoleAvatar
                              name={notification.actor}
                              role={notification.actorRole}
                              className="mt-0.5 h-9 w-9"
                              iconClassName="h-5 w-5"
                            />
                          ) : (
                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-black ${notificationIconStyles[notification.type]}`}
                              aria-label={`Avatar de ${notification.actor}`}
                            >
                              <NotificationIcon size={17} />
                            </div>
                          )}

                            <div className="min-w-0 flex-1">
                              <h3 className="text-[12px] leading-4 text-[#1F2937] md:text-[13px]">
                                <span className="font-black">{notification.actor}</span>
                                <span className="font-semibold"> {translatedAction}</span>
                              </h3>
                              <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-4 text-[#526174] md:text-[12px]">
                                {translatedTarget}
                              </p>
                              <time
                                dateTime={notification.createdAt}
                                className="mt-1 block text-[10px] font-black uppercase leading-3 text-[#808080]"
                              >
                                {formatRelativeTime(notification.createdAt, currentDate, language)}
                              </time>
                            </div>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#808080] transition-colors hover:bg-[#E7000B]/10 hover:text-[#E7000B]"
                              aria-label="Eliminar notificación"
                            >
                              <Trash2 size={15} />
                            </button>
                          </article>
                        );
                      })}

                      {!notificationsLoading && notifications.length === 0 && (
                        <p className="rounded-[8px] bg-[#EFF6FF] px-3 py-5 text-center text-[12px] font-semibold text-[#808080]">
                          {t('topbar.emptyNotifications')}
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
