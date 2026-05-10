import { useEffect, useState } from 'react';
import {
  Bell,
  Heart,
  Megaphone,
  MessageCircle,
  Moon,
  Sun,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatRelativeTime } from '../../features/feed/utils/formatRelativeTime';
import { GlobalSearch } from '../../features/search';
import { useNotifications, type NotificationType } from '../../store/notificationsContext';

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
  followedPost: UserRound,
  institutional: Megaphone,
};

export const TopBar = ({ simple = false }: TopBarProps) => {
  const [isMoonIcon, setIsMoonIcon] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    showUnreadIndicator,
    hideUnreadIndicator,
    markAllAsRead,
    removeNotification,
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
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 h-12 border-b border-gray-100 bg-white px-3 md:h-14">
      <div className="mx-auto flex h-full w-full max-w-[430px] items-center justify-between sm:max-w-[560px] md:max-w-2xl lg:max-w-3xl">
        <div className="flex flex-1 items-center justify-start">
          {!simple && <GlobalSearch />}
        </div>

        {simple ? (
          <div className="flex flex-1 justify-center">
            <h1 className="text-[14px] font-black text-[#1E4E9D] md:text-[15px]">
              Unstapp
            </h1>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/feed')}
            className="flex flex-1 cursor-pointer justify-center border-none bg-white"
          >
            <h1 className="text-[14px] font-black text-[#1E4E9D] md:text-[15px]">
              Unstapp
            </h1>
          </button>
        )}

        <div className="flex flex-1 justify-end gap-1">
          <button
            type="button"
            onClick={() => setIsMoonIcon(!isMoonIcon)}
            className="flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
            aria-label="Cambiar tema"
          >
            {isMoonIcon ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {!simple && (
            <div className="relative">
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center text-[#526174] transition-colors hover:text-[#1F2937]"
                aria-label="Notificaciones"
                onClick={openNotifications}
                aria-expanded={isNotificationsOpen}
              >
                <Bell size={16} />
                {showUnreadIndicator && (
                  <span
                    className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full border border-white bg-[#E7000B]"
                    aria-label="Hay notificaciones nuevas"
                  />
                )}
              </button>

              {isNotificationsOpen && (
                <section
                  className="fixed right-3 top-14 z-50 w-[calc(100vw-24px)] max-w-[315px] rounded-b-[14px] rounded-t-[22px] bg-white px-3 pb-3 pt-4 shadow-[0_14px_34px_rgba(15,23,42,0.28)] sm:right-[calc((100vw-560px)/2+12px)] sm:max-w-[390px] sm:px-4 md:right-[calc((100vw-672px)/2+12px)] md:top-16 md:max-w-[460px] lg:right-[calc((100vw-768px)/2+12px)]"
                  aria-label="Notificaciones"
                >
                  <header className="flex items-start justify-between gap-3">
                    <h2 className="text-[16px] font-black uppercase leading-5 text-black md:text-[18px]">
                      Notificaciones
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="-mr-1 -mt-2 flex h-8 w-8 items-center justify-center text-black transition-colors hover:text-[#1E4E9D]"
                      aria-label="Cerrar notificaciones"
                    >
                      <X size={18} strokeWidth={1.7} />
                    </button>
                  </header>

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      disabled={unreadCount === 0}
                      className="text-[11px] font-black uppercase text-[#1E4E9D] transition-colors hover:text-[#155DFC] disabled:cursor-not-allowed disabled:text-gray-300"
                    >
                      Marcar todas como leidas
                    </button>
                  </div>

                  <div className="mt-2 flex max-h-[250px] flex-col gap-2 overflow-y-auto pr-1 md:max-h-[340px]">
                    {notifications.map((notification) => {
                      const NotificationIcon =
                        notification.type === 'interaction' &&
                        notification.action.includes('me gusta')
                          ? Heart
                          : notificationIcons[notification.type];

                      return (
                        <article
                          key={notification.id}
                          className={`flex min-h-[58px] items-start justify-between gap-3 rounded-[8px] border px-3 py-2 shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${
                            notification.read
                              ? 'border-transparent bg-[#EFF6FF]/55'
                              : notificationTypeStyles[notification.type]
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${notificationIconStyles[notification.type]}`}
                            aria-hidden="true"
                          >
                            <NotificationIcon size={17} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-[12px] leading-4 text-[#1F2937] md:text-[13px]">
                              <span className="font-black">{notification.actor}</span>
                              <span className="font-semibold"> {notification.action}</span>
                            </h3>
                            <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-4 text-[#526174] md:text-[12px]">
                              {notification.target}
                            </p>
                            <time
                              dateTime={notification.createdAt}
                              className="mt-1 block text-[10px] font-black uppercase leading-3 text-[#808080]"
                            >
                              {formatRelativeTime(notification.createdAt, currentDate)}
                            </time>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeNotification(notification.id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#808080] transition-colors hover:bg-[#E7000B]/10 hover:text-[#E7000B]"
                            aria-label="Eliminar notificacion"
                          >
                            <Trash2 size={15} />
                          </button>
                        </article>
                      );
                    })}

                    {notifications.length === 0 && (
                      <p className="rounded-[8px] bg-[#EFF6FF] px-3 py-5 text-center text-[12px] font-semibold text-[#808080]">
                        No hay notificaciones pendientes.
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
