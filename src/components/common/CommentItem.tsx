import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../../features/search/services/searchService';
import type { PostComment } from '../../features/feed/types/post.types';
import { formatRelativeTime } from '../../features/feed/utils/formatRelativeTime';
import { useLanguage } from '../../store/languageContext';
import { RoleAvatar } from './RoleAvatar';

interface CommentItemProps {
  comment: PostComment;
  currentDate: Date;
  onDelete?: (commentId: string | number) => void;
  canDelete?: boolean;
}

const normalizeSearchText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const resolveProfileIdByName = async (name: string) => {
  const cleanName = name.trim();

  if (!cleanName) {
    return undefined;
  }

  try {
    const results = await searchService.globalSearch(cleanName);
    const normalizedName = normalizeSearchText(cleanName);
    const matchedUser = results.users.find((user) => {
      const displayName = user.fullName || user.userName || user.name || user.username || user.FullName || user.UserName || '';

      return normalizeSearchText(displayName) === normalizedName;
    }) ?? results.users[0];

    return matchedUser?.id ?? matchedUser?.userId;
  } catch {
    return undefined;
  }
};
export const CommentItem = ({ comment, currentDate, onDelete, canDelete = false }: CommentItemProps) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const canOpenAuthorProfile = Boolean(comment.author.id || comment.author.name);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = (event: Event) => {
      if (menuRef.current && menuRef.current.contains(event.target as Node)) return;
      setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + window.scrollY,
        left: rect.right - 128 + window.scrollX, // 128px es el ancho w-32
      });
      setIsMenuOpen(true);
    } else {
      setIsMenuOpen(false);
    }
  };

  const handleOpenAuthorProfile = async () => {
    const profileId = comment.author.id ?? await resolveProfileIdByName(comment.author.name);

    if (!profileId) return;

    navigate(`/perfil/${profileId}`);
  };
  return (
    <article className="flex gap-2 rounded-xl bg-white px-3 py-2">
      <button
        type="button"
        onClick={handleOpenAuthorProfile}
        disabled={!canOpenAuthorProfile}
        className="rounded-full disabled:cursor-default"
        aria-label={`Ver perfil de ${comment.author.name}`}
      >
        <RoleAvatar
          avatarUrl={comment.author.avatarUrl}
          name={comment.author.name}
          role={comment.author.role}
          className="h-8 w-8"
          iconClassName="h-5 w-5"
        />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <button
            type="button"
            onClick={handleOpenAuthorProfile}
            disabled={!canOpenAuthorProfile}
            className="text-left text-[12px] font-bold leading-4 text-[#1F2937] transition-colors hover:text-[#155DFC] disabled:cursor-default disabled:hover:text-[#1F2937]"
          >
            {comment.author.name}
          </button>
          <span className="text-[10px] font-semibold leading-4 text-gray-400">
            {comment.author.role}
          </span>
          <span aria-hidden="true" className="text-[10px] text-gray-300">
            &middot;
          </span>
          <time
            dateTime={comment.publishedAt}
            title={new Intl.DateTimeFormat('es-AR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(comment.publishedAt))}
            className="text-[10px] font-semibold leading-4 text-gray-400"
          >
            {formatRelativeTime(comment.publishedAt, currentDate, language)}
          </time>
        </div>
        <p className="mt-1 text-[12px] leading-5 text-gray-600">
          {comment.content}
        </p>
      </div>

      {canDelete && (
        <div className="relative shrink-0">
          <button
            ref={buttonRef}
            type="button"
            onClick={toggleMenu}
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Opciones del comentario"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && menuCoords && createPortal(
            <div
              ref={menuRef}
              className="absolute z-[9999] mt-1 w-32 overflow-hidden rounded-lg bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] ring-1 ring-black/5"
              style={{ top: menuCoords.top, left: menuCoords.left }}
            >
              <button
                type="button"
                onClick={() => {
                  if (onDelete) onDelete(comment.id);
                  setIsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-[#E7000B] transition-colors hover:bg-[#E7000B]/10"
              >
                <Trash2 size={15} />
                <span>{t('common.delete')}</span>
              </button>
            </div>,
            document.body
          )}
        </div>
      )}
    </article>
  );
};
