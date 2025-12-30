import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
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


interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onUpdate?: (postId: string, data: { content: string }) => Promise<any>;
}

export default function PostCard({ 
  post, 
  currentUserId, 
  onLike, 
  onDelete,
  onUpdate
}: PostCardProps) {
  // const [showAllImages, setShowAllImages] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const isAuthor = currentUserId && String(post.user._id) === String(currentUserId);
  const canEdit = isAuthor && Boolean(onUpdate);
  const canDelete = isAuthor;
  const hasMenu = canEdit || canDelete;
  // debug logging removed

  useEffect(() => {
    setCurrentIndex(0);
  }, [post._id, post.imageUrls?.length]);

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
        console.error('Ошибка загрузки комментариев:', err);
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
      const created = await commentApi.createComment(post._id, newComment.trim());
      setComments(prev => [created, ...prev]);
      setNewComment('');
      toast.success('Коментар доданий успішно!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Помилка при додаванні коментаря';
      toast.error(msg);
      console.error('Add comment error:', err);
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
      console.error('Delete comment error:', err);
    }
  };

  useEffect(() => {
    if (showComments && textareaRef.current) {
      // small timeout to ensure element is visible before focusing
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [showComments]);

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center space-y-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user.avatarUrl} />
          <AvatarFallback>
            {post.user.firstName[0]}{post.user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 flex-1">
          <p className="font-medium">
            {post.user.firstName} {post.user.lastName}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(post.date).toLocaleDateString()}
          </p>
        </div>
        
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
          <div className="mb-4">
            <div className="relative flex justify-center">
              <img
                src={post.imageUrls[currentIndex]}
                alt={`Post image ${currentIndex + 1}`}
                className="w-full max-w-md aspect-square object-cover rounded"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />

              {post.imageUrls.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={prevImage}
                    className="absolute top-1/2 -translate-y-1/2 left-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={nextImage}
                    className="absolute top-1/2 -translate-y-1/2 right-2 rounded-full bg-black/30 text-white hover:bg-black/50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            <div className="mt-2 text-xs text-muted-foreground text-center">
              {currentIndex + 1} / {post.imageUrls.length}
            </div>
          </div>
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