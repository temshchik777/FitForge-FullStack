import { apiService } from './api';
import { Quries } from './quries';

const envBase = (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') || '';
const isVercel = typeof window !== 'undefined' && /vercel\.app$/.test(window.location.hostname);
const defaultBase = isVercel ? 'https://fitforge-fullstack.onrender.com' : 'http://localhost:4000';
const API_BASE = (!envBase || /localhost/i.test(envBase)) ? defaultBase : envBase;

export const commentApi = {
  getCommentsByPost: async (postId: string) => {
    const response = await apiService.get(Quries.API.COMMENTS.GET_BY_POST(postId));

    if (Array.isArray(response)) {
      return response.map((comment: any) => ({
        ...comment,
        user: comment.user && comment.user.avatarUrl && comment.user.avatarUrl.startsWith('/')
          ? { ...comment.user, avatarUrl: `${API_BASE}${comment.user.avatarUrl}` }
          : comment.user,
      }));
    }

    return [];
  },

  createComment: async (postId: string, content: string) => {
    const body = { post: postId, content };
    const response = await apiService.post(Quries.API.COMMENTS.CREATE, body);

    if (response && response.user && response.user.avatarUrl && response.user.avatarUrl.startsWith('/')) {
      response.user.avatarUrl = `${API_BASE}${response.user.avatarUrl}`;
    }

    return response;
  },

  deleteComment: async (commentId: string) => {
    return await apiService.delete(Quries.API.COMMENTS.DELETE(commentId));
  }
};

export default commentApi;
