import {apiService} from "@/api/api.ts";
import {Quries} from "@/api/quries.ts";

export interface UploadResponse {
  imageUrls: string[];
  message: string;
}

export const uploadApi = {
  // Загрузка изображений на сервер (который потом загрузит в AWS S3)
  uploadImages: async (images: File[]): Promise<UploadResponse> => {
    const formData = new FormData();
    
    // Добавляем каждое изображение в FormData
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      // Отправляем POST запрос с изображениями
      const response = await apiService.postFormData(Quries.API.UPLOAD.IMAGES, formData);
      return response;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  // Удаление изображения из AWS S3
  deleteImage: async (imageUrl: string): Promise<void> => {
    try {
      await apiService.delete(Quries.API.UPLOAD.DELETE_IMAGE, { imageUrl });
    } catch (error) {
      console.error('Delete image error:', error);
      throw error;
    }
  }
};