import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // Import Firebase configuration
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';

function EditQuiz() {
    const { id } = useParams(); // Get quiz ID from URL parameters
    const [user, setUser] = useState(null);
    const [authorDetails, setAuthorDetails] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState({
        question: '',
        type: 'multipleChoice', // Default type
        explain: '',
        options: ['', '', '', ''],
        correctOptionIndex: null,
        blankAnswer: '',
    });
    const [selectedValue, setSelectedValue] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizData = async () => {
            const docRef = doc(db, 'quizzes', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const quizData = docSnap.data();
                setTitle(quizData.title);
                setDescription(quizData.description);
                setSelectedValue(quizData.type);
                setQuestions(quizData.questions);
            } else {
                console.error('No such quiz document!');
            }
        };

        const fetchAuthorDetails = async (uid) => {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setAuthorDetails(docSnap.data());
            } else {
                console.error('No such user document!');
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchAuthorDetails(user.uid);
                fetchQuizData();
            } else {
                console.log('User is not logged in');
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [id, navigate]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleQuestionChange = (e) => {
        setCurrentQuestion({ ...currentQuestion, question: e.target.value });
    };

    const handleAnswerChange = (e) => {
        setCurrentQuestion({ ...currentQuestion, explain: e.target.value });
    };

    const handleOptionChange = (index, e) => {
        const newOptions = [...currentQuestion.options];
        newOptions[index] = e.target.value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const handleCorrectAnswerChange = (index) => {
        setCurrentQuestion({ ...currentQuestion, correctOptionIndex: index });
    };

    const handleBlankAnswerChange = (e) => {
        setCurrentQuestion({ ...currentQuestion, blankAnswer: e.target.value });
    };

    const addQuestion = () => {
        if (isFormValid()) {
            setQuestions([...questions, currentQuestion]);
            setCurrentQuestion({
                question: '',
                type: 'multipleChoice',
                explain: '',
                options: ['', '', '', ''],
                correctOptionIndex: null,
                blankAnswer: '',
            });
        }
    };

    const handleSelectChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleQuestionTypeChange = (e) => {
        setCurrentQuestion({ ...currentQuestion, type: e.target.value });
    };

    const deleteQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const editQuestion = (index) => {
        setCurrentQuestion(questions[index]);
        deleteQuestion(index);
    };

    const isFormValid = () => {
        const { question, options, correctOptionIndex, type, blankAnswer } = currentQuestion;
        if (type === 'multipleChoice') {
            return (
                selectedValue &&
                title &&
                description &&
                question &&
                options.every((option) => option) &&
                correctOptionIndex !== null
            );
        } else if (type === 'fillInTheBlank') {
            return selectedValue && title && description && question && blankAnswer;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const currentUser = auth.currentUser;

            if (!currentUser || !authorDetails) {
                throw new Error('User details are missing');
            }

            await updateDoc(doc(db, 'quizzes', id), {
                title: title,
                description: description,
                type: selectedValue,
                questions: questions.map((question) => {
                    if (question.type === 'multipleChoice') {
                        return {
                            question: question.question,
                            explain: question.explain,
                            options: question.options,
                            correctOptionIndex: question.correctOptionIndex,
                            type: 'multipleChoice',
                        };
                    } else if (question.type === 'fillInTheBlank') {
                        return {
                            question: question.question,
                            blankAnswer: question.blankAnswer,
                            explain: question.explain,
                            type: 'fillInTheBlank',
                        };
                    }
                    return null;
                }),
                author: {
                    uid: currentUser.uid,
                    name: authorDetails.firstName,
                    photo: authorDetails.photo,
                },
            });

            navigate('/myquiz');
        } catch (error) {
            console.error('Error updating document: ', error);
        }
    };

    return (
        <div className="create-quiz-container">
            <Link to="#" onClick={() => navigate(-1)} className="go-back">
                <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-left"
                    className="svg-back svg-inline--fa fa-chevron-left "
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
            <h1 className="create-quiz-title">Chỉnh sửa bài tập 📚</h1>

            <div className="input-group" style={{ marginBottom: '0', marginTop: '50px' }}>
                <input
                    id="quiz-title"
                    type="text"
                    className="blog-title-input"
                    placeholder="Viết tiêu đề bài tập"
                    value={title}
                    onChange={handleTitleChange}
                />
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
                <textarea
                    id="quiz-description"
                    type="text"
                    className="blog-sapo-input"
                    placeholder="Viết mô tả bài tập"
                    value={description}
                    onChange={handleDescriptionChange}
                    style={{ height: '200px', marginTop: '20px' }}
                />
                <hr />
            </div>

            <div className="input-group" style={{ marginBottom: '100px' }}>
                <label className="input-label" htmlFor="quiz-type">
                    Chọn một tùy chọn
                </label>
                <select
                    id="quiz-type"
                    className="input-field input-effect"
                    value={selectedValue}
                    onChange={handleSelectChange}
                    style={{ cursor: 'pointer' }}
                >
                    <option value="">--Chọn môn học--</option>
                    <option value="ls10">Lịch Sử 10</option>
                    <option value="ls11">Lịch Sử 11</option>
                    <option value="ls12">Lịch Sử 12</option>
                    <option value="dp10">Giáo dục địa phương 10</option>
                    <option value="dp11">Giáo dục địa phương 11</option>
                </select>
            </div>

            <h1 className="blogs-display-title">Phần đặt câu hỏi ✨</h1>
            <div className="input-group">
                <label className="input-label" htmlFor="question-type">
                    Chọn loại câu hỏi
                </label>
                <select
                    id="question-type"
                    className="input-field input-effect"
                    value={currentQuestion.type}
                    onChange={handleQuestionTypeChange}
                    style={{ cursor: 'pointer' }}
                >
                    <option value="multipleChoice">Trắc nghiệm</option>
                    <option value="fillInTheBlank">Điền vào chỗ trống</option>
                </select>
            </div>

            {currentQuestion.type === 'multipleChoice' && (
                <>
                    <div className="input-group">
                        <label className="input-label" htmlFor="question-text">
                            Câu hỏi
                        </label>
                        <input
                            id="question-text"
                            type="text"
                            className="input-field input-effect"
                            placeholder="Nhập câu hỏi"
                            value={currentQuestion.question}
                            onChange={handleQuestionChange}
                        />
                    </div>

                    <div className="question-options">
                        <label className="input-label" htmlFor="question-text">
                            Các lựa chọn (Chọn câu đúng)
                        </label>

                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="option-group">
                                <input
                                    type="text"
                                    className="input-field input-effect option-input"
                                    placeholder={`Lựa chọn ${index + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e)}
                                />
                                <input
                                    type="radio"
                                    className="correct-answer-radio"
                                    checked={currentQuestion.correctOptionIndex === index}
                                    onChange={() => handleCorrectAnswerChange(index)}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {currentQuestion.type === 'fillInTheBlank' && (
                <>
                    <div className="input-group">
                        <label className="input-label" htmlFor="question-text">
                            Câu hỏi (bao gồm khoảng trống)
                        </label>
                        <input
                            id="question-text"
                            type="text"
                            className="input-field input-effect"
                            placeholder="Nhập câu hỏi với khoảng trống"
                            value={currentQuestion.question}
                            onChange={handleQuestionChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="blank-answer">
                            Đáp án cho khoảng trống
                        </label>
                        <input
                            id="blank-answer"
                            type="text"
                            className="input-field input-effect"
                            placeholder="Nhập đáp án cho khoảng trống"
                            value={currentQuestion.blankAnswer}
                            onChange={handleBlankAnswerChange}
                        />
                    </div>
                </>
            )}

            <div className="input-group" style={{ marginTop: '30px' }}>
                <label className="input-label" htmlFor="answer-text">
                    Giải thích đáp án
                </label>
                <textarea
                    id="answer-text"
                    type="text"
                    className="input-field input-effect explain-text-area"
                    placeholder="Hãy viết giải thích cho đáp án"
                    value={currentQuestion.explain}
                    onChange={handleAnswerChange}
                />
            </div>

            <button
                style={{ marginTop: '12px' }}
                className={`dol-button special-dol-red ${!isFormValid() ? 'inactive-button' : ''}`}
                onClick={addQuestion}
            >
                Thêm câu hỏi
            </button>

            <div className="question-list">
                {questions.map((question, index) => (
                    <div key={index} className="question-item">
                        <h2>{question.question}</h2>
                        {question.type === 'multipleChoice' &&
                            question.options.map((option, i) => (
                                <div
                                    key={i}
                                    className={`option-text ${
                                        question.correctOptionIndex === i ? 'correct-option' : ''
                                    }`}
                                >
                                    <img
                                        src="https://gcdnb.pbrd.co/images/AdpFp3XrqIpc.png"
                                        alt=""
                                        style={{ display: 'none' }}
                                        className={`explain-right-icon ${
                                            question.correctOptionIndex === i ? 'checkIcon' : ''
                                        }`}
                                    />
                                    {option}
                                </div>
                            ))}
                        {question.type === 'fillInTheBlank' && (
                            <div className="option-text  correct-option">
                                <img
                                    src="https://gcdnb.pbrd.co/images/AdpFp3XrqIpc.png"
                                    alt=""
                                    style={{ display: 'none' }}
                                    className={'explain-right-icon checkIcon'}
                                />
                                {question.blankAnswer}
                            </div>
                        )}

                        <h2 className="explain-text-answer">
                            Giải thích:
                            <span
                                className="explain-text"
                                dangerouslySetInnerHTML={{ __html: question.explain }}
                            ></span>
                        </h2>

                        <button
                            className="dol-button special-dol-red"
                            style={{ height: '40px ' }}
                            onClick={() => editQuestion(index)}
                        >
                            Chỉnh sửa
                        </button>
                        <button
                            className="dol-button "
                            style={{ border: '1px solid #292929', marginLeft: '12px', height: '40px ' }}
                            onClick={() => deleteQuestion(index)}
                        >
                            Xóa câu hỏi
                        </button>
                    </div>
                ))}
            </div>

            <button
                style={{ border: '1px solid #292929', marginTop: '25px', width: '100%' }}
                className={`dol-button ${questions.length === 0 ? 'inactive-button' : ''}`}
                onClick={handleSubmit}
                disabled={questions.length === 0}
            >
                Cập nhật bài tập
            </button>
        </div>
    );
}

export default EditQuiz;
