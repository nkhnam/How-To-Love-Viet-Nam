import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { PenSquare, Eye, Pencil, Trash2, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { db, auth } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import SmartImage from '../ui/SmartImage';
import {
  getSmartBlogFallbackCover,
  stripHtml,
  formatViDate,
  getBlogDisplayCategory,
} from '../../utils/blogHelpers';

/**
 * Author Blog Dashboard for viewing, editing, or deleting user-authored articles.
 */
function MyPosts() {
  const navigate = useNavigate();
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const blogsQuery = query(collection(db, 'blogs'), where('author.uid', '==', user.uid));
        const snapshot = await getDocs(blogsQuery);
        const list = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }));
        setUserBlogs(list);
      } catch (err) {
        console.error('Error loading user blogs:', err);
        toast.error('Không thể tải danh sách bài viết của bạn.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'blogs', deleteTarget.id));
      setUserBlogs((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success(`Đã xóa bài viết "${deleteTarget.Title}"`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting blog:', err);
      toast.error('Không thể xóa bài viết lúc này.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', to: '/' },
            { label: 'Cộng đồng Blog', to: '/blog' },
            { label: 'Bài viết của tôi' },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-heritage-ink">Bài viết của tôi</h1>
            <p className="text-sm text-heritage-muted mt-1">Quản lý và cập nhật các bài chia sẻ bạn đã xuất bản.</p>
          </div>
          <Button to="/blogcreate" variant="primary" size="md">
            <PenSquare className="w-4 h-4" />
            Viết bài mới
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} padding="p-0" className="overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : userBlogs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Bạn chưa đăng bài viết nào"
            description="Hãy chia sẻ những câu chuyện lịch sử hoặc kinh nghiệm ôn tập của bạn với cộng đồng HTLVN."
            actionLabel="Viết bài đầu tiên"
            actionTo="/blogcreate"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBlogs.map((blog) => (
              <Card key={blog.id} padding="p-0" className="overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
                    <SmartImage
                      src={blog.CoverURL}
                      fallbackSrc={getSmartBlogFallbackCover(blog)}
                      alt={blog.Title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="neutral" className="bg-white/90 backdrop-blur-sm">
                        {getBlogDisplayCategory(blog)}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <p className="text-xs text-heritage-muted">{formatViDate(blog.published_on)}</p>
                    <h2 className="font-serif text-lg font-bold text-heritage-ink line-clamp-2">{blog.Title}</h2>
                    <p className="text-sm text-heritage-muted line-clamp-2">{stripHtml(blog.Sapo)}</p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex flex-wrap gap-2 border-t border-heritage-border/60">
                  <Button to={`/blog/${blog.id}`} variant="secondary" size="sm" className="flex-1">
                    <Eye className="w-3.5 h-3.5" />
                    Xem bài
                  </Button>
                  <Button to={`/blog/edit/${blog.id}`} variant="outline" size="sm">
                    <Pencil className="w-3.5 h-3.5" />
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(blog)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => !deleting && setDeleteTarget(null)}
          title="Xác nhận xóa bài viết"
          maxWidth="max-w-md"
        >
          <div className="p-6 space-y-4">
            <p className="text-sm text-heritage-muted leading-relaxed">
              Bạn có chắc muốn xóa bài viết <strong className="text-heritage-ink">&ldquo;{deleteTarget?.Title}&rdquo;</strong>?
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" disabled={deleting} onClick={() => setDeleteTarget(null)}>
                Hủy
              </Button>
              <Button variant="primary" size="sm" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </Button>
            </div>
          </div>
        </Modal>
      </section>
    </MainLayout>
  );
}

export default MyPosts;
