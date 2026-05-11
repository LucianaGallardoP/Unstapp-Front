export interface SearchUserDTO {
  id?: number;
  userId?: number;
  fullName?: string;
  userName?: string;
  avatarUrl?: string | null;
  role?: string;
}

export interface SearchPostDTO {
  id?: number;
  postId?: number;
  content?: string;
  authorName?: string;
  userName?: string;
  publishedAt?: string;
}

export interface SearchResponseDTO {
  users: SearchUserDTO[];
  posts: SearchPostDTO[];
}