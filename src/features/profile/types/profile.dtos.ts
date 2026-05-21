export interface ProfileResponseDTO {
    userId: number;
    fullName: string;
    careers: string[];
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
    isOwnProfile: boolean;
    isFollowing: boolean;
}

export interface ProfilePostDTO {
    id: string;
    timeAgo: string;
    content: string;
    likesCount: number;
    commentsCount: number;
}