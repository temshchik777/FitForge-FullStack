import { apiService } from './api';
import { Post, CreatePostRequest, PostsResponse, PostFilters } from '../types/post';
import { Quries } from './quries';

// Базовый URL бэкенда: из переменной окружения, иначе dev-локалка
const API_BASE = (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:4000';

export const postApi = {
    createPost: async (data: CreatePostRequest): Promise<{ message: string; post: Post }> => {
        const formData = new FormData();
        formData.append('content', data.content);

        // Додаємо зображення
        if (data.images && data.images.length > 0) {
            data.images.forEach((image) => {
                formData.append('images', image);
            });
        }

        const response = await apiService.postFormData(Quries.API.POSTS.CREATE, formData);

        // Нормалізуємо URL-адреси зображень у відповіді
        if (response.post && response.post.imageUrls) {
            response.post.imageUrls = response.post.imageUrls.map((url: string) => {
                if (url.startsWith('/')) {
                    return `${API_BASE}${url}`;
                }
                return url;
            });
        }

        return response;
    },

    getPosts: async (filters: PostFilters = {}): Promise<PostsResponse> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            // Бекенд очікує поле "user", на фронті використовується "userId"
            const paramKey = key === 'userId' ? 'user' : key;
            params.append(paramKey, String(value));
        });

        // Переклад limit/offset у perPage/startPage, якщо передані у фільтрах
        if ((filters as any).limit !== undefined && !params.has('perPage')) {
            params.append('perPage', String((filters as any).limit));
        }
        if ((filters as any).offset !== undefined && !params.has('startPage')) {
            const limit = Number((filters as any).limit) || 10;
            const offset = Number((filters as any).offset) || 0;
            const startPage = Math.floor(offset / limit) + 1;
            params.append('startPage', String(startPage));
        }

        // Щоб бачити більше постів одразу
        if (!params.has('perPage')) {
            params.append('perPage', '100');
        }
        if (!params.has('startPage')) {
            params.append('startPage', '1');
        }

        // Явно задаємо сортування: нові пости зверху
        if (!params.has('sort')) {
            params.append('sort', '-date');
        }

        const queryString = params.toString();
        const url = queryString ? `${Quries.API.POSTS.GET_ALL}?${queryString}` : Quries.API.POSTS.GET_ALL;
        const response = await apiService.get(url);

        if (response.posts) {
            response.posts = response.posts.map((post: Post) => ({
                ...post,
                imageUrls: post.imageUrls ? post.imageUrls.map((url: string) => {
                    if (url.startsWith('/')) {
                        return `${API_BASE}${url}`;
                    }
                    return url;
                }) : []
            }));
        }

        return response;
    },

    // Отримання поста за ID
    getPostById: async (id: string): Promise<Post> => {
        const response = await apiService.get(Quries.API.POSTS.GET_BY_ID(id));

        // Виправляємо URL зображень
        if (response.imageUrls) {
            response.imageUrls = response.imageUrls.map((url: string) => {
                if (url.startsWith('/')) {
                    return `${API_BASE}${url}`;
                }
                return url;
            });
        }

        return response;
    },

    // Оновлення поста
    updatePost: async (id: string, data: Partial<Post>): Promise<Post> => {
        const response = await apiService.put(Quries.API.POSTS.UPDATE(id), data);
        return response;
    },

    // Лайк/дизлайк поста
    toggleLike: async (id: string): Promise<Post> => {
        try {
            const response = await apiService.patch(Quries.API.POSTS.UPDATE_LIKES(id));
            return response;
        } catch (error) {
            // Fallback: try PUT
            const response = await apiService.put(Quries.API.POSTS.UPDATE_LIKES(id), {});
            return response;
        }
    },

    // Видалення поста
    deletePost: async (id: string): Promise<{ message: string }> => {
        const response = await apiService.delete(Quries.API.POSTS.DELETE(id));
        return response;
    },
};