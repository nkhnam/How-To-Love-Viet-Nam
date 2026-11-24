import Header from '../Header/Header';
import './Contact.css';

function Contact() {
    return (
        <>
            <Header />
            <main className="hero-section" id="hero-section">
                <img src="./Img/background5.jpg" alt="" className="contact-img" />
                <div className="container-contact">
                    <div className="wrapped">
                        <div className="anotherInner">
                            <p>📞 09993399</p>
                            <p>📞 09993399</p>
                            <p>📩 @gmail.com</p>
                        </div>

                        <div className="inner">
                            <h1 className="getInTouch">Liên hệ ✨</h1>

                            <div>
                                <input type="text" placeholder="Họ và tên" />
                            </div>

                            <div>
                                <input type="text" placeholder="Gmail" />
                            </div>
                            <div className="confirm">
                                <button className="confirmButton">Xác nhận ✏️</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Contact;
