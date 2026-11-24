import React, { useState, useEffect } from 'react';
import './Header.css'; // Đảm bảo rằng bạn đã tạo file CSS này
import { Link } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, getDoc, query, limit, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import '../Blogs/blog.css';
import { useNavigate } from 'react-router-dom';

const Header = ({ backgroundColor }) => {
    const navigate = useNavigate();
    const [scroll, setScroll] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userDetails, setUserDetails] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // State để quản lý hiển thị của mini-modal
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024); // State để quản lý kích thước màn hình

    const handleScroll = () => {
        const offset = window.scrollY;
        if (offset > 50) {
            setScroll(true);
        } else {
            setScroll(false);
        }
    };

    const navbarSpecialStyle = {
        background: backgroundColor || 'defaultColor',
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 1024);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    let navbarClasses = ['navbar'];
    if (scroll) {
        navbarClasses.push('scrolled');
    }

    const fetchUserData = async (user) => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setUserDetails(docSnap.data());
        } else {
            // Tạo tài liệu người dùng mới nếu không tồn tại
            const newUserDetails = {
                firstName: user.displayName,
                email: user.email,
                photo: user.photoURL,
            };
            await setDoc(docRef, newUserDetails);
            setUserDetails(newUserDetails);
        }
        setIsLoading(false); // Dữ liệu người dùng đã được tải xong
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserData(user);
            } else {
                setIsLoading(false); // Không có người dùng, kết thúc trạng thái tải
            }
        });
        return () => unsubscribe();
    }, []);

    const handleAvatarClick = () => {
        setIsModalVisible(!isModalVisible); // Toggle hiển thị của mini-modal
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            window.location.reload();
            localStorage.clear();
            console.log('User logged out successfully!');
            window.location.href = '/';
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
    };

    const handleQuizClick = () => {
        if (!userDetails) {
            alert('Đăng nhập để sử dụng tính năng này');
        } else {
            navigate('/listquiz');
        }
    };

    return (
        <>
            <nav className={navbarClasses.join(' ')} style={navbarSpecialStyle}>
                <label htmlFor="menu-toggle" id="hamburger-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </label>
                <input type="checkbox" id="menu-toggle" aria-label="hi" />
                <a href="#hero-section">
                    <img src="./Img/logo.png" className="logoSpecial" alt="" />
                </a>
                <ul className="links">
                    <a href="#hero-section">
                        <img src="./Img/logo.png" className="logo" alt="" />
                    </a>
                    <li>
                        <Link to="/">Trang chủ</Link>
                    </li>
                    <li>
                        <Link to="/provinceMainPage">Tỉnh thành</Link>
                    </li>
                    <li>
                        <Link to="/elearning">Môn học</Link>
                    </li>
                    <li>
                        <Link to="/pratice">Luyện tập</Link>
                    </li>
                    <li onClick={handleQuizClick}>
                        <Link to="">Quiz</Link>
                    </li>
                    <li>
                        <Link to="/bot">ChatBot AI</Link>
                    </li>
                    <li>
                        <Link to="/blog">Blog</Link>
                    </li>
                    <li>
                        <Link to="/contact">Liên hệ</Link>
                    </li>

                    {isLoading ? (
                        <img src={'./logo192.png'} alt="User Avatar" className="user-avatar" />
                    ) : (
                        // Hiển thị loader khi đang tải dữ liệu người dùng
                        <>
                            {userDetails ? (
                                <>
                                    <li>
                                        {isMobileView ? (
                                            <Link to="/profile">
                                                <img
                                                    src={userDetails.photo || './logo192.png'}
                                                    alt="User Avatar"
                                                    className="user-avatar"
                                                />
                                            </Link>
                                        ) : (
                                            <div className="blog-profile" onClick={handleAvatarClick}>
                                                <img
                                                    src={userDetails.photo || './logo192.png'}
                                                    alt="User Avatar"
                                                    className="user-avatar"
                                                />
                                            </div>
                                        )}
                                        <div className={`mini-modal ${isModalVisible ? 'visible' : ''}`}>
                                            <ul className="mini-modal-wrapped">
                                                <div className="user-details">
                                                    <img
                                                        src={
                                                            userDetails.photo ||
                                                            'https://i.postimg.cc/zXkPfDnB/logo192.png'
                                                        }
                                                        alt=""
                                                        className="user-details-avatar"
                                                    />
                                                    <div className="user-section">
                                                        <div className="user-menu-list">
                                                            <div className="name-details">{userDetails.firstName}</div>
                                                            <div className="email-details">{userDetails.email}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <hr />
                                                <div className="user-menu-list">
                                                    <Link
                                                        style={{ padding: '0', fontWeight: '400', color: '#666' }}
                                                        to="/profile"
                                                    >
                                                        Trang cá nhân
                                                    </Link>
                                                </div>
                                                <hr />
                                                <div className="user-menu-list">
                                                    <Link
                                                        style={{ padding: '0', fontWeight: '400', color: '#666' }}
                                                        to="/blogcreate"
                                                    >
                                                        Viết blog
                                                    </Link>
                                                </div>
                                                <div className="user-menu-list">
                                                    <Link
                                                        style={{ padding: '0', fontWeight: '400', color: '#666' }}
                                                        to="/mypost"
                                                    >
                                                        Blog của tôi
                                                    </Link>
                                                </div>
                                                <hr />
                                                <div className="user-menu-list">
                                                    <Link
                                                        style={{ padding: '0', fontWeight: '400', color: '#666' }}
                                                        to="/createquiz"
                                                    >
                                                        Tạo quiz
                                                    </Link>
                                                </div>
                                                <div className="user-menu-list">
                                                    <Link
                                                        style={{ padding: '0', fontWeight: '400', color: '#666' }}
                                                        to="/myquiz"
                                                    >
                                                        Quiz của tôi
                                                    </Link>
                                                </div>
                                                <hr />
                                                <div className="user-menu-list" onClick={handleLogout}>
                                                    Đăng xuất
                                                </div>
                                            </ul>
                                        </div>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <button className="navbar-login-button">
                                            <Link to="/login" className="navbar-login-button">
                                                Đăng nhập
                                            </Link>
                                        </button>
                                    </li>
                                </>
                            )}
                        </>
                    )}
                </ul>
            </nav>
        </>
    );
};

export default Header;
