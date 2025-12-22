export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

export interface Post {
  _id: string;
  content: string;
  imageUrls: string[]; // Это будут URL из AWS S3
  user: User;
  likes: string[];
  date: string;
}

export interface CreatePostRequest {
  content: string;
  images?: File[]; // Для загрузки через FormData
  imageUrls?: string[]; // Для создания поста с уже загруженными изображениями
}

export interface PostsResponse {
  posts: Post[];
  postsQuantity: number;
}

export interface PostFilters {
  userId?: string;
  limit?: number;
  offset?: number;
}