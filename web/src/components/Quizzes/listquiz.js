import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';
import '../Blogs/blog.css';
import './quiz.css';

function QuizzesList() {
    const [quizzes, setQuizzes] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const [selectedType, setSelectedType] = useState('all');
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [userResults, setUserResults] = useState({});

    useEffect(() => {
        const fetchQuizzes = async () => {
            const querySnapshot = await getDocs(collection(db, 'quizzes'));
            const quizzesList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setQuizzes(quizzesList);
            setFilteredQuizzes(quizzesList);
        };

        fetchQuizzes();
    }, []);

    const fetchUserResults = async (user) => {
        const resultsQuery = query(collection(db, 'results'), where('userId', '==', user.uid));
        const resultsSnapshot = await getDocs(resultsQuery);
        const resultsData = {};
        resultsSnapshot.forEach((doc) => {
            const data = doc.data();
            resultsData[data.quizId] = data;
        });
        setUserResults(resultsData);
    };

    useEffect(() => {
        if (selectedType === 'all') {
            setFilteredQuizzes(quizzes);
        } else {
            setFilteredQuizzes(quizzes.filter((quiz) => quiz.type === selectedType));
        }
    }, [selectedType, quizzes]);

    const coverImages = {
        ls10: '/Img/ls10.png',
        ls11: '/Img/ls11.png',
        ls12: '/Img/ls12.png',
        dp10: '/Img/dp10.png',
        dp11: '/Img/dp11.png',
        default: '/Img/default.png',
    };

    const getCoverImage = (type) => {
        return coverImages[type] || coverImages['default'];
    };

    //Lấy dữ liệu user
    const fetchUserData = async (user) => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setUserDetails(docSnap.data());
        } else {
            const newUserDetails = {
                firstName: user.displayName,
                email: user.email,
                photo: user.photoURL,
            };
            await setDoc(docRef, newUserDetails);
            setUserDetails(newUserDetails);
        }
    };

    //Xem user
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserData(user);
                fetchUserResults(user);
            } else {
                console.log('User is not logged in');
            }
        });
        return () => unsubscribe();
    }, []);

    const formatTimestamp = (timestamp) => {
        const seconds = Math.floor((new Date() - timestamp.toDate()) / 1000);

        // Define time intervals in seconds
        const intervals = {
            y: 31536000,
            t: 2592000,
            d: 86400,
            h: 3600,
            m: 60,
        };

        // Determine the appropriate interval
        for (const [unit, intervalSeconds] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / intervalSeconds);
            if (interval >= 1) {
                return `${interval}${unit} trước`;
            }
        }

        // If less than a minute, show seconds ago
        return `${Math.floor(seconds)}s trước`;
    };

    return (
        <>
            <Header />
            <div>
                <div className="menu-container-blog">
                    <div className="menu-item">
                        {userDetails && (
                            <div className="blog-profile special-profile">
                                <img
                                    src={userDetails.photo || '/logo192.png'}
                                    alt="User Avatar"
                                    className="user-avatar"
                                />
                                <span className="displayName">{userDetails.firstName}</span>
                            </div>
                        )}

                        {!userDetails && (
                            <h2 style={{ color: '#292929' }} className="">
                                Chưa Đăng nhập
                            </h2>
                        )}
                    </div>

                    <div className="add-delete-container">
                        <Link to="/createquiz" className="menu-item add-post">
                            Tạo bài quiz
                        </Link>

                        <Link to="/myquiz" className="menu-item edit-delete-post">
                            Quiz của tôi
                        </Link>
                    </div>
                </div>
                <section className="courses courses-special course-quiz">
                    <div className="filter-card">
                        <button className="dol-button" onClick={() => setSelectedType('all')}>
                            Tất cả
                        </button>
                        <button className="dol-button" onClick={() => setSelectedType('ls10')}>
                            Lịch Sử 10
                        </button>
                        <button className="dol-button" onClick={() => setSelectedType('ls11')}>
                            Lịch Sử 11
                        </button>
                        <button className="dol-button" onClick={() => setSelectedType('ls12')}>
                            Lịch Sử 12
                        </button>
                        <button className="dol-button" onClick={() => setSelectedType('dp10')}>
                            Địa phương 10
                        </button>
                        <button className="dol-button" onClick={() => setSelectedType('dp11')}>
                            Địa Phương 11
                        </button>
                    </div>
                    <div
                        className="quiz-container-special"
                        style={{
                            gap: '0',
                        }}
                    >
                        {filteredQuizzes.map((quiz) => (
                            <Link to={`/listquiz/${quiz.id}`} key={quiz.id}>
                                <div className="box" style={{ padding: '16px' }}>
                                    <div className="thumb" style={{ position: 'relative' }}>
                                        <img
                                            src={getCoverImage(quiz.type)}
                                            alt={quiz.type}
                                            className="quiz-img-thumb"
                                        />

                                        {quiz.completedBy && auth.currentUser && quiz.completedBy.includes(auth.currentUser.uid) && (
                                            <>
                                                {userResults[quiz.id] && (
                                                    <>
                                                        <div className="quiz-complete quiz-complete-active"></div>
                                                        <p className="quiz-complete-active-text">Đã hoàn thành</p>
                                                        <p
                                                            className="quiz-complete-active-text"
                                                            style={{
                                                                justifyContent: 'flex-end',
                                                                alignItems: 'flex-end',
                                                                padding: '10px',
                                                            }}
                                                        >
                                                            Kết quả: {userResults[quiz.id].correctCount} /{' '}
                                                            {userResults[quiz.id].totalQuestions}
                                                        </p>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <h3 className="quiz-list-title blogs-title">{quiz.title}</h3>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            color: '#292929',
                                            alignItems: 'center',
                                            marginTop: '12px',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div
                                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            <img
                                                src={quiz.author.photo || '/logo192.png'}
                                                alt={quiz.author.name}
                                                className="author-photo"
                                            />
                                            <p className="quiz-author-name">{quiz.author.name}</p>
                                        </div>

                                        {userResults[quiz.id] && userResults[quiz.id].timestamp && (
                                            <p style={{ right: '0', fontWeight: '500', fontSize: '16px' }}>
                                                Hoàn thành {formatTimestamp(userResults[quiz.id].timestamp)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

export default QuizzesList;
