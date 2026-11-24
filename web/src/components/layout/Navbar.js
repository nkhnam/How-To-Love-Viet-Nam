import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import {
  Menu,
  X,
  ChevronDown,
  User,
  Compass,
  PenSquare,
  FileText,
  PlusCircle,
  ListChecks,
  MessageSquare,
  LogOut,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { db, auth } from '../firebase';
import BrandLogo from '../ui/BrandLogo';

const NAV_ITEMS = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/provinces', label: '63 Tỉnh thành' },
  { to: '/elearning', label: 'Học tập' },
  { to: '/listquiz', label: 'Quiz' },
  { to: '/bot', label: 'Trợ lý AI' },
  { to: '/blog', label: 'Cộng đồng' },
];

/**
 * Primary navigation bar with Heritage styling, mobile drawer auto-close,
 * transparent-on-hero support, and accessible user menu dropdown.
 * Note: Uses explicit pixel sizing so legacy E-learning pages that temporarily alter html font-size
 * in Wave 1 cannot shrink the Navbar.
 */
function Navbar({ transparentOnTop = false, backgroundColor }) {
  const navigate = useNavigate();
  const location = useLocation();
  const useTransparent =
    transparentOnTop ||
    (typeof backgroundColor === 'string' &&
      (backgroundColor.includes('transparent') || backgroundColor.includes('gradient')));

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const fetchUserData = async (user) => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          const newUserDetails = {
            firstName: user.displayName || user.email?.split('@')[0] || 'Học sinh',
            email: user.email || '',
            photo: user.photoURL || '',
          };
          await setDoc(docRef, newUserDetails, { merge: true });
          setUserDetails(newUserDetails);
        }
      } catch (err) {
        console.error('Failed to load user profile in Navbar:', err);
        setUserDetails({
          firstName: user.displayName || 'Thành viên',
          email: user.email || '',
          photo: user.photoURL || '',
        });
      } finally {
        setIsLoadingAuth(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
      } else {
        setUserDetails(null);
        setIsLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUserDetails(null);
      setDropdownOpen(false);
      setMobileOpen(false);
      toast.success('Đã đăng xuất tài khoản');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
      toast.error('Không thể đăng xuất lúc này. Vui lòng thử lại.');
    }
  };

  const isOverlay = useTransparent && !scrolled && !mobileOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isOverlay
          ? 'bg-gradient-to-b from-stone-950/75 via-stone-950/40 to-transparent text-white'
          : 'bg-white/95 backdrop-blur-md border-b border-heritage-border shadow-sm text-heritage-ink'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-[16px] sm:px-[24px] h-[72px] flex items-center justify-between gap-[16px]">
        <Link to="/" className="shrink-0 focus:outline-none" aria-label="HTLVN Trang chủ">
          <BrandLogo variant={isOverlay ? 'dark' : 'light'} size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-[4px]" aria-label="Điều hướng chính">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-[14px] py-[8px] rounded-[10px] text-[14px] font-semibold transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? isOverlay
                      ? 'bg-white/20 text-white backdrop-blur-sm'
                      : 'bg-heritage-vermilion-soft text-heritage-vermilion'
                    : isOverlay
                    ? 'text-white/90 hover:text-white hover:bg-white/10'
                    : 'text-heritage-muted hover:text-heritage-ink hover:bg-heritage-paper'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Auth / User Dropdown */}
        <div className="hidden lg:flex items-center gap-[10px] shrink-0">
          {isLoadingAuth ? (
            <div className="w-[36px] h-[36px] rounded-full bg-heritage-sand/70 animate-pulse" />
          ) : userDetails ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-[8px] pl-[4px] pr-[10px] py-[4px] rounded-full border transition-all cursor-pointer ${
                  isOverlay
                    ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
                    : 'border-heritage-border bg-white text-heritage-ink hover:bg-heritage-paper'
                }`}
              >
                <img
                  src={userDetails.photo || '/logo192.png'}
                  alt={userDetails.firstName || 'Tài khoản'}
                  className="w-[32px] h-[32px] rounded-full object-cover border border-heritage-border bg-heritage-cream"
                />
                <span className="text-[13px] font-semibold max-w-[120px] truncate">
                  {userDetails.firstName || 'Thành viên'}
                </span>
                <ChevronDown
                  className={`w-[15px] h-[15px] transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-[10px] w-[256px] rounded-[16px] bg-white border border-heritage-border shadow-xl py-[8px] text-heritage-ink z-50"
                >
                  <div className="px-[16px] py-[10px] border-b border-heritage-border flex items-center gap-[10px]">
                    <img
                      src={userDetails.photo || '/logo192.png'}
                      alt=""
                      className="w-[40px] h-[40px] rounded-full object-cover border border-heritage-border shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-heritage-ink truncate">
                        {userDetails.firstName || 'Thành viên'}
                      </p>
                      <p className="text-[12px] text-heritage-muted truncate">{userDetails.email}</p>
                    </div>
                  </div>

                  <div className="py-[4px]">
                    <DropdownLink to="/profile" icon={User} label="Trang cá nhân" />
                    <DropdownLink to="/provinces?filter=discovered" icon={Compass} label="Hộ chiếu 63 tỉnh" />
                    <DropdownLink to="/messages" icon={MessageSquare} label="Hộp thư" />
                  </div>

                  <div className="border-t border-heritage-border py-[4px]">
                    <DropdownLink to="/blogcreate" icon={PenSquare} label="Viết blog" />
                    <DropdownLink to="/mypost" icon={FileText} label="Blog của tôi" />
                    <DropdownLink to="/createquiz" icon={PlusCircle} label="Tạo quiz" />
                    <DropdownLink to="/myquiz" icon={ListChecks} label="Quiz của tôi" />
                  </div>

                  <div className="border-t border-heritage-border pt-[4px]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-[10px] px-[16px] py-[9px] text-[13px] font-semibold text-heritage-vermilion hover:bg-heritage-vermilion-soft transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-[16px] h-[16px]" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={`px-[14px] py-[8px] rounded-[10px] text-[14px] font-semibold transition-colors ${
                  isOverlay
                    ? 'text-white hover:bg-white/15'
                    : 'text-heritage-ink hover:bg-heritage-paper'
                }`}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-[16px] py-[8px] rounded-[10px] text-[14px] font-semibold bg-heritage-vermilion text-white hover:bg-heritage-vermilion-dark shadow-sm transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          className={`lg:hidden p-[8px] rounded-[10px] transition-colors cursor-pointer ${
            isOverlay
              ? 'text-white hover:bg-white/15'
              : 'text-heritage-ink hover:bg-heritage-paper'
          }`}
        >
          {mobileOpen ? <X className="w-[24px] h-[24px]" /> : <Menu className="w-[24px] h-[24px]" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-heritage-border shadow-xl max-h-[calc(100vh-72px)] overflow-y-auto text-heritage-ink">
          <div className="px-[16px] py-[16px] space-y-[4px]">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-[14px] py-[11px] rounded-[12px] text-[15px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-heritage-vermilion-soft text-heritage-vermilion'
                      : 'text-heritage-ink hover:bg-heritage-paper'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="block px-[14px] py-[11px] rounded-[12px] text-[15px] font-semibold text-heritage-muted hover:bg-heritage-paper"
            >
              Liên hệ
            </Link>

            <div className="pt-[12px] mt-[12px] border-t border-heritage-border">
              {userDetails ? (
                <div className="space-y-[4px]">
                  <div className="flex items-center gap-[10px] px-[12px] py-[8px]">
                    <img
                      src={userDetails.photo || '/logo192.png'}
                      alt=""
                      className="w-[38px] h-[38px] rounded-full object-cover border border-heritage-border"
                    />
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold truncate">{userDetails.firstName}</p>
                      <p className="text-[12px] text-heritage-muted truncate">{userDetails.email}</p>
                    </div>
                  </div>
                  <DropdownLink to="/profile" icon={User} label="Trang cá nhân" onClick={() => setMobileOpen(false)} />
                  <DropdownLink
                    to="/provinces?filter=discovered"
                    icon={Compass}
                    label="Hộ chiếu 63 tỉnh"
                    onClick={() => setMobileOpen(false)}
                  />
                  <DropdownLink to="/blogcreate" icon={PenSquare} label="Viết blog" onClick={() => setMobileOpen(false)} />
                  <DropdownLink to="/createquiz" icon={PlusCircle} label="Tạo quiz" onClick={() => setMobileOpen(false)} />
                  <DropdownLink to="/messages" icon={MessageSquare} label="Hộp thư" onClick={() => setMobileOpen(false)} />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-[10px] px-[16px] py-[10px] rounded-[10px] text-[14px] font-semibold text-heritage-vermilion hover:bg-heritage-vermilion-soft text-left cursor-pointer"
                  >
                    <LogOut className="w-[16px] h-[16px]" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-[10px]">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-[6px] py-[11px] rounded-[12px] border border-heritage-border text-[14px] font-semibold text-heritage-ink hover:bg-heritage-paper"
                  >
                    <LogIn className="w-[16px] h-[16px]" />
                    <span>Đăng nhập</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-[6px] py-[11px] rounded-[12px] bg-heritage-vermilion text-white text-[14px] font-semibold hover:bg-heritage-vermilion-dark"
                  >
                    <Sparkles className="w-[16px] h-[16px]" />
                    <span>Đăng ký</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      role="menuitem"
      className="flex items-center gap-[10px] px-[16px] py-[9px] text-[13px] font-medium text-heritage-ink hover:bg-heritage-paper transition-colors"
    >
      <Icon className="w-[16px] h-[16px] text-heritage-muted shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

export default Navbar;
