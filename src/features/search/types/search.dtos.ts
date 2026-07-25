export interface SearchUserDTO {
  id?: number | string;
  userId?: number | string;
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
  roles?: string[];
}

export interface SearchPostDTO {
  id?: number | string;
  postId?: number | string;
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
