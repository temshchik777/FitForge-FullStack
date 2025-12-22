import { useState, useEffect, useCallback } from 'react';
import { postApi } from '../api/post';
import { Post, PostFilters, CreatePostRequest } from '../types/post';
import { toast } from 'react-toastify';

export const usePosts = (filters: PostFilters = {}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await postApi.getPosts(filters);
      // Сортируем посты по дате (новые вверху)
      const sortedPosts = response.posts.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Новые вверху
      });
      setPosts(sortedPosts);
      setTotalCount(response.postsQuantity);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при загрузке постов';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка загрузки постов:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  const createPost = async (data: CreatePostRequest) => {
    setLoading(true);
    try {
      const response = await postApi.createPost(data);
      setPosts(prev => [response.post, ...prev]);
      toast.success('Пост создан успешно');
      return response.post;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при создании поста';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Ошибка создания поста:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const updatedPost = await postApi.toggleLike(postId);
      setPosts(prev => prev.map(post => 
        post._id === postId ? { ...post, ...updatedPost, imageUrls: post.imageUrls } : post
      ));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ошибка при изменении лайка';
      toast.error(errorMessage);
      console.error('Ошибка лайка:', err);
    }
  };

  const updatePost = async (postId: string, data: { content: string }) => {
    try {
      const updatedPost = await postApi.updatePost(postId, data);
      setPosts(prev => prev.map(post => 
        post._id === postId ? { ...post, ...updatedPost, imageUrls: post.imageUrls } : post
      ));
      toast.success('Пост оновлено');
      return updatedPost;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Помилка оновлення';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await postApi.deletePost(postId);
      setPosts(prev => prev.filter(post => post._id !== postId));
      toast.success('Пост видалено успішно');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Помилка при видаленні поста';
      toast.error(errorMessage);
      console.error('Помилка видалення поста:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    totalCount,
    createPost,
    toggleLike,
    updatePost,
    deletePost,
    refetch: fetchPosts,
  };
};