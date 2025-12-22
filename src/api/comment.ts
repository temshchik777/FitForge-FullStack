import { apiService } from './api';
import { Quries } from './quries';

const BASE_URL = 'http://localhost:4000';

export const commentApi = {
  getCommentsByPost: async (postId: string) => {
    const response = await apiService.get(Quries.API.COMMENTS.GET_BY_POST(postId));

    if (Array.isArray(response)) {
      return response.map((comment: any) => ({
        ...comment,
        user: comment.user && comment.user.avatarUrl && comment.user.avatarUrl.startsWith('/')
          ? { ...comment.user, avatarUrl: `${BASE_URL}${comment.user.avatarUrl}` }
          : comment.user,
      }));
    }

    return [];
  },

  createComment: async (postId: string, content: string) => {
    const body = { post: postId, content };
    const response = await apiService.post(Quries.API.COMMENTS.CREATE, body);

    if (response && response.user && response.user.avatarUrl && response.user.avatarUrl.startsWith('/')) {
      response.user.avatarUrl = `${BASE_URL}${response.user.avatarUrl}`;
    }

    return response;
  }
};

export default commentApi;
