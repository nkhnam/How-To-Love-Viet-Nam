import '../Elearning/Elearning.css';
import Header from '../Header/Header';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function Pratice() {

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
            
            <Header ></Header>

            <section class="courses courses-special">

                <h1 class="heading">Các bài luyện tập</h1>

                <div class="box-container">

                    
                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-1.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                        <h3 class="title">Môn Lịch Sử 10</h3>
                        <a href="https://howtolovevietnam.netlify.app/practicesection/lessson3" class="inline-btn">Luyện tập ngay</a>
                    </div>

                    
                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-2.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                        <h3 class="title">Môn Lịch Sử 11</h3>
                        <a href="https://howtolovevietnam.netlify.app/practicesection/lessson4" class="inline-btn">Luyện tập ngay</a>
                    </div>

                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-3.png" alt="" />
                            <span>9 bài học</span>
                        </div>
                        <h3 class="title">Môn Lịch Sử 12</h3>
                        <Link to="" class="inline-btn">Luyện tập ngay</Link>
                    </div>

                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-4.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                        <h3 class="title">Môn GDĐP 10</h3>
                        <a href="https://howtolovevietnam.netlify.app/practicesection/lessson1" class="inline-btn">Luyện tập ngay</a>
                    </div>

                    
                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-5.png" alt="" />
                            <span>6 bài học</span>
                        </div>
                        <h3 class="title">Môn GDĐP 11</h3>
                        <a href="https://howtolovevietnam.netlify.app/practicesection/lessson2" class="inline-btn">Luyện tập ngay</a>
                    </div>

                    
                    <div class="box">
                        <div class="thumb">
                            <img src="./Img/elearning/thumb-6.png" alt="" />
                            <span>0 bài học</span>
                        </div>
                        <h3 class="title">Môn GDĐP 12</h3>
                        <Link to="" class="inline-btn">Luyện tập ngay</Link>
                    </div>
                </div>


            </section>
        </>
    );
}

export default Pratice;