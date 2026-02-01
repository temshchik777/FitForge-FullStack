import { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard/PostCard';
import { apiService } from '@/api/api';
import { Quries } from '@/api/quries';
import { Post } from '@/types/post';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';

const envBase = (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, '') || '';
const isVercel = typeof window !== 'undefined' && /vercel\.app$/.test(window.location.hostname);
const defaultBase = isVercel ? 'https://fitforge-fullstack.onrender.com' : 'http://localhost:4000';
const API_BASE = (!envBase || /localhost/i.test(envBase)) ? defaultBase : envBase;

function getUserIdFromToken(): string | undefined {
  try {
    const raw = localStorage.getItem("token");
    if (!raw) return undefined;
    const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;
    const [, payload] = token.split(".");
    if (!payload) return undefined;
    const decoded = JSON.parse(atob(payload));
    return decoded?.id || decoded?.userId || decoded?.sub;
  } catch {
    return undefined;
  }
}

export default function Saved() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = localStorage.getItem("userId") || getUserIdFromToken();

  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      const data = await apiService.get(Quries.API.USERS.GET_SAVED_POSTS);
      const normalized = data.map((post: any) => ({
        ...post,
        imageUrls: post.imageUrls
          ? post.imageUrls.map((url: string) =>
              url.startsWith('/') ? `${API_BASE}${url}` : url,
            )
          : [],
      }));
      setSavedPosts(normalized);
    } catch (err: any) {
      setError(err.message || "Помилка завантаження");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      await apiService.put(Quries.API.POSTS.UPDATE_LIKES(postId), {});
      fetchSavedPosts(); // Оновлюємо після лайку
    } catch (err) {
      // Error
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await apiService.delete(Quries.API.POSTS.DELETE(postId));
      setSavedPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) {
      // Error
    }
  };

  const handleSaveToggle = (postId: string) => {
    // Видаляємо з локального стану одразу
    setSavedPosts(prev => prev.filter(p => p._id !== postId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Завантаження...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">Помилка: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Збережені пости</h1>

      {savedPosts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center p-12">
            <div className="rounded-full bg-muted p-4">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Немає збережених постів</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 max-w-sm">
              Зберігайте цікаві пости щоб легко повернутися до них пізніше
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onLike={handleLike}
              onDelete={handleDelete}
              isSaved={true}
              onSaveToggle={handleSaveToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
