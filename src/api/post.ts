import { apiService } from './api';
import { Post, CreatePostRequest, PostsResponse, PostFilters } from '../types/post';
import { Quries } from './quries';

const BASE_URL = 'http://localhost:4000'; // Добавляем базовый URL

export const postApi = {
    createPost: async (data: CreatePostRequest): Promise<{ message: string; post: Post }> => {
        const formData = new FormData();
        formData.append('content', data.content);

        // Добавляем изображения
        if (data.images && data.images.length > 0) {
            console.log(`📤 Додавання ${data.images.length} зображень до FormData`);
            data.images.forEach((image, index) => {
                console.log(`📸 Зображення ${index + 1}: ${image.name} (${image.size} bytes)`);
                formData.append('images', image);
            });
        } else {
            console.log('⚠️ Зображень немає');
        }

        console.log('🚀 Відправка FormData на бэкенд...');
        const response = await apiService.postFormData(Quries.API.POSTS.CREATE, formData);

        console.log('✅ Відповідь від бэкенду:', response);
        
        if (response.post) {
            console.log('📋 Деталі посту:', {
                _id: response.post._id,
                content: response.post.content,
                imageUrls: response.post.imageUrls,
                imageCount: response.post.imageUrls ? response.post.imageUrls.length : 0
            });
        }
        
        if (response.post && response.post.imageUrls && response.post.imageUrls.length > 0) {
            response.post.imageUrls = response.post.imageUrls.map((url: string) => {
                console.log(`🔗 Обработка URL: ${url}`);
                if (url.startsWith('http://') || url.startsWith('https://')) {
                    return url; // Уже полный URL
                } else if (url.startsWith('/')) {
                    return `${BASE_URL}${url}`;
                } else {
                    return `${BASE_URL}/${url}`;
                }
            });
            console.log('✅ Обработанные URLs:', response.post.imageUrls);
        }

        return response;
    },

    getPosts: async (filters: PostFilters = {}): Promise<PostsResponse> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });

        const queryString = params.toString();
        const url = queryString ? `${Quries.API.POSTS.GET_ALL}?${queryString}` : Quries.API.POSTS.GET_ALL;
        const response = await apiService.get(url);

        if (response.posts) {
            response.posts = response.posts.map((post: Post) => ({
                ...post,
                imageUrls: post.imageUrls ? post.imageUrls.map((url: string) => {
                    if (url.startsWith('/')) {
                        return `${BASE_URL}${url}`;
                    }
                    return url;
                }) : []
            }));
        }

        return response;
    },

    // Получение поста по ID
    getPostById: async (id: string): Promise<Post> => {
        const response = await apiService.get(Quries.API.POSTS.GET_BY_ID(id));

        // Исправляем URL изображений
        if (response.imageUrls) {
            response.imageUrls = response.imageUrls.map((url: string) => {
                if (url.startsWith('/')) {
                    return `${BASE_URL}${url}`;
                }
                return url;
            });
        }

        return response;
    },

    // Обновление поста
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
            console.log('Patch failed, trying PUT...');
            const response = await apiService.put(Quries.API.POSTS.UPDATE_LIKES(id), {});
            return response;
        }
    },

    // Удаление поста
    deletePost: async (id: string): Promise<{ message: string }> => {
        const response = await apiService.delete(Quries.API.POSTS.DELETE(id));
        return response;
    },
};