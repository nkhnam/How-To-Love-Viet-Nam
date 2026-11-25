import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { MessageSquare, Compass, FileText, Heart } from 'lucide-react';
import { db } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import SmartImage from '../ui/SmartImage';
import UserAvatar from '../ui/UserAvatar';
import { getSmartBlogFallbackCover, formatViDate, stripHtml } from '../../utils/blogHelpers';

/**
 * Privacy-safe public member profile (never exposes member email).
 */
function UserProfile() {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadPublicProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const [userSnap, blogsSnap] = await Promise.all([
          getDoc(doc(db, 'users', userId)),
          getDocs(query(collection(db, 'blogs'), where('author.uid', '==', userId))),
        ]);
        if (!active) return;
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserDetails({
            firstName: data.firstName || 'Thành viên HTLVN',
            photo: data.photo || '',
            discoveredCount: Array.isArray(data.discoveredProvinces) ? data.discoveredProvinces.length : 0,
          });
        }
        setUserBlogs(blogsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error loading public profile:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadPublicProfile();
    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </MainLayout>
    );
  }

  if (!userDetails) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-serif text-2xl font-bold text-heritage-ink">Không tìm thấy thành viên</h1>
          <Button to="/blog" variant="primary">
            Quay lại Cộng đồng Blog
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="bg-heritage-paper border-b border-heritage-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <Breadcrumb
            className="mb-5"
            items={[
              { label: 'Trang chủ', to: '/' },
              { label: 'Cộng đồng', to: '/blog' },
              { label: userDetails.firstName },
            ]}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <UserAvatar
                src={userDetails.photo}
                name={userDetails.firstName}
                sizeClass="w-20 h-20"
                textClass="text-xl"
                className="border-2 border-white shadow-md"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="jade">Thành viên HTLVN</Badge>
                  {userDetails.discoveredCount > 0 && (
                    <Badge variant="gold">
                      <Compass className="w-3.5 h-3.5" />
                      {userDetails.discoveredCount}/63 tỉnh đã khám phá
                    </Badge>
                  )}
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-ink">
                  {userDetails.firstName}
                </h1>
                <p className="text-xs text-heritage-muted">{userBlogs.length} bài viết đã xuất bản</p>
              </div>
            </div>

            <Button to={`/messages/${userId}`} variant="primary" size="md">
              <MessageSquare className="w-4 h-4" />
              Nhắn tin
            </Button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        <h2 className="font-serif text-2xl font-bold text-heritage-ink">
          Bài viết của {userDetails.firstName} ({userBlogs.length})
        </h2>

        {userBlogs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Chưa có bài viết nào"
            description="Thành viên này chưa đăng tải bài viết chia sẻ nào."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBlogs.map((blog) => (
              <Link key={blog.id} to={`/blog/${blog.id}`} className="group block">
                <Card hover padding="p-0" className="h-full overflow-hidden flex flex-col justify-between">
                  <div>
                    <SmartImage
                      src={blog.CoverURL}
                      fallbackSrc={getSmartBlogFallbackCover(blog)}
                      alt={blog.Title}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-5 space-y-2">
                      <p className="text-xs text-heritage-muted">{formatViDate(blog.published_on)}</p>
                      <h3 className="font-serif text-lg font-bold text-heritage-ink group-hover:text-heritage-vermilion transition-colors line-clamp-2">
                        {blog.Title}
                      </h3>
                      <p className="text-sm text-heritage-muted line-clamp-2">{stripHtml(blog.Sapo)}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-4 text-xs text-heritage-muted flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-heritage-vermilion" />
                    <span>{blog.likes || 0} lượt thích</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}

export default UserProfile;
