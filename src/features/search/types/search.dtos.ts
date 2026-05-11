export interface SearchUserDTO {
  id: number;
  fullName: string;
  avatarUrl?: string;
  role: string;
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