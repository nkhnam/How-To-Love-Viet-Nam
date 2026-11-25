import React, { useState, useEffect } from 'react';
import { Timestamp, collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { Editor } from '@tinymce/tinymce-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { Upload, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db, storage } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { BLOG_WRITABLE_CATEGORIES, DEFAULT_BLOG_COVER } from '../../utils/blogHelpers';

/**
 * Create Blog page preserving TinyMCE + Firebase Storage uploads
 * and exact Firestore schema with Heritage UX.
 */
function CreateBlog() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lịch Sử');
  const [sapo, setSapo] = useState('');
  const [body, setBody] = useState('');
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [authorDetails, setAuthorDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        toast.info('Vui lòng đăng nhập để viết bài chia sẻ.');
        navigate('/login');
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setAuthorDetails(snap.data());
        } else {
          setAuthorDetails({
            firstName: user.displayName || user.email?.split('@')[0] || 'Thành viên',
            photo: user.photoURL || '',
          });
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleCoverImgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCover(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadCoverImage = async (image) => {
    if (!image) return null;
    const storageRef = ref(storage, `covers/${Date.now()}_${image.name}`);
    await uploadBytes(storageRef, image);
    return getDownloadURL(storageRef);
  };

  const handleEditorImageUpload = (blobInfo) =>
    new Promise((resolve, reject) => {
      const file = blobInfo.blob();
      const storageRef = ref(storage, `editorImages/${Date.now()}_${file.name}`);
      uploadBytes(storageRef, file)
        .then(() => getDownloadURL(storageRef))
        .then((url) => resolve(url))
        .catch((error) => {
          console.error('Error uploading editor image:', error);
          reject('Tải ảnh lên thất bại');
        });
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !sapo.trim() || !body.trim()) {
      toast.warning('Vui lòng điền đầy đủ tiêu đề, mô tả ngắn và nội dung bài viết.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const coverUrl = cover ? await uploadCoverImage(cover) : '';
      await addDoc(collection(db, 'blogs'), {
        Title: title.trim(),
        Sapo: sapo.trim(),
        Body: body,
        CoverURL: coverUrl || DEFAULT_BLOG_COVER,
        category,
        publish: false,
        published_on: Timestamp.fromDate(new Date()),
        author: {
          uid: currentUser.uid,
          name: authorDetails?.firstName || currentUser.displayName || 'Thành viên',
          photo: authorDetails?.photo || currentUser.photoURL || '',
        },
      });
      toast.success('Đã xuất bản bài viết mới!');
      navigate('/blog');
    } catch (error) {
      console.error('Error publishing blog:', error);
      toast.error('Không thể xuất bản bài viết lúc này. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', to: '/' },
            { label: 'Cộng đồng Blog', to: '/blog' },
            { label: 'Viết bài mới' },
          ]}
        />

        <div>
          <h1 className="font-serif text-3xl font-bold text-heritage-ink">Viết bài chia sẻ mới</h1>
          <p className="text-sm text-heritage-muted mt-1">
            Chia sẻ bài phân tích Lịch Sử, cảm nhận di sản văn hóa địa phương hoặc bí quyết học tập.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="blog-title">
                  Tiêu đề bài viết *
                </label>
                <input
                  id="blog-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Dấu ấn kiến trúc Chùa Cầu Hội An qua dòng thời gian"
                  className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-base font-medium text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="blog-category">
                  Chủ đề
                </label>
                <select
                  id="blog-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                >
                  {BLOG_WRITABLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="blog-sapo">
                Đoạn giới thiệu ngắn (Sapo) *
              </label>
              <textarea
                id="blog-sapo"
                rows={2}
                required
                value={sapo}
                onChange={(e) => setSapo(e.target.value)}
                placeholder="Tóm tắt ngắn gọn thông điệp chính của bài viết..."
                className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-heritage-ink mb-2">Ảnh bìa bài viết</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-heritage-border bg-heritage-cream/50 hover:border-heritage-vermilion transition-colors cursor-pointer text-center min-h-[140px]">
                  <Upload className="w-6 h-6 text-heritage-vermilion mb-2" />
                  <span className="text-sm font-semibold text-heritage-ink">
                    {cover ? cover.name : 'Chọn ảnh bìa (tùy chọn)'}
                  </span>
                  <span className="text-xs text-heritage-muted mt-0.5">Nếu bỏ qua sẽ dùng ảnh bìa mặc định</span>
                  <input type="file" accept="image/*" onChange={handleCoverImgChange} className="hidden" />
                </label>

                <div className="rounded-xl overflow-hidden border border-heritage-border h-[140px] bg-stone-100">
                  <img
                    src={coverPreview || DEFAULT_BLOG_COVER}
                    alt="Xem trước ảnh bìa"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <label className="block text-sm font-semibold text-heritage-ink">Nội dung chi tiết *</label>
            <Editor
              apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
              value={body}
              onEditorChange={(content) => setBody(content)}
              init={{
                height: 480,
                menubar: false,
                plugins:
                  'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                toolbar:
                  'undo redo | blocks fontsize | bold italic backcolor | bullist numlist | link image | removeformat',
                content_style:
                  'body { font-family: "Be Vietnam Pro", system-ui, sans-serif; color: #1C1917; } p, li { font-size: 16px; line-height: 1.7; } img { max-width: 100%; height: auto; border-radius: 10px; }',
                images_upload_handler: handleEditorImageUpload,
              }}
            />
          </Card>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xuất bản...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Xuất bản bài viết
                </>
              )}
            </Button>
          </div>
        </form>
      </section>
    </MainLayout>
  );
}

export default CreateBlog;
