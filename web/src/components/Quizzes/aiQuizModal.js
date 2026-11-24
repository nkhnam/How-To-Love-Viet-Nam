import React, { useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import { API_URL } from '../../config';

const imgHistory10Lesson1 =
    'Lịch sử là những gì đã diễn ra trong quá khứ, tồn tại một cách khách quan và có thể nhận thức được, gắn liền với con người và xã hội loài người. Nhận thức lịch sử là hiểu biết của con người về hiện thực lịch sử, được phục dựng thông qua tư liệu và phương pháp nghiên cứu phù hợp. Sử học là khoa học nghiên cứu quá trình phát sinh, phát triển của xã hội loài người trong quá khứ, với đối tượng nghiên cứu toàn diện. Sử học có chức năng khoa học (khôi phục, giải thích hiện tượng lịch sử khách quan), xã hội (giúp nhận thức hiện tại, dự đoán tương lai), và giáo dục (truyền đạt bài học lịch sử). Nhiệm vụ của Sử học là rút ra bài học kinh nghiệm, nâng cao nhận thức, giáo dục tư tưởng, và phát triển nhân cách. Sử học tuân theo các nguyên tắc khách quan, trung thực, tiến bộ, toàn diện, và cụ thể. Các nguồn sử liệu, gồm sử liệu trực tiếp (gốc) và gián tiếp (hồi ký, kể chuyện), được phân loại thành sử liệu thành văn, truyền miệng, hiện vật, và đa phương tiện. Sử học sử dụng nhiều phương pháp như phương pháp lịch sử (xem xét sự kiện qua các giai đoạn cụ thể), phương pháp logic (nghiên cứu bản chất và quy luật), cùng các phương pháp khác như lịch đại, đồng đại, điền dã, và phỏng vấn nhân chứng để tái hiện lịch sử một cách chính xác và sinh động.';
const imgHistory10Lesson2 =
    'Tri thức lịch sử là những hiểu biết của con người về các lĩnh vực liên quan đến lịch sử, hình thành qua quá trình học tập, khám phá, nghiên cứu và trải nghiệm, có ý nghĩa quan trọng không chỉ với cá nhân mà cả xã hội. Tri thức lịch sử giúp con người nhận thức về cội nguồn, bản sắc của bản thân, gia đình, cộng đồng, dân tộc, là điều kiện cơ bản để giữ gìn và phát triển bản sắc văn hóa trong thời đại toàn cầu hóa. Tri thức lịch sử luôn để lại cho đời sau những bài học kinh nghiệm quý giá, giúp mỗi cá nhân và cộng đồng xã hội tìm hiểu, đúc rút và vận dụng trong quá trình phát triển. Đối với mỗi quốc gia, dân tộc, tri thức lịch sử là nền tảng vững chắc của truyền thống yêu nước, là niềm tự hào và là điểm tựa cho lòng tin vào sức mạnh của dân tộc, đồng thời giúp con người khám phá và tiếp cận với nhiều nền văn hóa, văn minh của nhân loại. Những bài học rút ra từ lịch sử còn giúp mỗi quốc gia, dân tộc tự nhận thức chính mình. Đặc biệt, tri thức lịch sử dân tộc giúp học sinh hiểu rõ quá trình xây dựng và bảo vệ đất nước, hình thành tinh thần yêu nước và niềm tự hào dân tộc, đồng thời có hiểu biết về lịch sử thế giới, văn hóa nhân loại, làm cơ sở để học hỏi, giao lưu và hội nhập quốc tế. Học tập lịch sử giúp con người hiểu rõ quá khứ, là cơ sở để nhận thức hiện tại và dự báo tương lai.';
const imgHistory10Lesson3 =
    'Sử học là một môn khoa học liên ngành, có đối tượng nghiên cứu rộng, liên quan đến nhiều lĩnh vực khác nhau nhằm phản ánh toàn diện đời sống con người và xã hội loài người. Sử học sử dụng tri thức từ các ngành khoa học khác để nghiên cứu các vấn đề xã hội, con người một cách hiệu quả, khoa học, và có khả năng liên kết các ngành khoa học xã hội, nhân văn, tự nhiên và công nghệ. Mối liên hệ giữa sử học và các ngành khoa học xã hội và nhân văn khác là rất chặt chẽ, vì tất cả đều lấy xã hội loài người làm đối tượng nghiên cứu. Sử học cung cấp thông tin về bối cảnh hình thành, phát triển và các nhân tố tác động đến quá trình phát triển của xã hội, đồng thời giúp dự báo xu hướng vận động của các ngành khoa học xã hội và nhân văn. Các ngành này cũng hỗ trợ Sử học bằng tri thức, kết quả nghiên cứu và phương pháp giúp khoa học lịch sử đạt kết quả tốt hơn. Sử học và các ngành khoa học tự nhiên, công nghệ cũng có mối quan hệ mật thiết. Sử học cung cấp thông tin về quá khứ và dự báo sự vận động phát triển, phục vụ cho các ngành này trong hoạt động xây dựng và phát triển. Nó giúp xác định không gian và bối cảnh lịch sử, cũng như phục dựng lịch sử phát triển các ngành khoa học tự nhiên và công nghệ, từ đó rút ra bài học và đặc điểm cho sự phát triển tương lai. Ngược lại, các ngành khoa học tự nhiên và công nghệ cung cấp tri thức, kỹ thuật và phương pháp nghiên cứu liên ngành cho Sử học, giúp hiểu rõ sự sáng tạo của con người trong quá trình phát triển xã hội, đồng thời làm sáng tỏ quá trình phát sinh, phát triển của các ngành khoa học và tác động của chúng trong sự tiến bộ của văn minh nhân loại.';
const imgHistory10Lesson4 =
    'Sử học nghiên cứu và phục dựng lại bức tranh lịch sử, xác định giá trị lịch sử, văn hóa, khoa học cần được lưu truyền từ thế hệ này sang thế hệ khác, qua đó khẳng định giá trị của các di sản văn hóa và thiên nhiên. Kết quả nghiên cứu của Sử học làm cơ sở để bảo tồn, gìn giữ và phát huy giá trị của các di sản này, như Chùa Cầu ở Hội An. Công tác bảo tồn và phát huy giá trị di sản không chỉ là việc bảo vệ các giá trị của quá khứ mà còn là hoạt động giúp con người nhớ về cội nguồn, hình thành ý thức trách nhiệm với tổ tiên, cộng đồng xã hội và các thế hệ mai sau, đồng thời đảm bảo sự phát triển bền vững cho mỗi quốc gia, dân tộc, và đóng góp cho sự phát triển kinh tế, xã hội. Ví dụ, một góc Thánh địa Mỹ Sơn ở Quảng Nam. Sử học cũng đóng vai trò quan trọng trong sự phát triển công nghiệp văn hóa, cung cấp chất liệu, tri thức, ý tưởng và cảm hứng cho các ngành nghề trong lĩnh vực này, đồng thời thúc đẩy sự sáng tạo của các sản phẩm có giá trị trong công nghiệp văn hóa, như biểu diễn áo dài Việt Nam tại Festival Huế 2018. Các ngành nghề trong công nghiệp văn hóa cũng cung cấp thông tin và tư liệu quý giá, giúp Sử học khôi phục bức tranh lịch sử xã hội đầy đủ, chính xác và sinh động hơn, đồng thời thúc đẩy nghiên cứu các di sản, như trong phim "Mùi cỏ cháy." Sử học cũng đóng vai trò quan trọng trong sự phát triển du lịch, vì di sản văn hóa là sản phẩm của lịch sử, với các di tích lịch sử - văn hóa là tài nguyên du lịch hấp dẫn, thu hút du khách trong và ngoài nước. Phát huy giá trị di sản văn hóa gắn với hoạt động du lịch là một trong những đặc trưng quan trọng của bảo tồn di sản. Du lịch khai thác các di sản này, giúp con người thưởng thức giá trị của di sản thiên nhiên và văn hóa, như Cố đô Huế. Mặt khác, nhu cầu du lịch không chỉ là tham quan mà còn là các hoạt động trải nghiệm để hiểu rõ hơn giá trị của di tích, di sản, và du lịch là động lực thúc đẩy việc bảo tồn và phát huy những giá trị này. Du lịch văn hóa tạo ra việc làm, thu nhập cho người lao động, đồng thời tạo nguồn lực kinh tế để bảo tồn và phát huy giá trị các di sản văn hóa và di tích lịch sử, như Lễ hội chùa Hương ở Hà Nội.';

const preExistingData = {
    'Lịch Sử 10': {
        'Bài 1: Hiện thức lịch sử và nhận thức lịch sử': { type: 'image', content: imgHistory10Lesson1 },
        'Bài 2: Tri thức lịch sử và cuộc sống': { type: 'image', content: imgHistory10Lesson2 },
        'Bài 3: Sử học với các lĩnh vực khoa học khác': { type: 'image', content: imgHistory10Lesson3 },
        'Bài 4: Sử học với một số lĩnh vực, ngành nghề hiện đại': { type: 'image', content: imgHistory10Lesson4 },
    },
    'Lịch Sử 11': {
        // 'Bài 1': { type: 'image', content: imgHistory11Lesson1 },
        // 'Bài 2': { type: 'image', content: imgHistory11Lesson2 },
    },
};

function AiQuizModal({ closeModal, setQuestions }) {
    const [file, setFile] = useState(null);
    const [numQuestions, setNumQuestions] = useState();
    const [textContent, setTextContent] = useState('');
    const [output, setOutput] = useState('(Trình tạo câu hỏi bằng AI - Tối đa 10 câu - Thời gian max 1 phút)');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');
    const [usePreExistingData, setUsePreExistingData] = useState(false);

    useEffect(() => {
        if (file || usePreExistingData) {
            setTextContent('');
        }
    }, [file, usePreExistingData]);

    useEffect(() => {
        if (textContent.trim() || usePreExistingData) {
            setFile(null);
        }
    }, [textContent, usePreExistingData]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleNumQuestionsChange = (e) => {
        setNumQuestions(e.target.value);
    };

    const handleTextChange = (e) => {
        setTextContent(e.target.value);
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
        setSelectedLesson('');
    };

    const handleLessonChange = (e) => {
        setSelectedLesson(e.target.value);
    };

    const handleUsePreExistingDataChange = () => {
        setUsePreExistingData((prev) => !prev);
    };

    const handleGenerateQuiz = async () => {
        if (!file && !textContent.trim() && (!selectedSubject || !selectedLesson)) {
            alert('Please upload a file, enter text content, or select a subject and lesson');
            return;
        }

        closeModal();

        try {
            setOutput('Bot đang tạo câu hỏi');

            if (usePreExistingData && selectedSubject && selectedLesson) {
                const lessonData = preExistingData[selectedSubject][selectedLesson];
                let contents;

                if (lessonData.type === 'image') {
                    contents = [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `
                                            Tạo ra ${numQuestions} câu hỏi trắc nghiệm từ tài liệu này:
                                            1. QUAN TRỌNG KHÔNG dùng cụm từ "tài liệu" và "theo tài liệu"
                                            Tôi muốn bạn tạo câu hỏi theo cấu trúc sau đây:
                                            Câu hỏi: Phần câu hỏi bạn tạo
                                            Lựa chọn 1: Phần lựa chọn bạn tạo
                                            Lựa chọn 2: Phần lựa chọn bạn tạo
                                            Lựa chọn 3: Phần lựa chọn bạn tạo
                                            Lựa chọn 4: Phần lựa chọn bạn tạo
                                            Lựa chọn đúng: Lựa chọn n
                                            Giải thích: súc tích và cô động nhất có thể (lấy dẫn chứng trong tài liệu, kết thúc và bắt đầu bằng dấu ngoặc đơn)
                                            \n\n${lessonData.content}
                                        `,
                                },
                            ],
                        },
                    ];
                    await generateQuiz(contents);
                } else {
                    contents = [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `
                                            Tạo ra ${numQuestions} câu hỏi trắc nghiệm từ tài liệu này:
                                            1. QUAN TRỌNG KHÔNG dùng cụm từ "tài liệu" và "theo tài liệu"
                                            Tôi muốn bạn tạo câu hỏi theo cấu trúc sau đây:
                                            Câu hỏi: Phần câu hỏi bạn tạo
                                            Lựa chọn 1: Phần lựa chọn bạn tạo
                                            Lựa chọn 2: Phần lựa chọn bạn tạo
                                            Lựa chọn 3: Phần lựa chọn bạn tạo
                                            Lựa chọn 4: Phần lựa chọn bạn tạo
                                            Lựa chọn đúng: Lựa chọn n
                                            Giải thích: súc tích và cô động nhất có thể (lấy dẫn chứng trong tài liệu, kết thúc và bắt đầu bằng dấu ngoặc đơn)
                                            \n\n${lessonData.content}
                                   `,
                                },
                            ],
                        },
                    ];
                    await generateQuiz(contents);
                }
            } else if (file) {
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64 = reader.result.split(',')[1];
                    const contents = [
                        {
                            role: 'user',
                            parts: [
                                {
                                    inline_data: { mime_type: file.type, data: base64 },
                                },
                                {
                                    text: `
                                            Tạo ra ${numQuestions} câu hỏi trắc nghiệm từ tài liệu này:
                                            1. QUAN TRỌNG KHÔNG dùng cụm từ "tài liệu" và "theo tài liệu"
                                            Tôi muốn bạn tạo câu hỏi theo cấu trúc sau đây:
                                            Câu hỏi: Phần câu hỏi bạn tạo
                                            Lựa chọn 1: Phần lựa chọn bạn tạo
                                            Lựa chọn 2: Phần lựa chọn bạn tạo
                                            Lựa chọn 3: Phần lựa chọn bạn tạo
                                            Lựa chọn 4: Phần lựa chọn bạn tạo
                                            Lựa chọn đúng: Lựa chọn n
                                            Giải thích: súc tích và cô động nhất có thể (lấy dẫn chứng trong tài liệu, kết thúc và bắt đầu bằng dấu ngoặc đơn)
                                    `,
                                },
                            ],
                        },
                    ];

                    await generateQuiz(contents);
                };
                reader.readAsDataURL(file);
            } else if (textContent.trim()) {
                const contents = [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `
                                        Tạo ra ${numQuestions} câu hỏi trắc nghiệm từ tài liệu này:
                                        1. QUAN TRỌNG KHÔNG dùng cụm từ "tài liệu" và "theo tài liệu"
                                        Tôi muốn bạn tạo câu hỏi theo cấu trúc sau đây:
                                        Câu hỏi: Phần câu hỏi bạn tạo
                                        Lựa chọn 1: Phần lựa chọn bạn tạo
                                        Lựa chọn 2: Phần lựa chọn bạn tạo
                                        Lựa chọn 3: Phần lựa chọn bạn tạo
                                        Lựa chọn 4: Phần lựa chọn bạn tạo
                                        Lựa chọn đúng: Lựa chọn n
                                        Giải thích: súc tích và cô động nhất có thể (lấy dẫn chứng trong tài liệu, kết thúc và bắt đầu bằng dấu ngoặc đơn)
                                        \n\n${textContent.trim()}
                                `,
                            },
                        ],
                    },
                ];

                await generateQuiz(contents);
            }
        } catch (error) {
            console.error('Error generating quiz: ', error);
            alert('Error generating quiz');
        }
    };

    const generateQuiz = async (contents) => {
        let buffer = [];
        let md = new MarkdownIt();
        try {
            const response = await fetch(`${API_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'AI service error');
            }
            buffer.push(data.text);
        } catch (error) {
            alert(`Error generating quiz: ${error.message}`);
            return;
        }

        const parsedQuestions = parseQuizText(buffer.join(''));

        const aiQuestions = parsedQuestions.map((parsedQuestion) => ({
            questionText: parsedQuestion.question,
            type: 'multipleChoice',
            answerText: parsedQuestion.explanation,
            options: parsedQuestion.options,
            correctAnswerIndex: parsedQuestion.correctAnswerIndex,
            aiGenerated: true,
        }));

        setQuestions((prevQuestions) => [...prevQuestions, ...aiQuestions]);
        setOutput(md.render(buffer.join('')));
        closeModal();
    };

    const parseQuizText = (text) => {
        const questions = text.split('Câu hỏi:').slice(1);
        return questions.map((questionText) => {
            const parts = questionText.split('\n').filter(Boolean);
            const question = parts[0]?.replace(/\*/g, '').trim() || '';
            const options = parts.slice(1, 5).map((option) => option.split(':')[1]?.replace(/\*/g, '').trim() || '');
            const correctAnswerText = parts.find((part) => part.includes('Lựa chọn đúng:')) || '';
            const correctAnswerIndex = parseInt(correctAnswerText.match(/\d+/)) - 1;
            const explanationMatch = questionText.match(/\(.*?\)/);
            const explanation = explanationMatch ? explanationMatch[0].replace(/[\(\)]/g, '').trim() : '';

            return {
                question,
                options: options.map((option) => option.replace(/(Lựa chọn \d+:)/, '').trim()),
                correctAnswerIndex,
                explanation,
            };
        });
    };

    return (
        <div className="ai-quiz-modal">
            <div className="ai-quiz-modal-content">
                <h2>Tạo Quiz từ tài liệu</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                    <div>
                        <input
                            type="radio"
                            id="user-data"
                            name="data-source"
                            checked={!usePreExistingData}
                            onChange={handleUsePreExistingDataChange}
                        />
                        <label htmlFor="user-data">Dữ liệu người dùng</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id="pre-existing-data"
                            name="data-source"
                            checked={usePreExistingData}
                            onChange={handleUsePreExistingDataChange}
                        />
                        <label htmlFor="pre-existing-data">Dữ liệu có sẵn</label>
                    </div>
                </div>
                {!usePreExistingData && (
                    <>
                        <textarea
                            placeholder="Nhập nội dung..."
                            value={textContent}
                            onChange={handleTextChange}
                            rows="4"
                        />
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                    </>
                )}
                {usePreExistingData && (
                    <>
                        <select value={selectedSubject} onChange={handleSubjectChange}>
                            <option value="">Chọn môn học</option>
                            {Object.keys(preExistingData).map((subject) => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                        <select value={selectedLesson} onChange={handleLessonChange} disabled={!selectedSubject}>
                            <option value="">Chọn bài học</option>
                            {selectedSubject &&
                                Object.keys(preExistingData[selectedSubject]).map((lesson) => (
                                    <option key={lesson} value={lesson}>
                                        {lesson}
                                    </option>
                                ))}
                        </select>
                    </>
                )}
                <input
                    type="number"
                    value={numQuestions}
                    onChange={handleNumQuestionsChange}
                    placeholder="Số lượng câu hỏi"
                />
                <div style={{ margin: '20px 0', display: 'flex' }}>
                    <button className="dol-button generate-btn" onClick={handleGenerateQuiz}>
                        Tạo Quiz
                    </button>
                    <button className="dol-button special-dol-red" onClick={closeModal}>
                        Đóng
                    </button>
                </div>
                <div className="output" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(output) }} />
            </div>
        </div>
    );
}

export default AiQuizModal;
