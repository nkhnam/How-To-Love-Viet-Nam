import './Elearning.css';
import Header from '../Header/Header';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Elearning() {
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
            <img class="landingPage" src="./Img/elearning/E-Learning.png" alt="" />

            <section class="courses">
                <h1 class="heading">Các khóa học</h1>

                <div class="box-container">
                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-1.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                        <h3 class="title">Môn Lịch Sử 10</h3>
                        <Link to="/course3" class="inline-btn">
                            Xem bài giảng
                        </Link>
                    </div>

                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-2.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                        <h3 class="title">Môn Lịch Sử 11</h3>
                        <Link to="/course4" class="inline-btn">
                            Xem bài giảng
                        </Link>
                    </div>

                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-3.png" alt="" />
                            <span>9 bài học</span>
                        </div>
                        <h3 class="title">Môn Lịch Sử 12</h3>
                        <Link to="/course5" class="inline-btn">
                            Xem bài giảng
                        </Link>
                    </div>

                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-4.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                        <h3 class="title">Môn GDĐP 10</h3>
                        <Link to="/course" class="inline-btn">
                            Xem bài giảng
                        </Link>
                    </div>

                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-5.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                        <h3 class="title">Môn GDĐP 11</h3>
                        <Link to="/course1" class="inline-btn">
                            Xem bài giảng
                        </Link>
                    </div>

                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-6.png" alt="" />
                            <span>0 bài học</span>
                        </div>
                        <h3 class="title">Môn GDĐP 12</h3>
                        <Link to="/course2" class="inline-btn">
                            Xem bài giảng
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Elearning;
