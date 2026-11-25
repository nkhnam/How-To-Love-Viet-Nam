import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import {
  PenSquare,
  FileText,
  Search,
  Clock,
  Heart,
  MessageCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { db, auth } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import SmartImage from '../ui/SmartImage';
import UserAvatar from '../ui/UserAvatar';
import {
  BLOG_CATEGORIES,
  getSmartBlogFallbackCover,
  stripHtml,
  estimateReadingTime,
  toDateObj,
  formatViDate,
  getBlogDisplayCategory,
} from '../../utils/blogHelpers';

/**
 * Editorial Blog Community Hub with realtime search, category filter pills,
 * reading-time metadata, Skeleton states, and Heritage card layout.
 */
function Bloglist() {
  const [currentUser, setCurrentUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'likes'

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, 'blogs'), limit(100));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }));
        setBlogs(list);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        toast.error('Không thể tải danh sách bài viết lúc này.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = blogs.filter((blog) => {
      const cat = getBlogDisplayCategory(blog);
      if (selectedCategory !== 'Tất cả' && cat !== selectedCategory) return false;
      if (!q) return true;
      const sapoPlain = stripHtml(blog.Sapo).toLowerCase();
      return (
        (blog.Title || '').toLowerCase().includes(q) ||
        sapoPlain.includes(q) ||
        (blog.author?.name || '').toLowerCase().includes(q)
      );
    });

    return list.sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      }
      const da = toDateObj(a.published_on)?.getTime() || 0;
      const dbTime = toDateObj(b.published_on)?.getTime() || 0;
      return dbTime - da;
    });
  }, [blogs, search, selectedCategory, sortBy]);

  const showFeatured = !search.trim() && selectedCategory === 'Tất cả' && sortBy === 'newest' && filteredBlogs.length > 0;
  const featuredBlog = showFeatured ? filteredBlogs[0] : null;
  const gridBlogs = showFeatured ? filteredBlogs.slice(1) : filteredBlogs;

  return (
    <MainLayout>
      {/* HERO HEADER */}
      <section className="bg-heritage-paper border-b border-heritage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Breadcrumb className="mb-4" items={[{ label: 'Trang chủ', to: '/' }, { label: 'Cộng đồng Blog' }]} />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Badge variant="gold" className="mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Diễn đàn Tri thức &amp; Văn hóa Việt Nam
              </Badge>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink leading-tight">
                Cộng đồng Chia sẻ Lịch Sử &amp; Địa phương
              </h1>
              <p className="mt-2.5 text-heritage-muted text-sm sm:text-base leading-relaxed">
                Đọc bài viết chuyên sâu, chia sẻ câu chuyện di sản quê hương và bí quyết ôn thi Lịch Sử – GDĐP cùng
                học sinh trên cả nước.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button to={currentUser ? '/blogcreate' : '/login'} variant="primary" size="md">
                <PenSquare className="w-4 h-4" />
                Viết bài mới
              </Button>
              {currentUser && (
                <Button to="/mypost" variant="outline" size="md">
                  <FileText className="w-4 h-4" />
                  Bài viết của tôi
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR & EDITORIAL GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <div className="bg-white rounded-2xl border border-heritage-border p-4 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-heritage-vermilion text-white shadow-sm'
                    : 'bg-heritage-paper text-heritage-muted hover:text-heritage-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sắp xếp bài viết"
              className="px-3.5 py-2.5 rounded-xl border border-heritage-border bg-white text-sm font-medium text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
            >
              <option value="newest">Mới nhất</option>
              <option value="likes">Yêu thích nhất</option>
            </select>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-heritage-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tiêu đề, tác giả..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-heritage-border bg-heritage-cream/60 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} padding="p-0" className="overflow-hidden">
                <Skeleton className="h-48 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Chưa tìm thấy bài viết phù hợp"
            description="Hãy thử xóa bộ lọc tìm kiếm hoặc tự tay đóng góp bài viết đầu tiên cho chủ đề này."
            actionLabel="Xem tất cả bài viết"
            onAction={() => {
              setSelectedCategory('Tất cả');
              setSearch('');
            }}
          />
        ) : (
          <div className="space-y-8">
            {/* Featured Lead Article */}
            {featuredBlog && (
              <Link to={`/blog/${featuredBlog.id}`} className="group block">
                <Card hover padding="p-0" className="overflow-hidden grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-6 aspect-[16/10] lg:aspect-auto lg:min-h-[300px] bg-stone-900 overflow-hidden">
                    <SmartImage
                      src={featuredBlog.CoverURL}
                      fallbackSrc={getSmartBlogFallbackCover(featuredBlog)}
                      alt={featuredBlog.Title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="vermilion">Bài viết nổi bật</Badge>
                        <Badge variant="neutral">{getBlogDisplayCategory(featuredBlog)}</Badge>
                        <span className="text-xs font-medium text-heritage-muted inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {estimateReadingTime(featuredBlog.Body, featuredBlog.Sapo)} phút đọc
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-ink group-hover:text-heritage-vermilion transition-colors leading-snug">
                        {featuredBlog.Title}
                      </h2>
                      <p className="text-sm sm:text-base text-heritage-muted line-clamp-3 leading-relaxed">
                        {stripHtml(featuredBlog.Sapo)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-heritage-border/70">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar
                          src={featuredBlog.author?.photo}
                          name={featuredBlog.author?.name || 'Thành viên HTLVN'}
                          sizeClass="w-8 h-8"
                          textClass="text-xs"
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-heritage-ink truncate">
                            {featuredBlog.author?.name || 'Thành viên HTLVN'}
                          </p>
                          <p className="text-[11px] text-heritage-muted">{formatViDate(featuredBlog.published_on)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold text-heritage-muted">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-heritage-vermilion" />
                          {featuredBlog.likes || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5 text-heritage-jade" />
                          {featuredBlog.comments?.length || 0}
                        </span>
                        <span className="text-heritage-vermilion inline-flex items-center gap-1">
                          Đọc bài <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridBlogs.map((blog) => {
                const cat = getBlogDisplayCategory(blog);
                const readMin = estimateReadingTime(blog.Body, blog.Sapo);
                return (
                  <Link key={blog.id} to={`/blog/${blog.id}`} className="group block">
                    <Card hover padding="p-0" className="h-full overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                          <SmartImage
                            src={blog.CoverURL}
                            fallbackSrc={getSmartBlogFallbackCover(blog)}
                            alt={blog.Title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <Badge variant="neutral" className="bg-white/90 backdrop-blur-sm">
                              {cat}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-5 space-y-2.5">
                          <div className="flex items-center justify-between text-xs text-heritage-muted font-medium">
                            <span>{formatViDate(blog.published_on)}</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {readMin} phút đọc
                            </span>
                          </div>
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-heritage-ink group-hover:text-heritage-vermilion transition-colors line-clamp-2 leading-snug">
                            {blog.Title}
                          </h3>
                          <p className="text-sm text-heritage-muted line-clamp-2 leading-relaxed">
                            {stripHtml(blog.Sapo)}
                          </p>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-3 border-t border-heritage-border/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar
                            src={blog.author?.photo}
                            name={blog.author?.name || 'Thành viên HTLVN'}
                            sizeClass="w-7 h-7"
                            textClass="text-[11px]"
                          />
                          <span className="text-xs font-semibold text-heritage-ink truncate">
                            {blog.author?.name || 'Thành viên HTLVN'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-heritage-muted shrink-0">
                          <span className="inline-flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {blog.likes || 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {blog.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </MainLayout>
  );
}

export default Bloglist;
