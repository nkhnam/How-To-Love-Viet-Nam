import './Elearning.css';
import Header from '../Header/Header';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Course5() {
    useEffect(() => {
        const html = document.querySelector('html');

        const setFontSize = () => {
            if (window.innerWidth <= 450) {
                html.style.fontSize = '50%';
            } else if (window.innerWidth <= 991) {
                html.style.fontSize = '55%';
            } else {
                html.style.fontSize = '62.5%';
            }
        };

        setFontSize();
        window.addEventListener('resize', setFontSize);

        // Cleanup event listener khi component unmount
        return () => {
            window.removeEventListener('resize', setFontSize);
            if (html) {
                html.style.fontSize = ''; // Reset lại kích thước phông chữ khi rời khỏi trang
            }
        };
    }, []);

    return (
        <>
            <Header></Header>
            <section class="playlist-details">
                <div class="sub-heading">
                    <Link to="/elearning" class="inline-btn plalist-turnback">
                        Trở về trang chủ
                    </Link>
                    <h1 class="heading">Nội dung bài giảng</h1>
                </div>

                <div class="row">
                    <div class="column">
                        <div class="thumb">
                            <img src="./Img/thumb-3.png" alt="" />
                            <span>9 bài học</span>
                        </div>
                    </div>
                    <div class="column">
                        <div class="details">
                            <h3>Môn Lịch Sử 12</h3>
                            <p>
                                Nội dung lịch sử trong các cấp học là những bài học quý giá về cách sống và những kinh
                                nghiệm xương máu mà cha ông ta đã để lại cho thế hệ sau. Việc học bộ môn lịch sử có thể
                                góp phần vun đắp thêm tình yêu nước của các em học sinh, tạo cơ hội để tìm hiểu về một
                                trang lịch sử hào hùng, đáng tự hào của dân tộc và cũng giúp cho thế hệ sau càng có
                                nhiều kiến thức hơn trong cách ứng xử, giao tiếp.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="playlist-videos">
                <h1 class="heading">Chương 1</h1>

                <div class="box-container">
                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/Lịch Sử bài 1 (1).png" alt="" />
                        <h3>Bài 1. Liên hợp quốc</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Đỗ Thị Hạt
                        </h4>
                    </Link>

                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/Lịch Sử bài 1 (2).png" alt="" />
                        <h3>Bài 2. Trật tự thế giới trong Chiến tranh lạnh</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Đỗ Thị Hạt
                        </h4>
                    </Link>

                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/Lịch Sử bài 1 (3).png" alt="" />
                        <h3>Bài 3. Trật tự thế giới sau Chiến tranh lạnh</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Đỗ Thị Hạt
                        </h4>
                    </Link>
                </div>

                <h1 class="heading">Chương 2</h1>

                <div class="box-container">
                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/Lịch Sử bài 1 (4).png" alt="" />
                        <h3>Bài 4. Sự ra đời và phát triển của Hiệp hội các quốc gia Đông Nam Á (ASEAN)</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Đỗ Thị Hạt
                        </h4>
                    </Link>

                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/Lịch Sử bài 1 (5).png" alt="" />
                        <h3>Bài 5. Cộng đồng ASEAN: Từ ý tưởng đến hiện thực</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Đỗ Thị Hạt
                        </h4>
                    </Link>

                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/Lịch Sử bài 1 (6).png" alt="" />
                        <h3>Bài 6. Cách mạng tháng Tám năm 1945</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Đỗ Thị Hạt
                        </h4>
                    </Link>
                </div>
                <h1 class="heading">Chương 3</h1>

                <div class="box-container">
                    <a
                        class="box"
                        href="https://howtolovevietnam.netlify.app/elearningsection/historycourse1/course4/watch-video1"
                    >
                        <i class="fas fa-play"></i>
                        <img src="./Img/Lịch Sử bài 1 (7).png" alt="" />
                        <h3>Bài 7. Cuộc kháng chiến chống thực dân Pháp (1945 –1954)</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Đỗ Thị Hạt
                        </h4>
                    </a>

                    <a
                        class="box"
                        href="https://howtolovevietnam.netlify.app/elearningsection/historycourse1/course3/watch-video1"
                    >
                        <i class="fas fa-play"></i>
                        <img src="./Img/Lịch Sử bài 1 (8).png" alt="" />
                        <h3>Bài 8. Cuộc kháng chiến chống Mỹ, cứu nước (1954 – 1975)</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Đỗ Thị Hạt
                        </h4>
                    </a>

                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/Lịch Sử bài 1 (9).png" alt="" />
                        <h3>
                            Bài 9. Đấu tranh bảo vệ Tổ quốc từ sau tháng 4 – 1975 đến nay. Một số bài học lịch sử của
                            các cuộc kháng chiến bảo vệ Tổ quốc từ năm 1945 đến nay
                        </h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Đỗ Thị Hạt
                        </h4>
                    </Link>
                </div>
            </section>
        </>
    );
}

export default Course5;
