import { User } from './post';

export interface Comment {
  _id: string;
  content: string;
  user: User;
  post?: string;
  date: string;
}

export interface CreateCommentRequest {
  post: string;
  content: string;
}
