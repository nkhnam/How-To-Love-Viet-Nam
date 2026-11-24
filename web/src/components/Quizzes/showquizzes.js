import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; // Import Firebase configuration
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth } from '../firebase'; // Make sure you have configured Firebase Auth in your firebase.js
import './quiz.css';
import correct from './right.m4a';
import wrong from './wrong.m4a';
import { Link } from 'react-router-dom';

function ShowQuiz() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null); // Set the quiz
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Set the question that users are in
    const [selectedOption, setSelectedOption] = useState(null); // The answer index that user choose (FITB)
    const [showResult, setShowResult] = useState(false); // Set show the result
    const [isCorrect, setIsCorrect] = useState(null); // Check the answer (MC & FITB)
    const [activeIndex, setActiveIndex] = useState(null); // The answer index that user choose (MC
    const [userAnswers, setUserAnswers] = useState([]); // Store user answers include FITB and MC
    const [showModal, setShowModal] = useState(false); // Set the explain box
    const [blankAnswer, setBlankAnswer] = useState(''); // Get the answert for fill in the blank
    const [isIntro, setIsIntro] = useState(true); // Find and create intro page
    const [randomImage, setRandomImage] = useState(''); //Random welcome Img
    const [correctCount, setCorrectCount] = useState(0); // Track correct answers
    const [resultDocId, setResultDocId] = useState(null); // Track the result document ID

    const handleModalClose = () => {
        setShowModal(false);
    };

    const handleShowAnswer = () => {
        setShowModal(true);
    };

    const welcomeImages = [
        '../Img/eddy.png',
        '../Img/junior.png',
        '../Img/bear.png',
        '../Img/lily.png',

        // Thêm các liên kết ảnh khác tại đây
    ];

    useEffect(() => {
        const saveStateToLocalStorage = () => {
            const state = {
                currentQuestionIndex,
                userAnswers,
                showResult,
                isCorrect,
                isIntro,
            };
            localStorage.setItem(`quizState_${id}`, JSON.stringify(state));
        };

        window.addEventListener('beforeunload', saveStateToLocalStorage);
        return () => {
            window.removeEventListener('beforeunload', saveStateToLocalStorage);
        };
    }, [currentQuestionIndex, userAnswers, showResult, isCorrect, isIntro, id]);

    useEffect(() => {
        const fetchQuiz = async () => {
            const docRef = doc(db, 'quizzes', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setQuiz(docSnap.data());
            } else {
                console.error('No such document!');
            }
        };

        const loadStateFromLocalStorage = () => {
            const savedState = JSON.parse(localStorage.getItem(`quizState_${id}`));
            if (savedState) {
                setCurrentQuestionIndex(savedState.currentQuestionIndex);
                setUserAnswers(savedState.userAnswers);
                setShowResult(savedState.showResult);
                setIsCorrect(savedState.isCorrect);
                setIsIntro(savedState.isIntro);
                if (savedState.userAnswers[savedState.currentQuestionIndex] !== undefined) {
                    setSelectedOption(savedState.userAnswers[savedState.currentQuestionIndex]);
                    setActiveIndex(savedState.userAnswers[savedState.currentQuestionIndex]);
                    if (quiz && quiz.questions[savedState.currentQuestionIndex].type === 'fillInTheBlank') {
                        setBlankAnswer(savedState.userAnswers[savedState.currentQuestionIndex]);
                    }
                }
            }
        };

        fetchQuiz().then(loadStateFromLocalStorage);
    }, [id]);

    // Fetch existing result document for the user and quiz
    useEffect(() => {
        const fetchResultDocument = async () => {
            const user = auth.currentUser;
            if (user) {
                const resultsRef = collection(db, 'results');
                const q = query(resultsRef, where('userId', '==', user.uid), where('quizId', '==', id));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docSnapshot = querySnapshot.docs[0];
                    setResultDocId(docSnapshot.id);
                }
            }
        };
        fetchResultDocument();
    }, [id]);

    const currentQuestion = quiz ? quiz.questions[currentQuestionIndex] : null;

    useEffect(() => {
        if (currentQuestion) {
            if (userAnswers[currentQuestionIndex] !== undefined) {
                setSelectedOption(userAnswers[currentQuestionIndex]);
                setActiveIndex(userAnswers[currentQuestionIndex]);
                if (currentQuestion.type === 'fillInTheBlank') {
                    setBlankAnswer(userAnswers[currentQuestionIndex]);
                }
            } else {
                setSelectedOption(null);
                setActiveIndex(null);
                if (currentQuestion.type === 'fillInTheBlank') {
                    setBlankAnswer('');
                }
            }
        }
    }, [currentQuestionIndex, userAnswers, currentQuestion]);

    useEffect(() => {
        const setUserHasInteracted = () => {
            document.userHasInteracted = true;
        };

        window.addEventListener('click', setUserHasInteracted);
        window.addEventListener('keydown', setUserHasInteracted);

        return () => {
            window.removeEventListener('click', setUserHasInteracted);
            window.removeEventListener('keydown', setUserHasInteracted);
        };
    }, []);

    useEffect(() => {
        if (showResult !== null) {
            if (isCorrect !== null) {
                isCorrect ? correctSound() : wrongSound();
            }
        }
    }, [showResult, isCorrect]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * welcomeImages.length);
        setRandomImage(welcomeImages[randomIndex]);
    }, []);

    const correctSound = () => {
        const correctAudio = new Audio(correct);
        if (document.userHasInteracted) correctAudio.play();
    };

    const wrongSound = () => {
        const wrongAudio = new Audio(wrong);
        if (document.userHasInteracted) wrongAudio.play();
    };

    if (!quiz) {
        return <div>Loading...</div>;
    }

    const handleItemClick = (index) => {
        if (!showResult) {
            setActiveIndex(index);
            setSelectedOption(index);
        }
    };

    const handleOptionChange = (index) => {
        setSelectedOption(index);
    };

    const handleBlankChange = (e) => {
        setBlankAnswer(e.target.value);
    };

    const handleButtonClick = async () => {
        if (isIntro) {
            setIsIntro(false);
        } else if (!showResult) {
            if (currentQuestion.type === 'multipleChoice') {
                if (selectedOption === null) return;
                const correctIndex = quiz.questions[currentQuestionIndex].correctOptionIndex;
                const isCorrectAnswer = selectedOption === correctIndex;
                setIsCorrect(isCorrectAnswer);
                if (isCorrectAnswer) setCorrectCount(correctCount + 1);
                const updatedAnswers = [...userAnswers];
                updatedAnswers[currentQuestionIndex] = selectedOption;
                setUserAnswers(updatedAnswers);
            } else if (currentQuestion.type === 'fillInTheBlank') {
                const isCorrectAnswer =
                    blankAnswer.trim().toLowerCase() === currentQuestion.blankAnswer.trim().toLowerCase();
                setIsCorrect(isCorrectAnswer);
                if (isCorrectAnswer) setCorrectCount(correctCount + 1);
                const updatedAnswers = [...userAnswers];
                updatedAnswers[currentQuestionIndex] = blankAnswer;
                setUserAnswers(updatedAnswers);
            }
            setShowResult(true);
            setShowModal(false);
        } else {
            setShowResult(false);
            setIsCorrect(null);
            setShowModal(false);
            setActiveIndex(null);
            setBlankAnswer('');
            if (currentQuestionIndex < quiz.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                console.log('Quiz completed');
                // Get the current user
                const user = auth.currentUser;
                if (user) {
                    try {
                        const quizRef = doc(db, 'quizzes', id);
                        await updateDoc(quizRef, {
                            completedBy: arrayUnion(user.uid),
                        });
                        // Check if result document exists
                        if (resultDocId) {
                            const resultRef = doc(db, 'results', resultDocId);
                            await updateDoc(resultRef, {
                                userAnswers,
                                correctCount,
                                totalQuestions: quiz.questions.length,
                                timestamp: new Date(),
                            });
                        } else {
                            const resultRef = collection(db, 'results');
                            await addDoc(resultRef, {
                                userId: user.uid,
                                quizId: id,
                                userAnswers,
                                correctCount,
                                totalQuestions: quiz.questions.length,
                                timestamp: new Date(),
                            });
                        }

                        setResultDocId(null); // Reset result document ID
                    } catch (error) {
                        console.error('Error updating result document: ', error);
                    }
                } else {
                    console.error('No user is signed in.');
                }

                setCurrentQuestionIndex(0);
                setSelectedOption(null);
                setUserAnswers([]);
                setCorrectCount(0);
                localStorage.removeItem(`quizState_${id}`);
                navigate('/listquiz');
            }
        }
    };

    const handleBackProgressBack = () => {
        window.location.reload();
        navigate(-1);
    };

    const handleBackButtonClick = () => {
        if (currentQuestionIndex > 0) {
            const prevQuestionIndex = currentQuestionIndex - 1;
            const prevQuestion = quiz.questions[prevQuestionIndex];
            const prevAnswer = userAnswers[prevQuestionIndex];

            setShowResult(true);

            if (prevQuestion.type === 'multipleChoice') {
                const correctIndex = prevQuestion.correctOptionIndex;
                setIsCorrect(prevAnswer === correctIndex);
            } else if (prevQuestion.type === 'fillInTheBlank') {
                setIsCorrect(prevAnswer.trim().toLowerCase() === prevQuestion.blankAnswer.trim().toLowerCase());
                setBlankAnswer(prevAnswer);
            }

            setCurrentQuestionIndex(prevQuestionIndex);
            setSelectedOption(prevAnswer);
            setActiveIndex(prevAnswer);
        }
    };

    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const progressSpecial = (currentQuestionIndex / quiz.questions.length) * 100;

    const correctAnswer =
        currentQuestion?.type === 'multipleChoice'
            ? currentQuestion.options[currentQuestion.correctOptionIndex]
            : currentQuestion.blankAnswer;

    let footerBackgroundColor = 'white';
    let footerBorder = '1px solid rgb(210, 211, 217)';
    if (showResult) {
        footerBackgroundColor = isCorrect ? '#ebf3ee' : '#fcebe7';
        footerBorder = 'none';
    }

    if (isIntro) {
        return (
            <div className="quiz-container">
                <div className="header-progress">
                    <Link to="#" onClick={handleBackProgressBack} style={{ color: '#292929' }}>
                        <div className="back-logo">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-arrow-left"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M15 8a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 0 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 7.5H14.5a.5.5 0 0 1 .5.5z"
                                />
                            </svg>
                        </div>
                    </Link>
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progressSpecial}%` }}></div>
                    </div>
                </div>
                <div
                    className="quiz-body-section"
                    style={{ display: 'flex', flexDirection: 'row-reverse', marginTop: '80px' }}
                >
                    <div className="flex-welcomeImg" style={{ marginLeft: '12px' }}>
                        <h2 style={{ fontSize: '36px', maxWidth: '', color: '#292929' }}>{quiz.title}</h2>
                        <p style={{ fontSize: '24px', maxWidth: '', color: '#292929', fontStyle: 'italic' }}>
                            {quiz.description}
                        </p>
                    </div>
                    <img
                        className="boy-welcomeImg"
                        src={randomImage}
                        alt=""
                        style={{ width: '140px', height: '100%' }}
                    />
                </div>
                <footer
                    className="quiz-footer"
                    style={{ backgroundColor: footerBackgroundColor, border: footerBorder }}
                >
                    <div className="quiz-footer-container" style={{ float: 'right' }}>
                        <button className="dol-button special-dol-red" onClick={handleButtonClick}>
                            Bắt đầu nào!
                        </button>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <>
            <div className="quiz-container">
                <div className="header-progress">
                    <Link to="#" onClick={handleBackProgressBack} style={{ color: '#292929' }}>
                        <div className="back-logo">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                width="1em"
                                height="1em"
                                data-testid="SvgComponent"
                                className="quiz-close"
                            >
                                <path
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    d="M6.226 4.811A1 1 0 004.81 6.225L10.586 12l-5.774 5.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.415 12l5.774-5.775a1 1 0 10-1.414-1.414L12 10.586 6.226 4.81z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </div>
                    </Link>

                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                <div className="quiz-body-section">
                    <h1 className="quiz-title">{quiz.title}</h1>
                    <div>
                        {currentQuestion.type === 'multipleChoice' && (
                            <>
                                <h2 className="quiz-question">{currentQuestion.question}</h2>
                                <div className="multiple-choice-container">
                                    <div className="multiple-choice-wrapped">
                                        {currentQuestion.options.map((option, index) => {
                                            const correctIndex =
                                                quiz.questions[currentQuestionIndex].correctOptionIndex;
                                            const isCorrectOption = showResult && index === correctIndex;
                                            const isIncorrectOption =
                                                showResult && selectedOption === index && index !== correctIndex;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`multiple-choice-item ${
                                                        isCorrectOption ? 'correct' : ''
                                                    } ${isIncorrectOption ? 'incorrect' : ''} ${
                                                        index === activeIndex ? 'active' : ''
                                                    }`}
                                                    onClick={() => handleItemClick(index)}
                                                >
                                                    <div className="multiple-choice-item-wrapped">
                                                        <label
                                                            htmlFor={`option${index}`}
                                                            className={`label-style ${
                                                                index === activeIndex ||
                                                                (showResult && selectedOption === index)
                                                                    ? 'label-style-active'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <input
                                                                style={{ display: 'none' }}
                                                                type="radio"
                                                                id={`option${index}`}
                                                                name="option"
                                                                value={index}
                                                                checked={selectedOption === index}
                                                                onChange={() => handleOptionChange(index)}
                                                                disabled={showResult}
                                                            />
                                                            <div
                                                                className={`number-option ${
                                                                    index === activeIndex ||
                                                                    (showResult && selectedOption === index)
                                                                        ? 'active-option'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {String.fromCharCode(65 + index)}
                                                            </div>
                                                            <div className="option-style">{option}</div>
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {currentQuestion.type === 'fillInTheBlank' && (
                            <>
                                <h2 className="quiz-question">Điền vào chỗ trống</h2>
                                <h2
                                    className="quiz-question"
                                    style={{ fontSize: '24px', fontWeight: '600', marginTop: '16px' }}
                                >
                                    {currentQuestion.question}
                                </h2>
                                <div className="fill-in-the-blank-container">
                                    <input
                                        style={{ marginTop: '16px', fontSize: '18px', backgroundColor: 'white' }}
                                        type="text"
                                        className="input-effect"
                                        placeholder="Điền vào chỗ trống"
                                        value={blankAnswer}
                                        onChange={handleBlankChange}
                                        disabled={showResult}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <footer className="quiz-footer" style={{ backgroundColor: footerBackgroundColor, border: footerBorder }}>
                <div className="quiz-footer-container">
                    {showResult && (
                        <div className="check-container">
                            <img
                                src={
                                    isCorrect
                                        ? 'https://th.bing.com/th/id/R.85c14dfeb8edd88f62b5bbfe671f0108?rik=T38yCB6ZWsrEdA&riu=http%3a%2f%2fclipart-library.com%2fimages_k%2fgreen-checkmark-transparent%2fgreen-checkmark-transparent-17.png&ehk=XzHgRYQ3s7cSIB3YzfqPKv4s787lzN9vDBRhCfmVfH0%3d&risl=&pid=ImgRaw&r=0'
                                        : 'https://cdn3.iconfinder.com/data/icons/simple-web-navigation/165/cross-512.png'
                                }
                                alt=""
                                className="check-icon"
                            />
                            <p style={{ color: isCorrect ? 'green' : 'rgb(222, 53, 11)' }} className="check-text">
                                {isCorrect ? 'Chính xác' : 'Sai mất rồi'}
                            </p>
                        </div>
                    )}

                    <div className="show-explain">
                        {currentQuestionIndex > 0 && !showResult && (
                            <div className="back-quiz-button" onClick={handleBackButtonClick}>
                                <div className="back-quiz-button-wrapped">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        width="1em"
                                        height="1em"
                                        fontSize="24"
                                        data-testid="SvgComponent"
                                        className="back-arrow"
                                    >
                                        <path
                                            fill="currentColor"
                                            fillRule="evenodd"
                                            d="M20.329 11v2H7.5l3.243 3.243-1.414 1.414L3.672 12l5.657-5.657 1.414 1.414L7.5 11h12.83z"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </div>
                            </div>
                        )}

                        {showResult && (
                            <>
                                {showModal && (
                                    <div className="modal">
                                        <div className="modal-content">
                                            <div className="modal-body">
                                                <span className="close" onClick={handleModalClose}>
                                                    &times;
                                                </span>
                                                <h2 className="explain-modal-title">✏️ Câu hỏi và đáp án</h2>
                                                <p style={{ marginBottom: '8px', fontSize: '18px' }}>
                                                    {currentQuestion.question}
                                                </p>
                                                <div className="correct-answer">
                                                    <p>
                                                        <img
                                                            src="https://th.bing.com/th/id/R.85c14dfeb8edd88f62b5bbfe671f0108?rik=T38yCB6ZWsrEdA&riu=http%3a%2f%2fclipart-library.com%2fimages_k%2fgreen-checkmark-transparent%2fgreen-checkmark-transparent-17.png&ehk=XzHgRYQ3s7cSIB3YzfqPKv4s787lzN9vDBRhCfmVfH0%3d&risl=&pid=ImgRaw&r=0"
                                                            alt=""
                                                            className="explain-right-icon"
                                                        />
                                                        <span
                                                            style={{
                                                                color: '#292929',
                                                                fontSize: '18px',
                                                                fontWeight: '600',
                                                            }}
                                                        >
                                                            {correctAnswer}
                                                        </span>
                                                    </p>
                                                </div>
                                                <hr style={{ margin: '20px 0' }} />
                                                <h2 className="explain-modal-title">💡 Giải thích</h2>
                                                <p
                                                    style={{
                                                        color: '#292929',
                                                        fontSize: '18px',
                                                        fontWeight: '400',
                                                        marginBottom: '24px',
                                                    }}
                                                >
                                                    <h2 className="explain-text-answer" style={{ color: '#292929' }}>
                                                        <span
                                                            className="explain-text"
                                                            dangerouslySetInnerHTML={{
                                                                __html: currentQuestion.explain,
                                                            }}
                                                        ></span>
                                                    </h2>
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleModalClose}
                                                className="dol-button special-dol-red understand-button"
                                            >
                                                Đã hiểu
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button onClick={handleShowAnswer} className="dol-button">
                                    Đáp án
                                </button>
                            </>
                        )}

                        <div>
                            <button
                                style={{ float: 'right' }}
                                onClick={handleButtonClick}
                                className={`dol-button special-dol-red ${
                                    (currentQuestion.type === 'multipleChoice' && selectedOption === null) ||
                                    (currentQuestion.type === 'fillInTheBlank' && blankAnswer.trim() === '')
                                        ? 'inactive-button'
                                        : ''
                                }`}
                            >
                                {showResult
                                    ? currentQuestionIndex < quiz.questions.length - 1
                                        ? 'Tiếp theo'
                                        : 'Hoàn thành'
                                    : 'Kiểm tra'}
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}

export default ShowQuiz;
