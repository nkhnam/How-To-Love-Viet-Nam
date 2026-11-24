import React, { useState } from 'react';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import './botAnswer.css';
import ChatBot from './chatBot';
import Header from './Header/Header.js';
import { API_URL } from '../config';

function BotAnswer() {
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState('');
    const [output, setOutput] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            return;
        }

        setFile(selectedFile);

        // Generate a file preview
        const reader = new FileReader();
        reader.onload = () => {
            setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setIsCompleted(false);
        setOutput('');

        if (!file) {
            setOutput('Please upload a file.');
            setIsLoading(false);
            return;
        }

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result.split(',')[1];

                const parts = [
                    { inline_data: { mime_type: file.type || 'application/octet-stream', data: base64 } },
                    {
                        text: 'Sử dụng tiếng việt để trả lời, chia ra 2 phần là đáp án đúng và giải thích, chỉ giải thích câu trả lời đúng, nếu đó không phải là câu hỏi thì phản hồi rằng tôi không thể trả lời vì không có câu hỏi trong file, trả lời dài và đầy đủ nhưng không lan man. Chỉ trả lời các câu hỏi về bộ môn Lịch Sử và Giáo dục địa phương VIỆT NAM',
                    },
                ];

                try {
                    const response = await fetch(`${API_URL}/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ parts }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || 'AI service error');
                    }
                    const md = new MarkdownIt();
                    setOutput(md.render(data.text));
                    setIsLoading(false);
                    setIsCompleted(true);
                } catch (error) {
                    setOutput(`<hr>${error.message}`);
                    setIsLoading(false);
                }
            };
            reader.readAsDataURL(file);
        } catch (e) {
            setOutput(`<hr>${e}`);
            setIsLoading(false);
        }
    };

    const handleViewResult = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Header />
            <div className="bot-answer-intro">
                <h1>Hệ thống giải bài tập và kho kiến thức Lịch Sử, Giáo dục địa phương Histflash-AI</h1>
            </div>
            <div className="bot-answer-features">
                <div className="bot-answer-feature">
                    <img
                        src="https://fqa.vn/_ipx/f_webp,s_111x110/images/landing-gpt/answer.svg"
                        alt="Giải bài tập siêu tốc"
                    />
                    <h3>Giải bài tập siêu tốc</h3>
                    <p>Giải đáp các câu hỏi và bài tập về Lịch Sử và Giáo dục địa phương</p>
                </div>
                <div className="bot-answer-feature">
                    <img
                        src="https://fqa.vn/_ipx/f_webp,s_111x110/images/landing-gpt/search.svg"
                        alt="Tra nhanh đáp án"
                    />
                    <h3>Tra nhanh đáp án</h3>
                    <p>
                        Sử dụng model AI Gemini-flash-1.5 API và Cohere RAG giúp trả lời các câu hỏi đầy đủ, chính xác
                    </p>
                </div>
                <div className="bot-answer-feature">
                    <img
                        src="https://fqa.vn/_ipx/f_webp,s_111x110/images/landing-gpt/target.svg"
                        alt="Lời giải chính xác dễ hiểu"
                    />
                    <h3>Lời giải chính xác dễ hiểu</h3>
                    <p>Các thông tin, kiến thức dùng để train AI dựa trên SGK và các sách nguồn uy tín</p>
                </div>
                <div className="bot-answer-feature">
                    <img
                        src="https://fqa.vn/_ipx/f_webp,s_111x110/images/landing-gpt/practice.svg"
                        alt="Ôn luyện thông minh"
                    />
                    <h3>Ôn luyện thông minh</h3>
                    <p>
                        Sử dụng AI để giải bài tập, câu hỏi đồng thời hỏi về các lý thuyết bộ môn Lịch Sử và Giáo dục
                        địa phương
                    </p>
                </div>
            </div>
            <hr />
            <div className="bot-answer-container">
                <div className="bot-answer-column bot-answer-column-left">
                    <h1 className="bot-answer-title">Giải bài với AI 🤖</h1>
                    <p className="bot-answer-description">
                        Sử dụng AI để giải đáp các câu hỏi về Lịch Sử và Giáo dục địa phương VIỆT NAM. Tải lên một tệp
                        chứa câu hỏi và nhận được câu trả lời chi tiết.
                    </p>
                    <p className="bot-answer-description">
                        Đây là tính năng tích hợp với genAI để giải các bài tập từ dữ liệu của người dùng. Giúp học
                        sinh, sinh viên có thể tham khảo phương pháp giải các bài tập, tích hợp trí tuệ nhân tạo vào
                        trong học tập.
                    </p>
                    <button
                        className={`dol-button special-dol-red  ${isCompleted ? '' : 'inactive-button'}`}
                        onClick={handleViewResult}
                    >
                        Xem đáp án từ AI
                    </button>
                </div>
                <div className="bot-answer-column" style={{ justifyContent: 'flex-end' }}>
                    <input
                        id="file-input"
                        type="file"
                        onChange={handleFileChange}
                        className="bot-answer-file-input"
                        style={{ display: 'none' }}
                    />
                    {isLoading && (
                        <div className="bot-answer-loading" style={{ display: 'flex', marginBottom: '12px' }}>
                            <p>AI đang trả lời câu hỏi, quá trình này sẽ tốn vài giây...</p>
                            <div className="loader"></div>
                        </div>
                    )}
                    <div className="bot-answer-image-preview">
                        {filePreview ? (
                            <img src={filePreview} alt="File preview" />
                        ) : (
                            <p>Hình ảnh bạn chọn sẽ hiển thị tại đây</p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '12px' }}>
                        <button type="submit" className="dol-button special-dol-red" onClick={handleSubmit}>
                            Tra cứu AI
                        </button>
                        <button
                            className="dol-button"
                            style={{ border: '1px solid #292929' }}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            Chọn Hình Ảnh
                        </button>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="bot-answer-modal-overlay">
                    <div className="bot-answer-modal-box">
                        <button onClick={handleCloseModal} className="bot-answer-modal-close-button">
                            x
                        </button>
                        <div
                            className="bot-answer-modal-content"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output) }}
                        />
                    </div>
                </div>
            )}

            <ChatBot />
        </>
    );
}

export default BotAnswer;
