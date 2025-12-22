import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
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
}

export default function PostCard({ 
  post, 
  currentUserId, 
  onLike, 
  onDelete 
}: PostCardProps) {
  const [showAllImages, setShowAllImages] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  
  // Временно показываем кнопку ВСЕМ для тестирования
  const canDelete = true; // currentUserId && (String(post.user._id) === String(currentUserId)); 
  
  // debug logging removed

  const displayImages = showAllImages ? post.imageUrls : post.imageUrls.slice(0, 3);

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
        
        {/* Показываем кнопку ВСЕМ для тестирования */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        <p className="mb-4">{post.content}</p>
        
        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {displayImages.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-48 object-cover rounded"
                  onError={(e) => {
                    console.error('Image loading error:', imageUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ))}
            </div>
            
            {post.imageUrls.length > 3 && !showAllImages && (
              <Button
                variant="ghost"
                onClick={() => setShowAllImages(true)}
                className="mt-2 text-sm"
              >
                Show {post.imageUrls.length - 3} more images
              </Button>
            )}
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
                    <div key={c._id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={c.user?.avatarUrl} />
                        <AvatarFallback>
                          {c.user?.firstName?.[0]}{c.user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{c.user.firstName} {c.user.lastName}</p>
                        <p className="text-sm text-muted-foreground">{c.content}</p>
                      </div>
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
    </Card>
  );
}