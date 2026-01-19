import PostCard from "@/components/PostCard/PostCard";
import CreatePostModal from "@/components/PostModal/CreatePostModal.tsx";
import { usePosts } from "@/hooks/usePosts";
import { getIsAdminFromToken } from "@/utils/tokenUtils";

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

export default function Home() {
  const {
    posts,
    loading,
    error,
    toggleLike,
    updatePost,
    deletePost,
    refetch,
  } = usePosts(); // без фильтров = все пользователи

  const currentUserId = localStorage.getItem("userId") || getUserIdFromToken();
  const isAdmin = getIsAdminFromToken();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Лента</h1>
        <CreatePostModal onPostCreated={refetch} />
      </div>

      {loading && <p className="py-6 text-center text-sm text-muted-foreground">Завантаження постів...</p>}
      {error && <p className="py-6 text-center text-sm text-red-500">Помилка: {error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">Поки що постів немає</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={currentUserId}
              onLike={toggleLike}
              onDelete={deletePost}
              onUpdate={updatePost}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}