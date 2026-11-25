import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import {
  User,
  Compass,
  Trophy,
  BookOpen,
  Settings,
  MessageSquare,
  LogOut,
  Upload,
  Save,
  Search,
  Layers,
  ListChecks,
  PenSquare,
  PlusCircle,
  ArrowRight,
  Loader2,
  CalendarClock,
  FileText,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import SmartImage from '../ui/SmartImage';
import UserAvatar from '../ui/UserAvatar';
import StudyBot from '../StudyBot';
import { usePassport } from '../../hooks/usePassport';
import { PROVINCES, PROVINCE_BY_SLUG, SLUG_MIGRATION_MAP } from '../../data/provinces';
import { getQuizMeta, formatRelativeTimeVi } from '../../data/quizMeta';
import { getSmartBlogFallbackCover, formatViDate, stripHtml } from '../../utils/blogHelpers';
import { uploadImageWithFallback } from '../../utils/imageUpload';

const VALID_TABS = ['overview', 'content', 'settings'];

/**
 * 3-Tab Learning Dashboard (/profile):
 * Tab 1: Tổng quan học tập (Heritage Passport + Quiz Stats + Study Planner)
 * Tab 2: Nội dung của tôi (Blogs & Quizzes)
 * Tab 3: Cài đặt & Cộng đồng (Profile Settings + Privacy-safe Member Search)
 */
function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramTab = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(paramTab) ? paramTab : 'overview';

  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const [userBlogs, setUserBlogs] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');

  // Edit profile state
  const [firstName, setFirstName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const { stats } = usePassport();

  const regionTotals = useMemo(
    () =>
      PROVINCES.reduce(
        (acc, p) => {
          acc[p.region] = (acc[p.region] || 0) + 1;
          return acc;
        },
        { bac: 0, trung: 0, nam: 0 },
      ),
    [],
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setAuthUser(user);
      if (!user) {
        setAuthReady(true);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        let profileData;
        if (snap.exists()) {
          profileData = snap.data();
        } else {
          profileData = {
            firstName: user.displayName || user.email?.split('@')[0] || 'Thành viên',
            email: user.email || '',
            photo: user.photoURL || '',
          };
          await setDoc(userRef, profileData, { merge: true });
        }
        setUserDetails(profileData);
        setFirstName(profileData.firstName || '');
        setAvatarPreview(profileData.photo || '');

        // Load user content, quiz history, and community directory in parallel
        const [blogsSnap, myQuizzesSnap, resultsSnap, allQuizzesSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'blogs'), where('author.uid', '==', user.uid))),
          getDocs(query(collection(db, 'quizzes'), where('author.uid', '==', user.uid))),
          getDocs(query(collection(db, 'results'), where('userId', '==', user.uid))),
          getDocs(collection(db, 'quizzes')),
          getDocs(collection(db, 'users')),
        ]);

        setUserBlogs(blogsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setUserQuizzes(myQuizzesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const quizMap = {};
        allQuizzesSnap.docs.forEach((d) => {
          quizMap[d.id] = d.data();
        });

        const historyRows = resultsSnap.docs
          .map((d) => {
            const r = d.data();
            const qMeta = quizMap[r.quizId] || {};
            const percent =
              r.totalQuestions > 0 ? Math.round(((r.correctCount || 0) / r.totalQuestions) * 100) : 0;
            return {
              id: d.id,
              quizId: r.quizId,
              title: qMeta.title || 'Bộ Quiz đã làm',
              type: qMeta.type || '',
              correctCount: r.correctCount || 0,
              totalQuestions: r.totalQuestions || 0,
              percent,
              timestamp: r.timestamp,
            };
          })
          .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setQuizHistory(historyRows);

        setAllUsers(
          usersSnap.docs
            .filter((d) => d.id !== user.uid)
            .map((d) => {
              const data = d.data();
              // Privacy guard: exclude email field from community directory state
              return {
                id: d.id,
                firstName: data.firstName || 'Thành viên',
                photo: data.photo || '',
                discoveredCount: Array.isArray(data.discoveredProvinces)
                  ? new Set(
                      data.discoveredProvinces
                        .map((s) => SLUG_MIGRATION_MAP[s] || s)
                        .filter((s) => PROVINCE_BY_SLUG[s])
                    ).size
                  : 0,
              };
            }),
        );
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        toast.error('Không thể tải đầy đủ dữ liệu hồ sơ.');
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleTabChange = (nextTab) => {
    const next = new URLSearchParams(searchParams);
    if (nextTab === 'overview') next.delete('tab');
    else next.set('tab', nextTab);
    setSearchParams(next, { replace: true });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Đã đăng xuất tài khoản');
      navigate('/');
    } catch (err) {
      toast.error('Không thể đăng xuất lúc này.');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!authUser) return;
    const cleanName = firstName.trim();
    if (!cleanName) {
      toast.warning('Tên hiển thị không được để trống.');
      return;
    }

    setSavingProfile(true);
    try {
      const updated = { firstName: cleanName };
      if (avatarFile) {
        updated.photo = await uploadImageWithFallback(avatarFile, `profilePics/${authUser.uid}`, {
          maxWidth: 256,
          quality: 0.8,
        });
      }
      await updateDoc(doc(db, 'users', authUser.uid), updated);
      setUserDetails((prev) => ({ ...prev, ...updated }));
      setAvatarFile(null);
      toast.success('Đã cập nhật thông tin hồ sơ!');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Không thể cập nhật hồ sơ lúc này.');
    } finally {
      setSavingProfile(false);
    }
  };

  const avgQuizAccuracy = useMemo(() => {
    if (quizHistory.length === 0) return 0;
    const total = quizHistory.reduce((sum, item) => sum + item.percent, 0);
    return Math.round(total / quizHistory.length);
  }, [quizHistory]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return allUsers.slice(0, 12);
    return allUsers.filter((m) => m.firstName.toLowerCase().includes(q));
  }, [allUsers, memberSearch]);

  if (!authReady) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!authUser) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto px-4 py-16">
          <EmptyState
            icon={User}
            title="Đăng nhập để mở Bảng điều khiển Học tập"
            description="Theo dõi Hộ chiếu 34 tỉnh thành, lịch sử điểm Quiz, kế hoạch ôn tập và các bài viết bạn đã chia sẻ."
            actionLabel="Đăng nhập ngay"
            actionTo="/login"
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* PROFILE HEADER BANNER */}
      <section className="bg-heritage-paper border-b border-heritage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Breadcrumb className="mb-5" items={[{ label: 'Trang chủ', to: '/' }, { label: 'Hồ sơ học tập' }]} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <UserAvatar
                src={avatarPreview || userDetails?.photo}
                name={userDetails?.firstName || 'Học sinh'}
                sizeClass="w-20 h-20 sm:w-24 sm:h-24"
                textClass="text-2xl"
                className="border-2 border-white shadow-md"
              />
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="jade">Thành viên HTLVN</Badge>
                  <Badge variant="gold">{stats.count}/34 tỉnh</Badge>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-ink">
                  {userDetails?.firstName || 'Thành viên'}
                </h1>
                <p className="text-xs sm:text-sm text-heritage-muted">{userDetails?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button to="/messages" variant="secondary" size="sm">
                <MessageSquare className="w-4 h-4" />
                Hộp thư tin nhắn
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTabChange('settings')}
              >
                <Settings className="w-4 h-4" />
                Chỉnh sửa
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            </div>
          </div>

          <div className="mt-7">
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={[
                { key: 'overview', label: 'Tổng quan học tập', icon: Trophy },
                {
                  key: 'content',
                  label: 'Nội dung của tôi',
                  icon: BookOpen,
                  count: userBlogs.length + userQuizzes.length,
                },
                { key: 'settings', label: 'Cài đặt & Cộng đồng', icon: Settings },
              ]}
            />
          </div>
        </div>
      </section>

      {/* TAB CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Heritage Passport Card */}
              <Card className="lg:col-span-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="vermilion" className="mb-2">
                      <Compass className="w-3.5 h-3.5" />
                      Hộ chiếu Di sản 34 tỉnh
                    </Badge>
                    <h2 className="font-serif text-xl font-bold text-heritage-ink">
                      Hành trình khám phá Việt Nam
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-bold text-heritage-vermilion">{stats.percent}%</p>
                    <p className="text-xs text-heritage-muted">
                      {stats.count}/{stats.total} tỉnh thành
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'bac', label: 'Miền Bắc', count: stats.byRegion.bac, total: regionTotals.bac, color: 'bg-heritage-vermilion' },
                    { key: 'trung', label: 'Miền Trung', count: stats.byRegion.trung, total: regionTotals.trung, color: 'bg-heritage-gold' },
                    { key: 'nam', label: 'Miền Nam', count: stats.byRegion.nam, total: regionTotals.nam, color: 'bg-heritage-jade' },
                  ].map((reg) => {
                    const pct = reg.total > 0 ? Math.round((reg.count / reg.total) * 100) : 0;
                    return (
                      <div key={reg.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-heritage-ink">{reg.label}</span>
                          <span className="text-heritage-muted">
                            {reg.count}/{reg.total} tỉnh
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-heritage-paper overflow-hidden">
                          <div className={`h-full rounded-full ${reg.color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-heritage-border flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-heritage-ink">
                    <Layers className="w-4 h-4 text-heritage-gold" />
                    Đã thuộc {stats.masteredCardsCount} thẻ Flashcard 3D
                  </span>
                  <Button to="/provinces" variant="primary" size="sm">
                    Mở Atlas 34 tỉnh
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>

              {/* Quiz Stats & History Card */}
              <Card className="lg:col-span-6 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="jade" className="mb-2">
                      <ListChecks className="w-3.5 h-3.5" />
                      Thành tích Quiz
                    </Badge>
                    <h2 className="font-serif text-xl font-bold text-heritage-ink">Thống kê &amp; Lịch sử làm bài</h2>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="font-serif text-2xl font-bold text-heritage-jade">{quizHistory.length}</p>
                      <p className="text-xs text-heritage-muted">Bài đã làm</p>
                    </div>
                    <div>
                      <p className="font-serif text-2xl font-bold text-heritage-gold">{avgQuizAccuracy}%</p>
                      <p className="text-xs text-heritage-muted">Độ chính xác TB</p>
                    </div>
                  </div>
                </div>

                {quizHistory.length === 0 ? (
                  <div className="rounded-xl bg-heritage-paper/70 p-6 text-center space-y-3">
                    <p className="text-sm text-heritage-muted">Bạn chưa hoàn thành bài Quiz nào.</p>
                    <Button to="/listquiz" variant="outline" size="sm">
                      Thử làm bài Quiz ngay
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {quizHistory.map((item) => {
                      const meta = getQuizMeta(item.type);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-heritage-cream/70 border border-heritage-border"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-heritage-ink truncate">{item.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-heritage-muted">
                              <span>{meta.shortLabel}</span>
                              {item.timestamp && <span>· {formatRelativeTimeVi(item.timestamp)}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <Badge variant={item.percent >= 70 ? 'jade' : 'gold'}>
                              {item.correctCount}/{item.totalQuestions}
                            </Badge>
                            <Link
                              to={`/listquiz/${item.quizId}`}
                              className="text-xs font-bold text-heritage-vermilion hover:underline"
                            >
                              Làm lại
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Study Planner Card */}
            <Card className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-heritage-gold-soft text-amber-800 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-heritage-ink">Kế hoạch học tập cá nhân</h2>
                  <p className="text-xs text-heritage-muted">
                    Đặt lịch ôn tập Lịch Sử &amp; GDĐP theo tuần để theo dõi tiến độ
                  </p>
                </div>
              </div>
              <StudyBot userId={authUser.uid} />
            </Card>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-10">
            {/* My Blogs */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold text-heritage-ink">
                  Bài viết của tôi ({userBlogs.length})
                </h2>
                <div className="flex gap-2">
                  <Button to="/mypost" variant="outline" size="sm">
                    Quản lý Blog
                  </Button>
                  <Button to="/blogcreate" variant="primary" size="sm">
                    <PenSquare className="w-4 h-4" />
                    Viết bài mới
                  </Button>
                </div>
              </div>

              {userBlogs.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Bạn chưa có bài viết nào"
                  description="Chia sẻ bài viết phân tích lịch sử hoặc di sản địa phương đầu tiên của bạn."
                  actionLabel="Viết bài ngay"
                  actionTo="/blogcreate"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {userBlogs.map((blog) => (
                    <Card key={blog.id} padding="p-0" className="overflow-hidden flex flex-col justify-between">
                      <div>
                        <SmartImage
                          src={blog.CoverURL}
                          fallbackSrc={getSmartBlogFallbackCover(blog)}
                          alt={blog.Title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4 space-y-1.5">
                          <p className="text-xs text-heritage-muted">{formatViDate(blog.published_on)}</p>
                          <h3 className="font-serif font-bold text-heritage-ink line-clamp-2">{blog.Title}</h3>
                          <p className="text-xs text-heritage-muted line-clamp-2">{stripHtml(blog.Sapo)}</p>
                        </div>
                      </div>
                      <div className="px-4 pb-4 flex gap-2">
                        <Button to={`/blog/${blog.id}`} variant="secondary" size="sm" className="flex-1">
                          Xem bài
                        </Button>
                        <Button to={`/blog/edit/${blog.id}`} variant="outline" size="sm">
                          Sửa
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* My Quizzes */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold text-heritage-ink">
                  Bộ Quiz của tôi ({userQuizzes.length})
                </h2>
                <div className="flex gap-2">
                  <Button to="/myquiz" variant="outline" size="sm">
                    Quản lý Quiz
                  </Button>
                  <Button to="/createquiz" variant="primary" size="sm">
                    <PlusCircle className="w-4 h-4" />
                    Tạo Quiz mới
                  </Button>
                </div>
              </div>

              {userQuizzes.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  title="Bạn chưa tạo bộ Quiz nào"
                  description="Tạo bộ câu hỏi ôn tập cá nhân hoặc dùng AI tạo nhanh từ SGK."
                  actionLabel="Tạo Quiz ngay"
                  actionTo="/createquiz"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {userQuizzes.map((quiz) => {
                    const meta = getQuizMeta(quiz.type);
                    return (
                      <Card key={quiz.id} padding="p-5" className="flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={meta.badgeVariant}>{meta.shortLabel}</Badge>
                            <span className="text-xs font-semibold text-heritage-muted">
                              {quiz.questions?.length || 0} câu
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-lg text-heritage-ink line-clamp-2">{quiz.title}</h3>
                          {quiz.description && (
                            <p className="text-xs text-heritage-muted line-clamp-2">{quiz.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button to={`/listquiz/${quiz.id}`} variant="secondary" size="sm" className="flex-1">
                            Làm thử
                          </Button>
                          <Button to={`/editquiz/${quiz.id}`} variant="outline" size="sm">
                            Sửa
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Profile Edit Form */}
            <Card className="lg:col-span-5 space-y-5">
              <h2 className="font-serif text-xl font-bold text-heritage-ink">Chỉnh sửa thông tin cá nhân</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={avatarPreview || userDetails?.photo}
                    name={firstName || userDetails?.firstName || 'Học sinh'}
                    sizeClass="w-16 h-16"
                    textClass="text-lg"
                  />
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-heritage-border bg-heritage-cream/60 hover:bg-heritage-paper text-xs font-semibold text-heritage-ink cursor-pointer">
                    <Upload className="w-4 h-4 text-heritage-vermilion" />
                    <span>{avatarFile ? avatarFile.name : 'Đổi ảnh đại diện'}</span>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="profile-name">
                    Tên hiển thị *
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    maxLength={30}
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heritage-ink mb-1.5">Email tài khoản</label>
                  <input
                    type="text"
                    disabled
                    value={userDetails?.email || ''}
                    className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-heritage-paper text-sm text-heritage-muted cursor-not-allowed"
                  />
                </div>

                <Button type="submit" variant="primary" size="md" disabled={savingProfile} className="w-full">
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang lưu thay đổi...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Privacy-safe Community Directory */}
            <Card className="lg:col-span-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-xl font-bold text-heritage-ink">Cộng đồng học tập HTLVN</h2>
                  <p className="text-xs text-heritage-muted">Tìm bạn học cùng tiến, xem bài viết hoặc nhắn tin trao đổi</p>
                </div>
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-heritage-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Tìm tên thành viên..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-heritage-border bg-heritage-cream/50 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                  />
                </div>
              </div>

              {filteredMembers.length === 0 ? (
                <p className="text-sm text-heritage-muted py-4">Không tìm thấy thành viên nào khớp từ khóa.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-heritage-border bg-heritage-cream/40"
                    >
                      <Link to={`/profile/${member.id}`} className="flex items-center gap-2.5 min-w-0 group">
                        <UserAvatar
                          src={member.photo}
                          name={member.firstName}
                          sizeClass="w-10 h-10"
                          textClass="text-xs"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-heritage-ink group-hover:text-heritage-vermilion truncate">
                            {member.firstName}
                          </p>
                          <p className="text-[11px] text-heritage-muted">
                            {member.discoveredCount > 0 ? `${member.discoveredCount}/34 tỉnh` : 'Thành viên HTLVN'}
                          </p>
                        </div>
                      </Link>

                      <Button to={`/messages/${member.id}`} variant="outline" size="sm" className="shrink-0">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Nhắn
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </section>
    </MainLayout>
  );
}

export default Profile;
