import type { Post } from '../../feed/types/post.types';

export interface ProfileResponseDTO {
    userId: number;
    fullName: string;
    careers: string[];
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    isOwnProfile: boolean;
    isFollowing: boolean;
    // Agregamos la lista de publicaciones reales que devuelve el endpoint
    posts?: Post[];
}

export interface ProfileStatsDTO {
    posts: string | number;
    followers: string | number;
    following: string | number;
}