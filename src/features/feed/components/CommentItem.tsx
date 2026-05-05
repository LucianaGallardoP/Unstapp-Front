import {
  BriefcaseBusiness,
  Coffee,
  GraduationCap,
  UserRound,
} from 'lucide-react';
import type { PostAuthorRole, PostComment } from '../types/post.types';
import { formatRelativeTime } from '../utils/formatRelativeTime';

interface CommentItemProps {
  comment: PostComment;
  currentDate: Date;
}

const roleIconStyles: Record<PostAuthorRole, string> = {
  Administrativo: 'bg-[#E7000B]/10 text-[#E7000B]',
  Docente: 'bg-[#1d8c57]/10 text-[#1d8c57]',
  Bar: 'bg-[#155DFC]/10 text-[#155DFC]',
  Alumno: 'bg-[#FF751F]/10 text-[#FF751F]',
};

const roleIcons = {
  Administrativo: BriefcaseBusiness,
  Docente: GraduationCap,
  Bar: Coffee,
  Alumno: UserRound,
};

export const CommentItem = ({ comment, currentDate }: CommentItemProps) => {
  const CommentAuthorIcon = roleIcons[comment.author.role];

  return (
    <article className="flex gap-2 rounded-xl bg-white px-3 py-2">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${roleIconStyles[comment.author.role]}`}
        aria-label={`Icono de ${comment.author.role}`}
      >
        <CommentAuthorIcon size={15} strokeWidth={2.3} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <h3 className="text-[12px] font-bold leading-4 text-[#1F2937]">
            {comment.author.name}
          </h3>
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
            {formatRelativeTime(comment.publishedAt, currentDate)}
          </time>
        </div>
        <p className="mt-1 text-[12px] leading-5 text-gray-600">
          {comment.content}
        </p>
      </div>
    </article>
  );
};
