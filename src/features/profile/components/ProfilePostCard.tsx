import { Heart, MessageCircle } from 'lucide-react';
import type { ProfilePostDTO } from '../types/profile.dtos';

interface ProfilePostCardProps {
  post: ProfilePostDTO;
}

export const ProfilePostCard = ({ post }: ProfilePostCardProps) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
      <span className="text-[#0056D2] text-xs font-bold tracking-wide uppercase mb-3 block">
        {post.timeAgo}
      </span>
      
      <p className="text-gray-700 text-[15px] leading-relaxed mb-6">
        {post.content}
      </p>
      
      <div className="flex items-center gap-6 text-gray-400">
        <button className="flex items-center gap-2 hover:text-gray-600 transition-colors">
          <Heart className="w-[18px] h-[18px]" strokeWidth={2.5} />
          <span className="text-sm font-semibold">{post.likesCount}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-gray-600 transition-colors">
          <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2.5} />
          <span className="text-sm font-semibold">{post.commentsCount}</span>
        </button>
      </div>
    </div>
  );
};