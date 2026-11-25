import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { Editor } from '@tinymce/tinymce-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Upload, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db, storage } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { BLOG_WRITABLE_CATEGORIES, DEFAULT_BLOG_COVER } from '../../utils/blogHelpers';

/**
 * Edit Blog page preserving existing Firestore & TinyMCE contracts.
 */
function BlogEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lịch Sử');
  const [sapo, setSapo] = useState('');
  const [body, setBody] = useState('');
  const [cover, setCover] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, 'blogs', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.Title || '');
          setSapo(data.Sapo || '');
          setBody(data.Body || '');
          setCoverUrl(data.CoverURL || '');
          if (data.category) setCategory(data.category);
        } else {
          toast.error('Không tìm thấy bài viết cần sửa.');
          navigate('/mypost');
        }
      } catch (err) {
        console.error('Error loading blog for edit:', err);
        toast.error('Không thể tải dữ liệu bài viết.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id, navigate]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCover(file);
    setCoverUrl(URL.createObjectURL(file));
  };

  const handleEditorImageUpload = (blobInfo) =>
    new Promise((resolve, reject) => {
      const file = blobInfo.blob();
      const storageRef = ref(storage, `editorImages/${Date.now()}_${file.name}`);
      uploadBytes(storageRef, file)
        .then(() => getDownloadURL(storageRef))
        .then((url) => resolve(url))
        .catch((error) => {
          console.error('Error uploading image:', error);
          reject('Tải ảnh lên thất bại');
        });
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !sapo.trim() || !body.trim()) {
      toast.warning('Vui lòng nhập đầy đủ tiêu đề, đoạn giới thiệu và nội dung.');
      return;
    }

    setSubmitting(true);
    try {
      let updatedCoverUrl = coverUrl;
      if (cover) {
        const storageRef = ref(storage, `covers/${Date.now()}_${cover.name}`);
        await uploadBytes(storageRef, cover);
        updatedCoverUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, 'blogs', id), {
        Title: title.trim(),
        CoverURL: updatedCoverUrl || DEFAULT_BLOG_COVER,
        Sapo: sapo.trim(),
        Body: body,
        category,
        last_Updated: Timestamp.fromDate(new Date()),
      });

      toast.success('Đã lưu thay đổi bài viết!');
      navigate('/mypost');
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error('Không thể cập nhật bài viết lúc này.');
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
            { label: 'Bài viết của tôi', to: '/mypost' },
            { label: 'Chỉnh sửa' },
          ]}
        />

        <div>
          <h1 className="font-serif text-3xl font-bold text-heritage-ink">Chỉnh sửa bài viết</h1>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-sm text-heritage-muted">Đang tải nội dung...</Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="edit-blog-title">
                    Tiêu đề bài viết *
                  </label>
                  <input
                    id="edit-blog-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-base font-medium text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="edit-blog-cat">
                    Chủ đề
                  </label>
                  <select
                    id="edit-blog-cat"
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
                <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="edit-blog-sapo">
                  Đoạn giới thiệu ngắn *
                </label>
                <textarea
                  id="edit-blog-sapo"
                  rows={2}
                  required
                  value={sapo}
                  onChange={(e) => setSapo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-heritage-ink mb-2">Ảnh bìa</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-heritage-border bg-heritage-cream/50 hover:border-heritage-vermilion transition-colors cursor-pointer text-center min-h-[140px]">
                    <Upload className="w-6 h-6 text-heritage-vermilion mb-2" />
                    <span className="text-sm font-semibold text-heritage-ink">
                      {cover ? cover.name : 'Đổi ảnh bìa khác'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>

                  <div className="rounded-xl overflow-hidden border border-heritage-border h-[140px] bg-stone-100">
                    <img
                      src={coverUrl || DEFAULT_BLOG_COVER}
                      alt="Xem trước ảnh bìa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="space-y-3">
              <label className="block text-sm font-semibold text-heritage-ink">Nội dung bài viết *</label>
              <Editor
                value={body}
                apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
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
              <Button type="button" variant="outline" onClick={() => navigate('/mypost')}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </section>
    </MainLayout>
  );
}

export default BlogEdit;
