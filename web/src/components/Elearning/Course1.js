import './Elearning.css';
import Header from '../Header/Header';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Course1() {
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
                            <img src="./Img/thumb-5.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                    </div>
                    <div class="column">
                        <div class="details">
                            <h3>Môn GDĐP 11</h3>
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
                <h1 class="heading">Chương 1</h1>

                <div class="box-container">
                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/post 1-1.jpeg" alt="" />
                        <h3>Bài 1: Văn học hiện đại của TP.HCM</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Nguyễn Thị Bảo Linh
                        </h4>
                    </Link>

                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/post 1-2.jpeg" alt="" />
                        <h3>Bài 2: Danh nhân lịch sử của TP.HCM</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Nguyễn Thị Bảo Linh
                        </h4>
                    </Link>

                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/post 1-3.jpeg" alt="" />
                        <h3>Bài 3: Phong tục, luật tục và giáo dục pháp luật ở TP.HCM</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Nguyễn Thị Bảo Linh
                        </h4>
                    </Link>
                </div>

                <h1 class="heading">Chương 2</h1>

                <div class="box-container">
                    <a
                        class="box"
                        href="https://howtolovevietnam.netlify.app/elearningsection/historycourse1/course2/watch-video1"
                    >
                        <i class="fas fa-play"></i>
                        <img src="./Img/post 1-4.jpeg" alt="" />
                        <h3>Bài 4: Phong cảnh TP.HCM</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Nguyễn Thị Bảo Linh
                        </h4>
                    </a>

                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/post 1-5.jpeg" alt="" />
                        <h3>Bài 5: Thương mại của TP.HCM</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Nguyễn Thị Bảo Linh
                        </h4>
                    </Link>

                    <Link class="box" to="">
                        <i class="fas fa-play"></i>
                        <img src="./Img/post 1-6.jpeg" alt="" />
                        <h3>Bài 6: Thu hút đầu tư cho phát triển kinh tế ở TP.HCM</h3>
                        <h4
                            style={{
                                color: 'black',
                                marginTop: '8px',
                                fontWeight: '600',
                                fontSize: '12px',
                                fontStyle: 'italic',
                            }}
                        >
                            Giáo viên: Nguyễn Thị Bảo Linh
                        </h4>
                    </Link>
                </div>
            </section>
        </>
    );
}

export default Course1;
