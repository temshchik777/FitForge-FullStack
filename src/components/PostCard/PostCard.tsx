import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Pencil, ChevronLeft, ChevronRight, X, Bookmark, UserPlus, UserCheck } from 'lucide-react';
import {
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

import {Post} from "@/types/post.ts";
import { Comment } from '@/types/comment';
import { commentApi } from '@/api/comment';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import EditPostModal from '../PostModal/EditPostModal';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/delete-dialog.tsx";
import { apiService } from '@/api/api';
import { Quries } from '@/api/quries';


interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onUpdate?: (postId: string, data: { content: string }) => Promise<any>;
  isAdmin?: boolean;
  isSaved?: boolean;
  onSaveToggle?: (postId: string) => void;
}

export default function PostCard({ 
  post, 
  currentUserId,
  onLike,
  onDelete,
  onUpdate,
  isAdmin = false,
  isSaved = false,
  onSaveToggle
}: PostCardProps) {
  // const [showAllImages, setShowAllImages] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [saved, setSaved] = useState(isSaved);
  const [savingPost, setSavingPost] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const isAuthor = currentUserId && post.user && String(post.user._id) === String(currentUserId);
  const canEdit = isAuthor && Boolean(onUpdate);
  const canDelete = isAuthor || isAdmin; // Адмін може видаляти будь-які пости
  const hasMenu = canEdit || canDelete;

  // Безпечний користувач для випадків, коли автор поста видалений або не запопулячений
  const userSafe = post.user || ({ firstName: 'Видалений', lastName: 'користувач', avatarUrl: '', _id: '' } as any);
  
  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleSaveToggle = async () => {
    if (!currentUserId) {
      toast.error("Увійдіть щоб зберігати пости");
      return;
    }

    if (savingPost) return; // Запобігаємо дублюванню запитів

    setSavingPost(true);
    try {
      if (saved) {
        await apiService.delete(Quries.API.USERS.UNSAVE_POST(post._id));
        setSaved(false);
        toast.success("Видалено зі збережених");
      } else {
        await apiService.post(Quries.API.USERS.SAVE_POST(post._id), {});
        setSaved(true);
        toast.success("Додано до збережених");
      }
      onSaveToggle?.(post._id);
    } catch (error) {
      toast.error("Помилка збереження");
    } finally {
      setSavingPost(false);
    }
  };


  useEffect(() => {
    setCurrentIndex(0);
  }, [post._id, post.imageUrls?.length]);

  // Закриття модалки по Esc
  useEffect(() => {
    if (!showFullscreenModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowFullscreenModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showFullscreenModal]);

  useEffect(() => {
    if (!currentUserId || !post?.user?._id || currentUserId === String(post.user._id)) return;
    let mounted = true;
    const loadFollowState = async () => {
      try {
        const userData = await apiService.get(Quries.API.USERS.GET_BY_ID(String(post.user._id)));
        const list = userData?.followedBy || [];
        const following = Array.isArray(list) && list.some((u: any) => String(u?._id) === String(currentUserId));
        if (mounted) setIsFollowing(following);
      } catch (err) {
        // Failed to load follow state
      }
    };
    loadFollowState();
    return () => { mounted = false; };
  }, [currentUserId, post?.user?._id]);

  const prevImage = () => {
    const len = post.imageUrls?.length || 1;
    setCurrentIndex((i) => (i - 1 + len) % len);
  };

  const nextImage = () => {
    const len = post.imageUrls?.length || 1;
    setCurrentIndex((i) => (i + 1) % len);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingComments(true);
      try {
        const data = await commentApi.getCommentsByPost(post._id);
        if (mounted) setComments(data);
      } catch (err: any) {
        // Error loading comments
      } finally {
        if (mounted) setLoadingComments(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, [post._id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await commentApi.createComment(post._id, newComment.trim());
      const refreshed = await commentApi.getCommentsByPost(post._id); // тянем нормализованные данные
      setComments(refreshed);
      setNewComment('');
      toast.success('Коментар доданий успішно!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Помилка при додаванні коментаря';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentApi.deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      toast.success('Коментар видалено!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Помилка при видаленні коментаря';
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (showComments && textareaRef.current) {
      // small timeout to ensure element is visible before focusing
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [showComments]);

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      toast.error("Увійдіть, щоб підписуватися");
      return;
    }
    if (!post?.user?._id || currentUserId === String(post.user._id)) return;
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await apiService.delete(Quries.API.USERS.DELETE_FOLLOWER(String(post.user._id)));
        setIsFollowing(false);
        toast.success("Ви відписалися");
      } else {
        await apiService.put(Quries.API.USERS.ADD_FOLLOWER(String(post.user._id)), {});
        setIsFollowing(true);
        toast.success("Підписка оформлена");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Помилка підписки";
      toast.error(msg);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center space-y-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={userSafe.avatarUrl} />
          <AvatarFallback>
            {(userSafe.firstName?.[0] || 'В')}{(userSafe.lastName?.[0] || 'к')}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <p className="font-medium">
            {userSafe.firstName} {userSafe.lastName}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString()}
          </p>
        </div>
        {currentUserId && post?.user?._id && currentUserId !== String(post.user._id) && (
          <Button
            variant={isFollowing ? "secondary" : "outline"}
            size="sm"
            className="mr-2"
            onClick={handleFollowToggle}
            disabled={followLoading}
          >
            {isFollowing ? <UserCheck className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            {isFollowing ? "Відписатися" : "Підписатися"}
          </Button>
        )}
        
        {hasMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {canEdit && (
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Редагувати
                </DropdownMenuItem>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Видалити пост
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити пост?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Цю дію неможна буде скасувати. Пост буде назавжди видалено.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(post._id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Видалити
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="mb-4">{post.content}</p>
        
        {post.imageUrls && post.imageUrls.length > 0 && (
          <>
            {post.imageUrls.length === 1 ? (
              <div className="mb-4 flex justify-center">
                <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer max-w-lg" 
                     onClick={() => setShowFullscreenModal(true)}>
                  <img
                    src={post.imageUrls[0]}
                    alt="Post image"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              </div>
            ) : post.imageUrls.length === 2 ? (
              <div className="mb-4 flex justify-center">
                <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden max-w-lg">
                  {post.imageUrls.map((url, idx) => (
                    <div key={idx} className="aspect-square bg-gray-100 group cursor-pointer" 
                         onClick={() => { setCurrentIndex(idx); setShowFullscreenModal(true); }}>
                      <img
                        src={url}
                        alt={`Post image ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
             
              <div className="flex flex-col items-center">
                <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer max-w-lg mb-3">
                  <img
                    src={post.imageUrls[currentIndex]}
                    alt={`Post image ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  
                  {/* Стрілки каруселі */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={prevImage}
                    className="absolute top-1/2 -translate-y-1/2 left-2 rounded-full bg-black/30 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={nextImage}
                    className="absolute top-1/2 -translate-y-1/2 right-2 rounded-full bg-black/30 text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Счетчик */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {currentIndex + 1}/{post.imageUrls.length}
                  </div>
                </div>

                {/* Індикатори-точки внизу */}
                <div className="flex gap-1 justify-center flex-wrap">
                  {post.imageUrls.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex
                          ? 'bg-gray-800 w-6'
                          : 'bg-gray-400 hover:bg-gray-600'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Модальне вікно для повноекранного перегляду */}
            {showFullscreenModal && (
              <div
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                onClick={() => setShowFullscreenModal(false)}
              >
                <div
                  className="relative w-full max-w-2xl max-h-screen"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Основне зображення */}
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                    {/* Кнопка закриття всередині контейнера */}
                    <button
                      onClick={() => setShowFullscreenModal(false)}
                      className="absolute top-3 right-3 text-white hover:text-gray-300 z-50"
                      aria-label="Закрити"
                    >
                      <X className="h-8 w-8" />
                    </button>

                    <img
                      src={post.imageUrls[currentIndex]}
                      alt={`Full screen image ${currentIndex + 1}`}
                      className="w-full h-auto max-h-screen object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />

                    {/* Стрілки для навігації */}
                    {post.imageUrls.length > 1 && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={prevImage}
                          className="absolute top-1/2 -translate-y-1/2 left-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                        >
                          <ChevronLeft className="h-8 w-8" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={nextImage}
                          className="absolute top-1/2 -translate-y-1/2 right-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                        >
                          <ChevronRight className="h-8 w-8" />
                        </Button>

                        {/* Індикатори внизу */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {post.imageUrls.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentIndex(idx)}
                              className={`h-2 rounded-full transition-all ${
                                idx === currentIndex
                                  ? 'bg-white w-6'
                                  : 'bg-white/50 hover:bg-white/75 w-2'
                              }`}
                              aria-label={`Go to image ${idx + 1}`}
                            />
                          ))}
                        </div>

                        {/* Счетчик */}
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
                          {currentIndex + 1} / {post.imageUrls.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post._id)}
            className={isLiked ? 'text-red-500' : ''}
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {post.likes.length}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowComments((s) => !s);
              // focus will be handled in effect when opened
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Коментарі {comments.length > 0 ? `(${comments.length})` : ''}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveToggle}
            className={saved ? 'text-blue-500' : ''}
          >
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
      {/* Render comments area when toggled */}
      {showComments && (
        <CardContent className="pt-0">
          <div className="px-2">
            <div className="mb-4">
              <div className="space-y-3">
                {loadingComments ? (
                  <p className="text-sm text-muted-foreground">Завантаження коментарів...</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ще немає коментарів</p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="flex items-start gap-3 group">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={c.user?.avatarUrl} />
                        <AvatarFallback>
                          {c.user?.firstName?.[0]}{c.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{c.user.firstName} {c.user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{c.content}</p>
                      </div>
                      {currentUserId === c.user._id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(c._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {currentUserId ? (
              <div className="mt-3">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  rows={3}
                  placeholder="Напишіть коментар..."
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleAddComment} disabled={submitting || !newComment.trim()}>
                    {submitting ? 'Надсилання...' : 'Надіслати'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Будь ласка, увійдіть, щоб додати коментар.</p>
            )}
          </div>
        </CardContent>
      )}
      
      {onUpdate && (
        <EditPostModal 
          open={editOpen}
          onOpenChange={setEditOpen}
          post={post}
          onUpdate={onUpdate}
        />
      )}
    </Card>
  );
}