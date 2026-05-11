export interface SearchUserDTO {
  id?: number;
  userId?: number;
  fullName?: string;
  userName?: string;
  avatarUrl?: string | null;
  role?: string;
}

export interface SearchPostDTO {
  id: number;
  content: string;
  authorName: string;
  publishedAt: string;
}

export interface SearchResponseDTO {
  users: SearchUserDTO[];
  posts: SearchPostDTO[];
}