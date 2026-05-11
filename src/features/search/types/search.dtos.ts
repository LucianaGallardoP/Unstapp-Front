export interface SearchUserDTO {
  id?: number;
  userId?: number;
  fullName?: string;
  userName?: string;
  name?: string;
  username?: string;
  UserName?: string;
  FullName?: string;
  avatarUrl?: string | null;
  avatar?: string | null;
  profilePicture?: string | null;
  role?: string;
}

export interface SearchPostDTO {
  id?: number;
  postId?: number;
  content?: string;
  authorName?: string;
  userName?: string;
  author?: { userName?: string; name?: string };
  user?: { userName?: string; name?: string };
  publishedAt?: string;
}

export interface SearchResponseDTO {
  users: SearchUserDTO[];
  posts: SearchPostDTO[];
}