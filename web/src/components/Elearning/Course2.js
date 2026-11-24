import './Elearning.css';
import Header from '../Header/Header';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Course2() {
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
                            <img src="/Img/thumb-6.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                    </div>
                    <div class="column">
                        <div class="details">
                            <h3>Môn GDĐP 12</h3>
                            <p>
                                Nội dung giáo dục địa phương Thành phố Hồ Chí Minh là những vấn đề cơ bản về văn hoá,
                                lịch sử, địa lí, kinh tế, xã hội, môi trường, hướng nghiệp,... của địa phương bổ sung
                                cho nội dung giáo dục chung thống nhất trong cả nước. Nhằm tạo điều kiện giúp học sinh
                                phát huy tính tích cực học tập, khả năng sáng tạo, đồng thời hỗ trợ các em phát triển
                                năng lực tự học cũng như định hướng nghề nghiệp trong tương lai.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="playlist-videos">
                <h1 class="heading">Đang cập nhật....</h1>
            </section>
        </>
    );
}

export default Course2;
