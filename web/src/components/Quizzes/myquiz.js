import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';

function MyQuiz() {
    const [quizzes, setQuizzes] = useState([]);
    const [userDetails, setUserDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async (uid) => {
            const querySnapshot = await getDocs(collection(db, 'quizzes'));
            const quizzesList = querySnapshot.docs
                .filter((doc) => doc.data().author.uid === uid)
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            setQuizzes(quizzesList);
        };

        const fetchUserData = async (user) => {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserDetails(docSnap.data());
                fetchQuizzes(user.uid);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserData(user);
            } else {
                console.log('User is not logged in');
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const coverImages = {
        ls10: '/Img/ls10.png',
        ls11: '/Img/ls11.png',
        ls12: '/Img/ls12.png',
        dp10: '/Img/dp10.png',
        dp11: '/Img/dp11.png',
        default: '/Img/default.png',
    };

    const getCoverImage = (type) => coverImages[type] || coverImages['default'];

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'quizzes', id));
            setQuizzes(quizzes.filter((quiz) => quiz.id !== id));
        } catch (error) {
            console.error('Error deleting document: ', error);
        }
    };

    return (
        <>
            <div>
                <div className="menu-container-blog">
                    <Link to="#" onClick={() => navigate(-1)} className="go-back">
                        <svg
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fas"
                            data-icon="chevron-left"
                            class="svg-back svg-inline--fa fa-chevron-left "
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                        >
                            <path
                                fill="currentColor"
                                d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z"
                            ></path>
                        </svg>
                        Quay lại
                    </Link>
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
                    </div>
                </div>
                <section className="courses courses-special">
                    <div
                        className="quiz-container-special course-quiz"
                        style={{
                            gap: '0',
                            paddingTop: '0',
                        }}
                    >
                        {quizzes.map((quiz) => (
                            <Link to={`/listquiz/${quiz.id}`} key={quiz.id}>
                                <div className="box" style={{ padding: '16px' }} key={quiz.id}>
                                    <div className="thumb">
                                        <img
                                            src={getCoverImage(quiz.type)}
                                            alt={quiz.type}
                                            className="quiz-img-thumb"
                                        />
                                        {/* <div
                                            className={`quiz-complete ${
                                                quiz.condition === 'complete' ? 'quiz-complete-active' : ''
                                            }`}
                                        ></div>
                                        <p
                                            className={`quiz-complete ${
                                                quiz.condition === 'complete' ? 'quiz-complete-active-text' : ''
                                            }`}
                                        >
                                            Đã hoàn thành
                                        </p> */}
                                    </div>
                                    <h3 className="quiz-list-title blogs-title">{quiz.title}</h3>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'left',
                                            color: '#292929',
                                            alignItems: 'center',
                                            marginTop: '12px',
                                        }}
                                    >
                                        <img src={quiz.author.photo} alt={quiz.author.name} className="author-photo" />
                                        <p>{quiz.author.name}</p>
                                    </div>
                                    <div style={{ marginTop: '24px' }}>
                                        <Link
                                            to={`/editquiz/${quiz.id}`}
                                            className="dol-button special-dol-red"
                                            style={{ marginRight: '12px' }}
                                        >
                                            Chỉnh sửa
                                        </Link>
                                        <Link
                                            to="/myquiz"
                                            onClick={() => handleDelete(quiz.id)}
                                            className="dol-button special-dol-red"
                                        >
                                            Xóa
                                        </Link>
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

export default MyQuiz;
