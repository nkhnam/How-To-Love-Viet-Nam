import React, { useState, useRef, useEffect } from 'react';
import Header from '../Header/Header';
import Slideshow from './Slideshow';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import 'remixicon/fonts/remixicon.css';

const images = [
    './Img/background1.jpg',
    './Img/background2.jpg',
    './Img/background3.jpg',
    './Img/background4.jpg',
    './Img/background5.jpg',
    './Img/background6.jpg',
    './Img/background7.jpg',
    './Img/background8.jpg',
    './Img/background9.jpg',
    './Img/background10.jpg',
];

function Home() {
    useEffect(() => {
        // Tạo một script element và thiết lập các thuộc tính
        const script = document.createElement('script');
        script.src =
            'https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/0.1.0-beta.7/libs/oversea/index.js';
        script.async = true;

        // Thêm script vào DOM
        document.body.appendChild(script);

        // Khởi tạo Coze Web Chat sau khi script đã được tải
        script.onload = () => {
            new window.CozeWebSDK.WebChatClient({
                config: {
                    bot_id: '7389481344067944466',
                },
                componentProps: {
                    title: 'Coze',
                },
            });
        };

        // Xóa script khỏi DOM khi component bị unmount
        return () => {
            document.body.removeChild(script);
        };
    }, []);
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
        });
    }, []);

    const [activeFaq, setActiveFaq] = useState(null);
    const answerRefs = useRef([]);

    useEffect(() => {
        answerRefs.current.forEach((ref, index) => {
            if (ref) {
                ref.style.height = activeFaq === index ? `auto` : '0px';
            }
        });
    }, [activeFaq]);

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const faqData = [
        {
            question: 'Đây có phải là bộ sản phẩm tính phí và mục đích thực hiện bộ sản phẩm',
            answer: 'Đây là một bộ sản phẩm hoàn toàn miễn phí, được thiết kế để nâng cao chất lượng giáo dục và khuyến khích học sinh học tập bộ môn Lịch Sử và Giáo dục địa phương (GDĐP) hiệu quả hơn. Mục tiêu của chúng tôi là giúp học sinh không chỉ đạt kết quả cao trong học tập mà còn hiểu rõ hơn về văn hóa, lịch sử và con người Việt Nam. Bộ sản phẩm này giúp học sinh nắm vững kiến thức lịch sử, khám phá giá trị truyền thống, những câu chuyện lịch sử hào hùng, và nắm vững các lý thuyết trọng tâm của bộ môn Giáo dục địa phương. Từ đó ngăn chặn tình trạng mất hứng thú và trì trễ trong việc học tập hai bộ môn này ở các bạn học sinh hiện nay.',
        },
        {
            question: 'Bộ sản phẩm này bao gồm những tính năng và tiện ích gì?',
            answer: 'Bộ sản phẩm "How to Love Vietnam" được đội ngũ chúng tôi tâm huyết thực hiện với nhiều tính năng đa dạng như Website, Ứng dụng di động và thẻ Flashcards. Kết hợp với các công nghệ AI tiên tiến như Generative AI và RAG Chatbot AI, bộ sản phẩm này mang đến giải pháp hỗ trợ toàn diện cho học sinh trong việc học tập môn Lịch Sử và Giáo dục địa phương (GDĐP). Những tính năng này không chỉ cung cấp kiến thức một cách dễ dàng và tiện lợi, mà còn giúp cải thiện tình trạng trì trệ trong việc học tập hai bộ môn này. ',
        },
        {
            question: 'Ngoài mục đích giáo dục, bộ sản phẩm này còn nhắm đến mục tiêu gì?',
            answer: 'Nhóm đội ngũ không chỉ dừng lại ở việc hỗ trợ học tập và giảng dạy bộ môn Lịch Sử và Giáo dục địa phương, mà còn mong muốn giới thiệu vẻ đẹp văn hóa và lịch sử Việt Nam đến với du khách quốc tế. Chúng tôi đặc biệt chú trọng vào việc quảng bá những lễ hội truyền thống, sự kiện văn hóa đặc sắc của các vùng miền đến với bạn bè năm châu. Thông qua các hoạt động này, chúng tôi hy vọng sẽ tạo ra những trải nghiệm sâu sắc và đáng nhớ cho du khách nước ngoài khi đến Việt Nam.',
        },
        {
            question: 'Đối tượng mà đề tài muốn hướng đến là ai, có phải chỉ là học sinh?',
            answer: 'Đề tài hướng đến tất cả các đối tượng không phân biệt tuổi tác và giới tính, những cá nhân có sở thích và mong muốn tìm hiểu về những nét đẹp thiên nhiên hay bánh xe lịch sử của Việt Nam. Hay là những học sinh, sinh viên ôn tập bộ môn Lịch Sử và GDĐP theo chương trình GDPT 2018 sau các buổi học trên lớp để củng cố kiến thức và nội dung bài học.',
        },
    ];

    return (
        <>
            <Header backgroundColor="linear-gradient(180deg, rgba(0, 0, 0, 0.66) 50.36%, rgba(0, 0, 0, 0) 100%);" />
            <div id="coze-chat-container"></div>;
            <main className="hero-section" id="hero-section">
                <div className="hero-section-content" data-aos="fade-up">
                    <h1 className="hero-section-title">
                        Học tập <strong>Lịch Sử</strong> và <strong>GDĐP</strong> theo cách độc đáo
                    </h1>
                    <p className="hero-section-sub-heading">
                        Với hơn <strong className="text-highlight">100 thẻ flashcards</strong> tích hợp{' '}
                        <strong className="text-highlight">website, app và các tính năng AI</strong> giúp bạn khám phá
                        vẻ đẹp Việt Nam ngay tại nhà đồng thời là bài giảng{' '}
                        <strong className="text-highlight">E-learning </strong>bộ môn{' '}
                        <strong className="text-highlight">Lịch Sử và GDĐP</strong>
                    </p>
                </div>
                {/* <img src="./Img/down arrow.jpeg" className="scroll-down-icon" alt="scroll down indicator" /> */}
            </main>
            <div className="background" style={{ backgroundColor: '#000' }}>
                {isMobile ? (
                    <Slideshow images={images} />
                ) : (
                    <video autoPlay loop muted playsInline width="109%" height="111%">
                        <source src="./Img/0814(1).mp4" type="video/mp4" />
                    </video>
                )}
            </div>
            <div className="background"></div>
            <section className="explore-section" id="explore-section">
                <h1 className="section-title-main colorYellow" data-aos="fade-up">
                    <strong className="text-highlight">
                        Nhìn ngắm nét đặc trưng về văn hóa kiến trúc của đất nước Việt Nam{' '}
                        <img src="./Img/vietnam.png" alt="" className="vietnamImg" />
                    </strong>
                    <redColor>{/* Việt Nam <img src="./Img/vietnam.png" alt="" className="vietnamImg" /> */}</redColor>
                </h1>
                <p className="section-para" data-aos="fade-up">
                    Trải dài 63 tỉnh thành từ Bắc đến Nam, Việt Nam ta bao phủ bởi nhiều di tích lịch sử quốc gia cùng
                    những bức tranh danh lam thắng cảnh tuyệt vời, làm nổi bật văn hóa độc đáo cùng vẻ đẹp thiên nhiên
                    của Việt Nam giữa lòng Đông Nam Á.
                </p>

                <div className="tours-container tours-container-special">
                    <div className="tour-card" data-aos="fade-up">
                        <img src="./Img/hanoi.jpeg" className="tour-img" alt="" />
                        <div className="tour-body">
                            <h4 className="tour-name">Hà Nội</h4>
                        </div>
                    </div>

                    <div className="tour-card" data-aos="fade-up">
                        <img src="./Img/tphcm.jpeg" className="tour-img" alt="" />
                        <div className="tour-body">
                            <h4 className="tour-name">TP. Hồ Chí Minh</h4>
                        </div>
                    </div>

                    <div className="tour-card" data-aos="fade-up">
                        <img src="./Img/hue.jpeg" className="tour-img" alt="" />
                        <div className="tour-body">
                            <h4 className="tour-name">TP. Huế</h4>
                        </div>
                    </div>

                    <div className="tour-card" data-aos="fade-up">
                        <img src="./Img/dalat.jpeg" className="tour-img" alt="" />
                        <div className="tour-body">
                            <h4 className="tour-name">TP. Đà lạt</h4>
                        </div>
                    </div>

                    <div className="tour-card" data-aos="fade-up">
                        <img src="./Img/haiphong.jpeg" className="tour-img" alt="" />
                        <div className="tour-body">
                            <h4 className="tour-name">TP. Hải Phòng</h4>
                        </div>
                    </div>

                    <div className="tour-card" data-aos="fade-up">
                        <img src="./Img/danang.jpeg" className="tour-img" alt="" />
                        <div className="tour-body">
                            <h4 className="tour-name">TP. Đà Nẵng</h4>
                        </div>
                    </div>
                </div>
            </section>
            <section className="services-section" id="services">
                <h1 className="section-title-main colorYellow" data-aos="fade-up">
                    <strong className="text-highlight">
                        Tại sao là web, app và flashcards <redColor>HTLVN</redColor> ?
                    </strong>
                </h1>
                <p className="section-para" data-aos="fade-up">
                    Dự án STEM giúp người dùng có thể học tập và rèn luyện bộ môn Lịch Sử và GDĐP theo chương trình GDPT
                    2018. Đồng thời là hiểu rõ thêm về văn hóa, lịch sử Việt Nam, nâng cao lòng tự tôn dân tộc cùng
                    những tính năng đặc biệt
                </p>

                <div className="serives-grid">
                    <div className="service-card" data-aos="fade-up">
                        <img
                            src="./Img/421104201_762321142617009_1189638150950876417_n.png"
                            className="serviceCardImg"
                            alt=""
                        ></img>
                        <p className="icon">😍</p>
                        <p className="service-text">
                            Có thể truy cập mọi lúc mỗi nơi, luôn sẵn sàng cung cấp kiến thức cho người dùng kể cả khi
                            không có kết nối mạng !
                        </p>
                    </div>
                    <div className="service-card" data-aos="fade-up">
                        <img
                            src="./Img/421104201_762321142617009_1189638150950876417_n.png"
                            className="serviceCardImg"
                            alt=""
                        ></img>
                        <p className="icon">🤖</p>
                        <p className="service-text">
                            Những tính năng mới như flashcards, bài giảng E-learning cùng chatBotAI giúp hỗ trợ ghi nhớ
                            kiến thức nhanh chóng
                        </p>
                    </div>
                    <div className="service-card" data-aos="fade-up">
                        <img
                            src="./Img/421104201_762321142617009_1189638150950876417_n.png"
                            className="serviceCardImg"
                            alt=""
                        ></img>
                        <p className="icon">🐉</p>
                        <p className="service-text">
                            Với hơn 100 thẻ flashcards cùng 300 câu hỏi về Địa Lý + Lịch Sử, ôn luyện Lịch Sử và Giáo
                            dục địa phương ngay tại nhà
                        </p>
                    </div>
                </div>
            </section>
            <section className="book-section" id="booknow">
                <img src="./Img/qommmgko.png" alt="" className="bg-circle" />
                <div className="book-content" data-aos="fade-up">
                    <h1 className="book-now-title">
                        Demo thẻ{' '}
                        <colorYellow>
                            <strong className="text-highlight">Flashcards</strong>
                        </colorYellow>
                    </h1>
                    <p className="book-now-text">
                        Flashcards là phương pháp giảng dạy, học tập độc đáo được áp dụng khá phổ biến tại các nước phát
                        triển.
                    </p>

                    <a
                        href="https://www.canva.com/design/DAF6_zwTDmc/ZzOjbkDt5KwzLh-hQL7bkA/edit?utm_content=DAF6_zwTDmc&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
                        className="book-now"
                    >
                        Xem thử ngay
                    </a>
                </div>
                <img src="./Img/book.jpeg" data-aos="fade-up" className="book-now-img" alt="" />
            </section>
            <section className="book-section" id="booknow">
                <img src="./Img/demowebapp.png" data-aos="fade-up" className="book-now-img" alt="" />
                <img src="./Img/qommmgko.png" alt="" className="bg-circle-spr" />
                <div className="book-content" data-aos="fade-up">
                    <h1 className="book-now-title">
                        Demo trang{' '}
                        <colorYellow>
                            <strong className="text-highlight">Web và App</strong>
                        </colorYellow>
                    </h1>
                    <p className="book-now-text">
                        Web, App tích hợp AI giúp học sinh tự học, kiểm tra và ôn luyện bộ môn Lịch Sử và GDĐP trực
                        tuyến.
                    </p>

                    <a href="" className="book-now">
                        Xem thử ngay
                    </a>
                </div>
            </section>
            <section className="explore-section" id="explore-section" style={{ paddingTop: '0' }}>
                <div className="faq-container">
                    {faqData.map((faq, index) => (
                        <div className={`faq-item ${activeFaq === index ? 'active' : ''}`} key={index}>
                            <div className="faq-question" onClick={() => toggleFaq(index)}>
                                {faq.question}
                                <FontAwesomeIcon
                                    icon={activeFaq === index ? faChevronUp : faChevronDown}
                                    style={{ marginLeft: '10px' }}
                                />
                            </div>
                            <div className="faq-answer" ref={(el) => (answerRefs.current[index] = el)}>
                                {faq.answer}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <footer className="footer">
                <img src="./Img/logo.png" className="footer-logo" alt="" />
                <div className="footer-text">
                    <p>🐻‍❄️ Đi khắp Việt Nam, chỉ tại nhà</p>
                    <p>💌 Email - stemproject@gmail.com</p>
                    <p>🏐 Phone - 99 88 776655, 99 88 776644</p>
                </div>
            </footer>
        </>
    );
}

export default Home;
