import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import DOMPurify from 'dompurify';
import {
  Heart,
  Share2,
  MessageCircle,
  Clock,
  Pencil,
  Send,
  Trash2,
  Reply,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import SmartImage from '../ui/SmartImage';
import UserAvatar from '../ui/UserAvatar';
import {
  estimateReadingTime,
  formatViDate,
  getBlogDisplayCategory,
  getSmartBlogFallbackCover,
} from '../../utils/blogHelpers';

/**
 * Editorial Blog Detail view featuring a reading progress bar, clean serif prose layout,
 * share/like actions, and fully Vietnamese threaded comments & replies.
 */
function BlogView() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readProgress, setReadProgress] = useState(0);

  const [currentUser, setCurrentUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyToIndex, setReplyToIndex] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const bodyRef = useRef(null);

  useEffect(() => {
    const container = bodyRef.current;
    if (!container) return undefined;

    const replaceBrokenImg = (img) => {
      if (!img || img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = '1';
      const placeholder = document.createElement('div');
      placeholder.className =
        'my-4 rounded-xl border border-dashed border-heritage-border bg-heritage-paper/60 px-4 py-3 text-xs text-heritage-muted text-center';
      placeholder.textContent = img.alt
        ? `Hình ảnh minh họa (${img.alt}) hiện không khả dụng từ máy chủ lưu trữ cũ.`
        : 'Hình ảnh minh họa trong bài viết hiện không khả dụng từ máy chủ lưu trữ cũ.';
      img.replaceWith(placeholder);
    };

    const imgs = Array.from(container.querySelectorAll('img'));
    const cleanups = [];
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        replaceBrokenImg(img);
        return;
      }
      const onErr = () => replaceBrokenImg(img);
      img.addEventListener('error', onErr);
      cleanups.push(() => img.removeEventListener('error', onErr));
    });

    return () => cleanups.forEach((fn) => fn());
  }, [blog?.Body]);

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setReadProgress(0);
      } else {
        setReadProgress(Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    const loadBlog = async () => {
      try {
        const snap = await getDoc(doc(db, 'blogs', id));
        if (!active) return;
        if (snap.exists()) {
          const data = snap.data();
          setBlog(data);
          setLikes(data.likes || 0);
          setComments(Array.isArray(data.comments) ? data.comments : []);
          if (auth.currentUser && data.likedBy?.includes(auth.currentUser.uid)) {
            setIsLiked(true);
          }
        }
      } catch (err) {
        console.error('Error loading blog detail:', err);
        toast.error('Không thể tải nội dung bài viết.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadBlog();

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!active) return;
      setCurrentUser(user);
      if (!user) {
        setUserDetails(null);
        setIsLiked(false);
        return;
      }
      try {
        const [uSnap, bSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDoc(doc(db, 'blogs', id)),
        ]);
        if (active && uSnap.exists()) {
          setUserDetails(uSnap.data());
        } else if (active) {
          setUserDetails({
            firstName: user.displayName || user.email?.split('@')[0] || 'Thành viên',
            photo: user.photoURL || '',
          });
        }
        if (active && bSnap.exists()) {
          setIsLiked(Boolean(bSnap.data().likedBy?.includes(user.uid)));
        }
      } catch (err) {
        console.error('Error fetching auth context for blog:', err);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [id]);

  const handleLike = async () => {
    if (!currentUser) {
      toast.info('Vui lòng đăng nhập để thả tim bài viết.');
      return;
    }
    try {
      const docRef = doc(db, 'blogs', id);
      if (isLiked) {
        await updateDoc(docRef, {
          likes: Math.max(0, likes - 1),
          likedBy: arrayRemove(currentUser.uid),
        });
        setLikes((v) => Math.max(0, v - 1));
        setIsLiked(false);
      } else {
        await updateDoc(docRef, {
          likes: likes + 1,
          likedBy: arrayUnion(currentUser.uid),
        });
        setLikes((v) => v + 1);
        setIsLiked(true);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      toast.error('Không thể cập nhật lượt thích lúc này.');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết bài viết!');
    } catch {
      toast.info('Hãy sao chép đường dẫn trên thanh địa chỉ.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser || !userDetails) {
      toast.info('Vui lòng đăng nhập để bình luận.');
      return;
    }

    const comment = {
      userId: currentUser.uid,
      userName: userDetails.firstName || 'Thành viên',
      userPhoto: userDetails.photo || '/logo192.png',
      content: newComment.trim(),
      timestamp: new Date(),
    };

    try {
      await updateDoc(doc(db, 'blogs', id), {
        comments: arrayUnion(comment),
      });
      setComments((prev) => [...prev, comment]);
      setNewComment('');
      toast.success('Đã đăng bình luận');
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Không thể gửi bình luận.');
    }
  };

  const handleUpdateComment = async (e, commentIndex) => {
    e.preventDefault();
    if (!editedContent.trim()) return;
    try {
      const updated = comments.map((c, idx) =>
        idx === commentIndex ? { ...c, content: editedContent.trim() } : c,
      );
      await updateDoc(doc(db, 'blogs', id), { comments: updated });
      setComments(updated);
      setEditingIndex(null);
      setEditedContent('');
      toast.success('Đã cập nhật bình luận');
    } catch (err) {
      console.error('Error updating comment:', err);
      toast.error('Không thể cập nhật bình luận.');
    }
  };

  const handleDeleteComment = async (commentIndex) => {
    if (!currentUser || comments[commentIndex]?.userId !== currentUser.uid) return;
    try {
      const updated = comments.filter((_, idx) => idx !== commentIndex);
      await updateDoc(doc(db, 'blogs', id), { comments: updated });
      setComments(updated);
      toast.success('Đã xóa bình luận');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Không thể xóa bình luận.');
    }
  };

  const handleReplySubmit = async (e, commentIndex) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUser || !userDetails) return;

    const reply = {
      userId: currentUser.uid,
      userName: userDetails.firstName || 'Thành viên',
      userPhoto: userDetails.photo || '/logo192.png',
      content: replyContent.trim(),
      timestamp: new Date(),
    };

    try {
      const updated = comments.map((c, idx) => {
        if (idx !== commentIndex) return c;
        return { ...c, replies: [...(c.replies || []), reply] };
      });
      await updateDoc(doc(db, 'blogs', id), { comments: updated });
      setComments(updated);
      setReplyContent('');
      setReplyToIndex(null);
      setShowReplies((prev) => ({ ...prev, [commentIndex]: true }));
      toast.success('Đã gửi phản hồi');
    } catch (err) {
      console.error('Error adding reply:', err);
      toast.error('Không thể gửi phản hồi.');
    }
  };

  const handleDeleteReply = async (commentIndex, replyIndex) => {
    const target = comments[commentIndex]?.replies?.[replyIndex];
    if (!target || !currentUser || target.userId !== currentUser.uid) return;
    try {
      const updated = comments.map((c, idx) => {
        if (idx !== commentIndex) return c;
        return { ...c, replies: c.replies.filter((_, rIdx) => rIdx !== replyIndex) };
      });
      await updateDoc(doc(db, 'blogs', id), { comments: updated });
      setComments(updated);
      toast.success('Đã xóa phản hồi');
    } catch (err) {
      console.error('Error deleting reply:', err);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!blog) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-serif text-3xl font-bold text-heritage-ink">Không tìm thấy bài viết</h1>
          <p className="text-heritage-muted">Bài viết này có thể đã bị xóa hoặc đường dẫn không hợp lệ.</p>
          <Button to="/blog" variant="primary">
            Về danh sách Blog
          </Button>
        </div>
      </MainLayout>
    );
  }

  const readMin = estimateReadingTime(blog.Body, blog.Sapo);
  const categoryLabel = getBlogDisplayCategory(blog);
  const isOwner = currentUser && blog.author?.uid === currentUser.uid;

  return (
    <MainLayout>
      {/* Reading Progress Bar */}
      <div className="fixed top-[72px] left-0 right-0 z-30 h-[3px] bg-heritage-sand/40 pointer-events-none">
        <div
          className="h-full bg-heritage-vermilion transition-[width] duration-75"
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', to: '/' },
            { label: 'Cộng đồng Blog', to: '/blog' },
            { label: blog.Title || 'Bài viết' },
          ]}
        />

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="vermilion">{categoryLabel}</Badge>
              <Badge variant="neutral">
                <Clock className="w-3.5 h-3.5" />
                {readMin} phút đọc
              </Badge>
            </div>
            {isOwner && (
              <Button to={`/blog/edit/${id}`} variant="outline" size="sm">
                <Pencil className="w-3.5 h-3.5" />
                Chỉnh sửa bài viết
              </Button>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-heritage-ink leading-tight">
            {blog.Title}
          </h1>

          {blog.author && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-y border-heritage-border py-3.5">
              <Link to={`/profile/${blog.author.uid}`} className="flex items-center gap-3 group">
                <UserAvatar
                  src={blog.author.photo}
                  name={blog.author.name || 'Thành viên HTLVN'}
                  sizeClass="w-11 h-11"
                  textClass="text-sm"
                />
                <div>
                  <p className="font-bold text-sm sm:text-base text-heritage-ink group-hover:text-heritage-vermilion transition-colors">
                    {blog.author.name || 'Thành viên HTLVN'}
                  </p>
                  <p className="text-xs text-heritage-muted">
                    Đăng ngày {formatViDate(blog.published_on)}
                    {blog.last_Updated && ` · Cập nhật ${formatViDate(blog.last_Updated)}`}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                    isLiked
                      ? 'bg-heritage-vermilion text-white border-heritage-vermilion'
                      : 'bg-white text-heritage-ink border-heritage-border hover:bg-heritage-paper'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likes}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-heritage-ink border border-heritage-border hover:bg-heritage-paper transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Chia sẻ</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Cover */}
        <div className="rounded-2xl overflow-hidden border border-heritage-border shadow-card bg-stone-100">
          <SmartImage
            src={blog.CoverURL}
            fallbackSrc={getSmartBlogFallbackCover(blog)}
            alt={blog.Title}
            className="w-full max-h-[460px] object-cover"
          />
        </div>

        {/* Lead Sapo */}
        {blog.Sapo && (
          <div
            className="text-lg sm:text-xl font-serif italic text-heritage-ink/90 leading-relaxed bg-heritage-paper border-l-4 border-heritage-gold px-5 py-4 rounded-r-xl"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.Sapo) }}
          />
        )}

        {/* Rich Article Body */}
        <div
          ref={bodyRef}
          className="text-base sm:text-[17px] text-heritage-ink leading-[1.85] space-y-4 [&_h1]:font-serif [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-7 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1.5 [&_a]:text-heritage-vermilion [&_a]:underline [&_img]:rounded-xl [&_img]:my-5 [&_img]:mx-auto [&_blockquote]:border-l-4 [&_blockquote]:border-heritage-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-heritage-muted"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.Body || '') }}
        />

        {/* Interactive Reaction Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-heritage-border">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                isLiked
                  ? 'bg-heritage-vermilion text-white border-heritage-vermilion shadow-sm'
                  : 'bg-white text-heritage-ink border-heritage-border hover:bg-heritage-vermilion-soft hover:text-heritage-vermilion'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Đã thích' : 'Thích bài viết'} ({likes})</span>
            </button>

            <a
              href="#comments-section"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-heritage-ink border border-heritage-border hover:bg-heritage-paper"
            >
              <MessageCircle className="w-4 h-4 text-heritage-jade" />
              <span>Bình luận ({comments.length})</span>
            </a>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
            Sao chép liên kết
          </Button>
        </div>

        {/* COMMENTS SECTION */}
        <section id="comments-section" className="space-y-6 pt-2">
          <h2 className="font-serif text-2xl font-bold text-heritage-ink">
            Thảo luận &amp; Bình luận ({comments.length})
          </h2>

          {currentUser ? (
            <Card padding="p-4" className="space-y-3">
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div className="flex items-start gap-3">
                  <UserAvatar
                    src={userDetails?.photo}
                    name={userDetails?.firstName || 'Thành viên'}
                    sizeClass="w-10 h-10"
                    textClass="text-xs"
                  />
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ cảm nhận hoặc đặt câu hỏi về bài viết này..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-heritage-border bg-heritage-cream/50 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" disabled={!newComment.trim()}>
                    <Send className="w-3.5 h-3.5" />
                    Gửi bình luận
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card padding="p-5" className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-heritage-paper">
              <p className="text-sm text-heritage-muted">
                Đăng nhập tài khoản HTLVN để tham gia thảo luận và thả tim bài viết.
              </p>
              <Button to="/login" variant="primary" size="sm">
                Đăng nhập ngay
              </Button>
            </Card>
          )}

          {comments.length === 0 ? (
            <p className="text-sm text-heritage-muted italic py-4">
              Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => {
                const isCommentOwner = Boolean(currentUser && comment.userId === currentUser.uid);
                const replyCount = comment.replies?.length || 0;

                return (
                  <Card key={index} padding="p-5" className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Link to={`/profile/${comment.userId}`} className="shrink-0">
                        <UserAvatar
                          src={comment.userPhoto}
                          name={comment.userName || 'Thành viên'}
                          sizeClass="w-9 h-9"
                          textClass="text-xs"
                        />
                      </Link>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Link
                            to={`/profile/${comment.userId}`}
                            className="font-bold text-sm text-heritage-ink hover:text-heritage-vermilion"
                          >
                            {comment.userName || 'Thành viên'}
                          </Link>
                          <span className="text-xs text-heritage-muted">{formatViDate(comment.timestamp)}</span>
                        </div>

                        {editingIndex === index ? (
                          <form onSubmit={(e) => handleUpdateComment(e, index)} className="space-y-2 pt-1">
                            <textarea
                              rows={2}
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-heritage-border text-sm text-heritage-ink"
                            />
                            <div className="flex items-center gap-2">
                              <Button type="submit" variant="secondary" size="sm">
                                <Check className="w-3.5 h-3.5" />
                                Lưu
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingIndex(null)}
                              >
                                <X className="w-3.5 h-3.5" />
                                Hủy
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <p className="text-sm text-heritage-ink leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold">
                          {currentUser && (
                            <button
                              type="button"
                              onClick={() => setReplyToIndex(replyToIndex === index ? null : index)}
                              className="inline-flex items-center gap-1 text-heritage-jade hover:underline cursor-pointer"
                            >
                              <Reply className="w-3.5 h-3.5" />
                              Trả lời
                            </button>
                          )}

                          {isCommentOwner && editingIndex !== index && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingIndex(index);
                                  setEditedContent(comment.content);
                                }}
                                className="inline-flex items-center gap-1 text-heritage-muted hover:text-heritage-ink cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" />
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(index)}
                                className="inline-flex items-center gap-1 text-red-600 hover:underline cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                Xóa
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline Reply Composer */}
                    {replyToIndex === index && currentUser && (
                      <form onSubmit={(e) => handleReplySubmit(e, index)} className="pl-12 pt-2 space-y-2">
                        <textarea
                          rows={2}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={`Phản hồi ${comment.userName}...`}
                          className="w-full px-3.5 py-2 rounded-xl border border-heritage-border bg-heritage-cream/50 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-jade/25"
                        />
                        <div className="flex items-center gap-2">
                          <Button type="submit" variant="secondary" size="sm" disabled={!replyContent.trim()}>
                            Gửi phản hồi
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setReplyToIndex(null)}>
                            Hủy
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Nested Replies */}
                    {replyCount > 0 && (
                      <div className="pl-10 sm:pl-12 space-y-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowReplies((prev) => ({ ...prev, [index]: !prev[index] }))}
                          className="inline-flex items-center gap-1 text-xs font-bold text-heritage-vermilion hover:underline cursor-pointer"
                        >
                          {showReplies[index] ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              Ẩn {replyCount} phản hồi
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              Xem {replyCount} phản hồi
                            </>
                          )}
                        </button>

                        {showReplies[index] && (
                          <div className="space-y-2.5 border-l-2 border-heritage-border pl-4">
                            {comment.replies.map((reply, rIdx) => (
                              <div key={rIdx} className="flex items-start gap-2.5">
                                <UserAvatar
                                  src={reply.userPhoto}
                                  name={reply.userName || 'Thành viên'}
                                  sizeClass="w-7 h-7"
                                  textClass="text-[11px]"
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-heritage-ink">{reply.userName}</span>
                                    <span className="text-[11px] text-heritage-muted">
                                      {formatViDate(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-heritage-ink">{reply.content}</p>
                                  {currentUser && reply.userId === currentUser.uid && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteReply(index, rIdx)}
                                      className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                                    >
                                      Xóa phản hồi
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </article>
    </MainLayout>
  );
}

export default BlogView;
