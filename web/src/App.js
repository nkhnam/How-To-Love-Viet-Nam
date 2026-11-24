import { Routes, Route, Link } from 'react-router-dom';
import { useEffect } from 'react';

import Home from './components/Homepage/Home.js';
import Contact from './components/Contact/Contact.js';
import Elearning from './components/Elearning/Elearning.js';
import ProvinceMainPage from './components/Province/provinceMainPage.js';
import Register from './components/Signpage/register.js';
import Login from './components/Signpage/login.js';
import Profile from './components/Signpage/profile.js';
import ForgotPasswordModal from './components/Signpage/forgotPasswordModal.js';
import MyPosts from './components/Blogs/mypost.js';

import CreateBlog from './components/Blogs/create.js';
import Bloglist from './components/Blogs/bloglist.js';
import BlogView from './components/Blogs/show.js';
import BlogEdit from './components/Blogs/edit.js';

import CreateQuiz from './components/Quizzes/createquiz.js';
import QuizzesList from './components/Quizzes/listquiz.js';
import ShowQuiz from './components/Quizzes/showquizzes.js';
import MyQuiz from './components/Quizzes/myquiz.js';
import EditQuiz from './components/Quizzes/editquiz.js';

import UserProfile from './components/Signpage/userProfile.js';
import Messages from './components/Signpage/messages.js';
import Inbox from './components/Signpage/inbox.js';

import Pratice from './components/Pratice/Pratice.js';
import BotAnswer from './components/botAnswer.js';

import Bac from './components/Province/Bac.js';
import Nam from './components/Province/Nam.js';
import Trung from './components/Province/Trung.js';

import Course from './components/Elearning/Course.js';
import Course1 from './components/Elearning/Course1.js';
import Course2 from './components/Elearning/Course2.js';
import Course3 from './components/Elearning/Course3.js';
import Course4 from './components/Elearning/Course4.js';
import Course5 from './components/Elearning/Course5.js';

import StudyBot from './components/StudyBot.js';

//province
import AnGiangDanhLam from './components/ProvinceLink/AnGiang/AnGiangDanhLam.js';
import AnGiang from './components/ProvinceLink/AnGiang/AnGiang.js';
import AnGiangLichSu from './components/ProvinceLink/AnGiang/AnGiangLichSu.js';

import BacGiangDanhLam from './components/ProvinceLink/BacGiang/BacGiangDanhLam.js';
import BacGiang from './components/ProvinceLink/BacGiang/BacGiang.js';
import BacGiangLichSu from './components/ProvinceLink/BacGiang/BacGiangLichSu.js';

import BacKanDanhLam from './components/ProvinceLink/BacKan/BacKanDanhLam.js';
import BacKan from './components/ProvinceLink/BacKan/BacKan.js';
import BacKanLichSu from './components/ProvinceLink/BacKan/BacKanLichSu.js';

import BacLieuDanhLam from './components/ProvinceLink/BacLieu/BacLieuDanhLam.js';
import BacLieu from './components/ProvinceLink/BacLieu/BacLieu.js';
import BacLieuLichSu from './components/ProvinceLink/BacLieu/BacLieuLichSu.js';

import BacNinhDanhLam from './components/ProvinceLink/BacNinh/BacNinhDanhLam.js';
import BacNinh from './components/ProvinceLink/BacNinh/BacNinh.js';
import BacNinhLichSu from './components/ProvinceLink/BacNinh/BacNinhLichSu.js';

import BenTreDanhLam from './components/ProvinceLink/BenTre/BenTreDanhLam.js';
import BenTre from './components/ProvinceLink/BenTre/BenTre.js';
import BenTreLichSu from './components/ProvinceLink/BenTre/BenTreLichSu.js';

import BinhDinhDanhLam from './components/ProvinceLink/BinhDinh/BinhDinhDanhLam.js';
import BinhDinh from './components/ProvinceLink/BinhDinh/BinhDinh.js';
import BinhDinhLichSu from './components/ProvinceLink/BinhDinh/BinhDinhLichSu.js';

import BinhDuongDanhLam from './components/ProvinceLink/BinhDuong/BinhDuongDanhLam.js';
import BinhDuong from './components/ProvinceLink/BinhDuong/BinhDuong.js';
import BinhDuongLichSu from './components/ProvinceLink/BinhDuong/BinhDuongLichSu.js';

import BinhPhuocDanhLam from './components/ProvinceLink/BinhPhuoc/BinhPhuocDanhLam.js';
import BinhPhuoc from './components/ProvinceLink/BinhPhuoc/BinhPhuoc.js';
import BinhPhuocLichSu from './components/ProvinceLink/BinhPhuoc/BinhPhuocLichSu.js';

import BinhThuanDanhLam from './components/ProvinceLink/BinhThuan/BinhThuanDanhLam.js';
import BinhThuan from './components/ProvinceLink/BinhThuan/BinhThuan.js';
import BinhThuanLichSu from './components/ProvinceLink/BinhThuan/BinhThuanLichSu.js';

import CaMauDanhLam from './components/ProvinceLink/CaMau/CaMauDanhLam.js';
import CaMau from './components/ProvinceLink/CaMau/CaMau.js';
import CaMauLichSu from './components/ProvinceLink/CaMau/CaMauLichSu.js';

import CanThoDanhLam from './components/ProvinceLink/CanTho/CanThoDanhLam.js';
import CanTho from './components/ProvinceLink/CanTho/CanTho.js';
import CanThoLichSu from './components/ProvinceLink/CanTho/CanThoLichSu.js';

import CaoBangDanhLam from './components/ProvinceLink/CaoBang/CaoBangDanhLam.js';
import CaoBang from './components/ProvinceLink/CaoBang/CaoBang.js';
import CaoBangLichSu from './components/ProvinceLink/CaoBang/CaoBangLichSu.js';

import DakLakDanhLam from './components/ProvinceLink/DakLak/DakLakDanhLam.js';
import DakLak from './components/ProvinceLink/DakLak/DakLak.js';
import DakLakLichSu from './components/ProvinceLink/DakLak/DakLakLichSu.js';

import DakNongDanhLam from './components/ProvinceLink/DakNong/DakNongDanhLam.js';
import DakNong from './components/ProvinceLink/DakNong/DakNong.js';
import DakNongLichSu from './components/ProvinceLink/DakNong/DakNongLichSu.js';

import DaNangDanhLam from './components/ProvinceLink/DaNang/DaNangDanhLam.js';
import DaNang from './components/ProvinceLink/DaNang/DaNang.js';
import DaNangLichSu from './components/ProvinceLink/DaNang/DaNangLichSu.js';

import DienBienDanhLam from './components/ProvinceLink/DienBien/DienBienDanhLam.js';
import DienBien from './components/ProvinceLink/DienBien/DienBien.js';
import DienBienLichSu from './components/ProvinceLink/DienBien/DienBienLichSu.js';

import DongNaiDanhLam from './components/ProvinceLink/DongNai/DongNaiDanhLam.js';
import DongNai from './components/ProvinceLink/DongNai/DongNai.js';
import DongNaiLichSu from './components/ProvinceLink/DongNai/DongNaiLichSu.js';

import DongThapDanhLam from './components/ProvinceLink/DongThap/DongThapDanhLam.js';
import DongThap from './components/ProvinceLink/DongThap/DongThap.js';
import DongThapLichSu from './components/ProvinceLink/DongThap/DongThapLichSu.js';

import GiaLaiDanhLam from './components/ProvinceLink/GiaLai/GiaLaiDanhLam.js';
import GiaLai from './components/ProvinceLink/GiaLai/GiaLai.js';
import GiaLaiLichSu from './components/ProvinceLink/GiaLai/GiaLaiLichSu.js';

import HaGiangDanhLam from './components/ProvinceLink/HaGiang/HaGiangDanhLam.js';
import HaGiang from './components/ProvinceLink/HaGiang/HaGiang.js';
import HaGiangLichSu from './components/ProvinceLink/HaGiang/HaGiangLichSu.js';

import HaiDuongDanhLam from './components/ProvinceLink/HaiDuong/HaiDuongDanhLam.js';
import HaiDuong from './components/ProvinceLink/HaiDuong/HaiDuong.js';
import HaiDuongLichSu from './components/ProvinceLink/HaiDuong/HaiDuongLichSu.js';

import HaiPhongDanhLam from './components/ProvinceLink/HaiPhong/HaiPhongDanhLam.js';
import HaiPhong from './components/ProvinceLink/HaiPhong/HaiPhong.js';
import HaiPhongLichSu from './components/ProvinceLink/HaiPhong/HaiPhongLichSu.js';

import HaNamDanhLam from './components/ProvinceLink/HaNam/HaNamDanhLam.js';
import HaNam from './components/ProvinceLink/HaNam/HaNam.js';
import HaNamLichSu from './components/ProvinceLink/HaNam/HaNamLichSu.js';

import HaNoiDanhLam from './components/ProvinceLink/HaNoi/HaNoiDanhLam.js';
import HaNoi from './components/ProvinceLink/HaNoi/HaNoi.js';
import HaNoiLichSu from './components/ProvinceLink/HaNoi/HaNoiLichSu.js';

import HaTinhDanhLam from './components/ProvinceLink/HaTinh/HaTinhDanhLam.js';
import HaTinh from './components/ProvinceLink/HaTinh/HaTinh.js';
import HaTinhLichSu from './components/ProvinceLink/HaTinh/HaTinhLichSu.js';

import HauGiangDanhLam from './components/ProvinceLink/HauGiang/HauGiangDanhLam.js';
import HauGiang from './components/ProvinceLink/HauGiang/HauGiang.js';
import HauGiangLichSu from './components/ProvinceLink/HauGiang/HauGiangLichSu.js';

import HoaBinhDanhLam from './components/ProvinceLink/HoaBinh/HoaBinhDanhLam.js';
import HoaBinh from './components/ProvinceLink/HoaBinh/HoaBinh.js';
import HoaBinhLichSu from './components/ProvinceLink/HoaBinh/HoaBinhLichSu.js';

import HungYenDanhLam from './components/ProvinceLink/HungYen/HungYenDanhLam.js';
import HungYen from './components/ProvinceLink/HungYen/HungYen.js';
import HungYenLichSu from './components/ProvinceLink/HungYen/HungYenLichSu.js';

import KienGiangDanhLam from './components/ProvinceLink/KienGiang/KienGiangDanhLam.js';
import KienGiang from './components/ProvinceLink/KienGiang/KienGiang.js';
import KienGiangLichSu from './components/ProvinceLink/KienGiang/KienGiangLichSu.js';

import KonTumDanhLam from './components/ProvinceLink/KonTum/KonTumDanhLam.js';
import KonTum from './components/ProvinceLink/KonTum/KonTum.js';
import KonTumLichSu from './components/ProvinceLink/KonTum/KonTumLichSu.js';

import KhanhHoaDanhLam from './components/ProvinceLink/KhanhHoa/KhanhHoaDanhLam.js';
import KhanhHoa from './components/ProvinceLink/KhanhHoa/KhanhHoa.js';
import KhanhHoaLichSu from './components/ProvinceLink/KhanhHoa/KhanhHoaLichSu.js';

import LaiChauDanhLam from './components/ProvinceLink/LaiChau/LaiChauDanhLam.js';
import LaiChau from './components/ProvinceLink/LaiChau/LaiChau.js';
import LaiChauLichSu from './components/ProvinceLink/LaiChau/LaiChauLichSu.js';

import LamDongDanhLam from './components/ProvinceLink/LamDong/LamDongDanhLam.js';
import LamDong from './components/ProvinceLink/LamDong/LamDong.js';
import LamDongLichSu from './components/ProvinceLink/LamDong/LamDongLichSu.js';

import LangSonDanhLam from './components/ProvinceLink/LangSon/LangSonDanhLam.js';
import LangSon from './components/ProvinceLink/LangSon/LangSon.js';
import LangSonLichSu from './components/ProvinceLink/LangSon/LangSonLichSu.js';

import LaoCaiDanhLam from './components/ProvinceLink/LaoCai/LaoCaiDanhLam.js';
import LaoCai from './components/ProvinceLink/LaoCai/LaoCai.js';
import LaoCaiLichSu from './components/ProvinceLink/LaoCai/LaoCaiLichSu.js';

import LongAnDanhLam from './components/ProvinceLink/LongAn/LongAnDanhLam.js';
import LongAn from './components/ProvinceLink/LongAn/LongAn.js';
import LongAnLichSu from './components/ProvinceLink/LongAn/LongAnLichSu.js';

import NamDinhDanhLam from './components/ProvinceLink/NamDinh/NamDinhDanhLam.js';
import NamDinh from './components/ProvinceLink/NamDinh/NamDinh.js';
import NamDinhLichSu from './components/ProvinceLink/NamDinh/NamDinhLichSu.js';

import NinhBinhDanhLam from './components/ProvinceLink/NinhBinh/NinhBinhDanhLam.js';
import NinhBinh from './components/ProvinceLink/NinhBinh/NinhBinh.js';
import NinhBinhLichSu from './components/ProvinceLink/NinhBinh/NinhBinhLichSu.js';

import NinhThuanDanhLam from './components/ProvinceLink/NinhThuan/NinhThuanDanhLam.js';
import NinhThuan from './components/ProvinceLink/NinhThuan/NinhThuan.js';
import NinhThuanLichSu from './components/ProvinceLink/NinhThuan/NinhThuanLichSu.js';

import NgheAnDanhLam from './components/ProvinceLink/NgheAn/NgheAnDanhLam.js';
import NgheAn from './components/ProvinceLink/NgheAn/NgheAn.js';
import NgheAnLichSu from './components/ProvinceLink/NgheAn/NgheAnLichSu.js';

import PhuThoDanhLam from './components/ProvinceLink/PhuTho/PhuThoDanhLam.js';
import PhuTho from './components/ProvinceLink/PhuTho/PhuTho.js';
import PhuThoLichSu from './components/ProvinceLink/PhuTho/PhuThoLichSu.js';

import PhuYenDanhLam from './components/ProvinceLink/PhuYen/PhuYenDanhLam.js';
import PhuYen from './components/ProvinceLink/PhuYen/PhuYen.js';
import PhuYenLichSu from './components/ProvinceLink/PhuYen/PhuYenLichSu.js';

import QuangBinhDanhLam from './components/ProvinceLink/QuangBinh/QuangBinhDanhLam.js';
import QuangBinh from './components/ProvinceLink/QuangBinh/QuangBinh.js';
import QuangBinhLichSu from './components/ProvinceLink/QuangBinh/QuangBinhLichSu.js';

import QuangNamDanhLam from './components/ProvinceLink/QuangNam/QuangNamDanhLam.js';
import QuangNam from './components/ProvinceLink/QuangNam/QuangNam.js';
import QuangNamLichSu from './components/ProvinceLink/QuangNam/QuangNamLichSu.js';

import QuangNinhDanhLam from './components/ProvinceLink/QuangNinh/QuangNinhDanhLam.js';
import QuangNinh from './components/ProvinceLink/QuangNinh/QuangNinh.js';
import QuangNinhLichSu from './components/ProvinceLink/QuangNinh/QuangNinhLichSu.js';

import QuangNgaiDanhLam from './components/ProvinceLink/QuangNgai/QuangNgaiDanhLam.js';
import QuangNgai from './components/ProvinceLink/QuangNgai/QuangNgai.js';
import QuangNgaiLichSu from './components/ProvinceLink/QuangNgai/QuangNgaiLichSu.js';

import QuangTriDanhLam from './components/ProvinceLink/QuangTri/QuangTriDanhLam.js';
import QuangTri from './components/ProvinceLink/QuangTri/QuangTri.js';
import QuangTriLichSu from './components/ProvinceLink/QuangTri/QuangTriLichSu.js';

import SocTrangDanhLam from './components/ProvinceLink/SocTrang/SocTrangDanhLam.js';
import SocTrang from './components/ProvinceLink/SocTrang/SocTrang.js';
import SocTrangLichSu from './components/ProvinceLink/SocTrang/SocTrangLichSu.js';

import SonLaDanhLam from './components/ProvinceLink/SonLa/SonLaDanhLam.js';
import SonLa from './components/ProvinceLink/SonLa/SonLa.js';
import SonLaLichSu from './components/ProvinceLink/SonLa/SonLaLichSu.js';

import TayNinhDanhLam from './components/ProvinceLink/TayNinh/TayNinhDanhLam.js';
import TayNinh from './components/ProvinceLink/TayNinh/TayNinh.js';
import TayNinhLichSu from './components/ProvinceLink/TayNinh/TayNinhLichSu.js';

import TienGiangDanhLam from './components/ProvinceLink/TienGiang/TienGiangDanhLam.js';
import TienGiang from './components/ProvinceLink/TienGiang/TienGiang.js';
import TienGiangLichSu from './components/ProvinceLink/TienGiang/TienGiangLichSu.js';

import TPHCMDanhLam from './components/ProvinceLink/TPHCM/TPHCMDanhLam.js';
import TPHCM from './components/ProvinceLink/TPHCM/TPHCM.js';
import TPHCMLichSu from './components/ProvinceLink/TPHCM/TPHCMLichSu.js';

import TuyenQuangDanhLam from './components/ProvinceLink/TuyenQuang/TuyenQuangDanhLam.js';
import TuyenQuang from './components/ProvinceLink/TuyenQuang/TuyenQuang.js';
import TuyenQuangLichSu from './components/ProvinceLink/TuyenQuang/TuyenQuangLichSu.js';

import ThaiBinhDanhLam from './components/ProvinceLink/ThaiBinh/ThaiBinhDanhLam.js';
import ThaiBinh from './components/ProvinceLink/ThaiBinh/ThaiBinh.js';
import ThaiBinhLichSu from './components/ProvinceLink/ThaiBinh/ThaiBinhLichSu.js';

import ThaiNguyenDanhLam from './components/ProvinceLink/ThaiNguyen/ThaiNguyenDanhLam.js';
import ThaiNguyen from './components/ProvinceLink/ThaiNguyen/ThaiNguyen.js';
import ThaiNguyenLichSu from './components/ProvinceLink/ThaiNguyen/ThaiNguyenLichSu.js';

import ThanhHoaDanhLam from './components/ProvinceLink/ThanhHoa/ThanhHoaDanhLam.js';
import ThanhHoa from './components/ProvinceLink/ThanhHoa/ThanhHoa.js';
import ThanhHoaLichSu from './components/ProvinceLink/ThanhHoa/ThanhHoaLichSu.js';

import ThuaThienHueDanhLam from './components/ProvinceLink/ThuaThienHue/ThuaThienHueDanhLam.js';
import ThuaThienHue from './components/ProvinceLink/ThuaThienHue/ThuaThienHue.js';
import ThuaThienHueLichSu from './components/ProvinceLink/ThuaThienHue/ThuaThienHueLichSu.js';

import TraVinhDanhLam from './components/ProvinceLink/TraVinh/TraVinhDanhLam.js';
import TraVinh from './components/ProvinceLink/TraVinh/TraVinh.js';
import TraVinhLichSu from './components/ProvinceLink/TraVinh/TraVinhLichSu.js';

import VinhLongDanhLam from './components/ProvinceLink/VinhLong/VinhLongDanhLam.js';
import VinhLong from './components/ProvinceLink/VinhLong/VinhLong.js';
import VinhLongLichSu from './components/ProvinceLink/VinhLong/VinhLongLichSu.js';

import VinhPhucDanhLam from './components/ProvinceLink/VinhPhuc/VinhPhucDanhLam.js';
import VinhPhuc from './components/ProvinceLink/VinhPhuc/VinhPhuc.js';
import VinhPhucLichSu from './components/ProvinceLink/VinhPhuc/VinhPhucLichSu.js';

import VungTauDanhLam from './components/ProvinceLink/VungTau/VungTauDanhLam.js';
import VungTau from './components/ProvinceLink/VungTau/VungTau.js';
import VungTauLichSu from './components/ProvinceLink/VungTau/VungTauLichSu.js';

import YenBaiDanhLam from './components/ProvinceLink/YenBai/YenBaiDanhLam.js';
import YenBai from './components/ProvinceLink/YenBai/YenBai.js';
import YenBaiLichSu from './components/ProvinceLink/YenBai/YenBaiLichSu.js';

import ChatBot from './components/chatBot.js';

function App() {
    useEffect(() => {
        const handleContextMenu = (event) => {
            event.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/contact" element={<Contact />}></Route>
                <Route path="/provinceMainPage" element={<ProvinceMainPage />}></Route>
                <Route path="/elearning" element={<Elearning />}></Route>

                <Route path="/register" element={<Register />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/profile" element={<Profile />}></Route>
                <Route path="/profile/:userId" element={<UserProfile />}></Route>
                <Route path="/messages/:userId" element={<Messages />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/forgotpass" element={<ForgotPasswordModal />}></Route>

                <Route path="/blogcreate" element={<CreateBlog />}></Route>
                <Route path="/blog" element={<Bloglist />}></Route>
                <Route path="/blog/:id" element={<BlogView />} />
                <Route path="/blog/edit/:id" element={<BlogEdit />} />
                <Route path="/mypost" element={<MyPosts />} />

                <Route path="/chatbot" element={<ChatBot />} />

                <Route path="/createquiz" element={<CreateQuiz />} />
                <Route path="/listquiz" element={<QuizzesList />} />
                <Route path="/listquiz/:id" element={<ShowQuiz />} />
                <Route path="/myquiz" element=<MyQuiz /> />
                <Route path="/editquiz/:id" element=<EditQuiz /> />

                <Route path="/pratice" element={<Pratice />} />
                <Route path="/bot" element={<BotAnswer />} />

                <Route path="/inbox" element={<Inbox />} />

                <Route path="/studybot" element={<StudyBot />} />

                <Route path="/bac" element={<Bac />}></Route>
                <Route path="/nam" element={<Nam />}></Route>
                <Route path="/trung" element={<Trung />}></Route>

                <Route path="/course" element={<Course />}></Route>
                <Route path="/course1" element={<Course1 />}></Route>
                <Route path="/course2" element={<Course2 />}></Route>
                <Route path="/course3" element={<Course3 />}></Route>
                <Route path="/course4" element={<Course4 />}></Route>
                <Route path="/course5" element={<Course5 />}></Route>

                <Route path="/AnGiang" element={<AnGiang />}></Route>
                <Route path="/AnGiang-DLTC" element={<AnGiangDanhLam />}></Route>
                <Route path="/AnGiang-DTLS" element={<AnGiangLichSu />}></Route>

                <Route path="/BacGiang" element={<BacGiang />}></Route>
                <Route path="/BacGiang-DLTC" element={<BacGiangDanhLam />}></Route>
                <Route path="/BacGiang-DTLS" element={<BacGiangLichSu />}></Route>

                <Route path="/BacKan" element={<BacKan />}></Route>
                <Route path="/BacKan-DLTC" element={<BacKanDanhLam />}></Route>
                <Route path="/BacKan-DTLS" element={<BacKanLichSu />}></Route>

                <Route path="/BacLieu" element={<BacLieu />}></Route>
                <Route path="/BacLieu-DLTC" element={<BacLieuDanhLam />}></Route>
                <Route path="/BacLieu-DTLS" element={<BacLieuLichSu />}></Route>

                <Route path="/BacNinh" element={<BacNinh />}></Route>
                <Route path="/BacNinh-DLTC" element={<BacNinhDanhLam />}></Route>
                <Route path="/BacNinh-DTLS" element={<BacNinhLichSu />}></Route>

                <Route path="/BenTre" element={<BenTre />}></Route>
                <Route path="/BenTre-DLTC" element={<BenTreDanhLam />}></Route>
                <Route path="/BenTre-DTLS" element={<BenTreLichSu />}></Route>

                <Route path="/BinhDinh" element={<BinhDinh />}></Route>
                <Route path="/BinhDinh-DLTC" element={<BinhDinhDanhLam />}></Route>
                <Route path="/BinhDinh-DTLS" element={<BinhDinhLichSu />}></Route>

                <Route path="/BinhDuong" element={<BinhDuong />}></Route>
                <Route path="/BinhDuong-DLTC" element={<BinhDuongDanhLam />}></Route>
                <Route path="/BinhDuong-DTLS" element={<BinhDuongLichSu />}></Route>

                <Route path="/BinhPhuoc" element={<BinhPhuoc />}></Route>
                <Route path="/BinhPhuoc-DLTC" element={<BinhPhuocDanhLam />}></Route>
                <Route path="/BinhPhuoc-DTLS" element={<BinhPhuocLichSu />}></Route>

                <Route path="/BinhThuan" element={<BinhThuan />}></Route>
                <Route path="/BinhThuan-DLTC" element={<BinhThuanDanhLam />}></Route>
                <Route path="/BinhThuan-DTLS" element={<BinhThuanLichSu />}></Route>

                <Route path="/CaMau" element={<CaMau />}></Route>
                <Route path="/CaMau-DLTC" element={<CaMauDanhLam />}></Route>
                <Route path="/CaMau-DTLS" element={<CaMauLichSu />}></Route>

                <Route path="/CanTho" element={<CanTho />}></Route>
                <Route path="/CanTho-DLTC" element={<CanThoDanhLam />}></Route>
                <Route path="/CanTho-DTLS" element={<CanThoLichSu />}></Route>

                <Route path="/CaoBang" element={<CaoBang />}></Route>
                <Route path="/CaoBang-DLTC" element={<CaoBangDanhLam />}></Route>
                <Route path="/CaoBang-DTLS" element={<CaoBangLichSu />}></Route>

                <Route path="/DakLak" element={<DakLak />}></Route>
                <Route path="/DakLak-DLTC" element={<DakLakDanhLam />}></Route>
                <Route path="/DakLak-DTLS" element={<DakLakLichSu />}></Route>

                <Route path="/DakNong" element={<DakNong />}></Route>
                <Route path="/DakNong-DLTC" element={<DakNongDanhLam />}></Route>
                <Route path="/DakNong-DTLS" element={<DakNongLichSu />}></Route>

                <Route path="/DaNang" element={<DaNang />}></Route>
                <Route path="/DaNang-DLTC" element={<DaNangDanhLam />}></Route>
                <Route path="/DaNang-DTLS" element={<DaNangLichSu />}></Route>

                <Route path="/DienBien" element={<DienBien />}></Route>
                <Route path="/DienBien-DLTC" element={<DienBienDanhLam />}></Route>
                <Route path="/DienBien-DTLS" element={<DienBienLichSu />}></Route>

                <Route path="/DongNai" element={<DongNai />}></Route>
                <Route path="/DongNai-DLTC" element={<DongNaiDanhLam />}></Route>
                <Route path="/DongNai-DTLS" element={<DongNaiLichSu />}></Route>

                <Route path="/DongThap" element={<DongThap />}></Route>
                <Route path="/DongThap-DLTC" element={<DongThapDanhLam />}></Route>
                <Route path="/DongThap-DTLS" element={<DongThapLichSu />}></Route>

                <Route path="/GiaLai" element={<GiaLai />}></Route>
                <Route path="/GiaLai-DLTC" element={<GiaLaiDanhLam />}></Route>
                <Route path="/GiaLai-DTLS" element={<GiaLaiLichSu />}></Route>

                <Route path="/HaGiang" element={<HaGiang />}></Route>
                <Route path="/HaGiang-DLTC" element={<HaGiangDanhLam />}></Route>
                <Route path="/HaGiang-DTLS" element={<HaGiangLichSu />}></Route>

                <Route path="/HaiDuong" element={<HaiDuong />}></Route>
                <Route path="/HaiDuong-DLTC" element={<HaiDuongDanhLam />}></Route>
                <Route path="/HaiDuong-DTLS" element={<HaiDuongLichSu />}></Route>

                <Route path="/HaiPhong" element={<HaiPhong />}></Route>
                <Route path="/HaiPhong-DLTC" element={<HaiPhongDanhLam />}></Route>
                <Route path="/HaiPhong-DTLS" element={<HaiPhongLichSu />}></Route>

                <Route path="/HaNam" element={<HaNam />}></Route>
                <Route path="/HaNam-DLTC" element={<HaNamDanhLam />}></Route>
                <Route path="/HaNam-DTLS" element={<HaNamLichSu />}></Route>

                <Route path="/HaNoi" element={<HaNoi />}></Route>
                <Route path="/HaNoi-DLTC" element={<HaNoiDanhLam />}></Route>
                <Route path="/HaNoi-DTLS" element={<HaNoiLichSu />}></Route>

                <Route path="/HaTinh" element={<HaTinh />}></Route>
                <Route path="/HaTinh-DLTC" element={<HaTinhDanhLam />}></Route>
                <Route path="/HaTinh-DTLS" element={<HaTinhLichSu />}></Route>

                <Route path="/HauGiang" element={<HauGiang />}></Route>
                <Route path="/HauGiang-DLTC" element={<HauGiangDanhLam />}></Route>
                <Route path="/HauGiang-DTLS" element={<HauGiangLichSu />}></Route>

                <Route path="/HoaBinh" element={<HoaBinh />}></Route>
                <Route path="/HoaBinh-DLTC" element={<HoaBinhDanhLam />}></Route>
                <Route path="/HoaBinh-DTLS" element={<HoaBinhLichSu />}></Route>

                <Route path="/HungYen" element={<HungYen />}></Route>
                <Route path="/HungYen-DLTC" element={<HungYenDanhLam />}></Route>
                <Route path="/HungYen-DTLS" element={<HungYenLichSu />}></Route>

                <Route path="/KienGiang" element={<KienGiang />}></Route>
                <Route path="/KienGiang-DLTC" element={<KienGiangDanhLam />}></Route>
                <Route path="/KienGiang-DTLS" element={<KienGiangLichSu />}></Route>

                <Route path="/KonTum" element={<KonTum />}></Route>
                <Route path="/KonTum-DLTC" element={<KonTumDanhLam />}></Route>
                <Route path="/KonTum-DTLS" element={<KonTumLichSu />}></Route>

                <Route path="/KhanhHoa" element={<KhanhHoa />}></Route>
                <Route path="/KhanhHoa-DLTC" element={<KhanhHoaDanhLam />}></Route>
                <Route path="/KhanhHoa-DTLS" element={<KhanhHoaLichSu />}></Route>

                <Route path="/LaiChau" element={<LaiChau />}></Route>
                <Route path="/LaiChau-DLTC" element={<LaiChauDanhLam />}></Route>
                <Route path="/LaiChau-DTLS" element={<LaiChauLichSu />}></Route>

                <Route path="/LamDong" element={<LamDong />}></Route>
                <Route path="/LamDong-DLTC" element={<LamDongDanhLam />}></Route>
                <Route path="/LamDong-DTLS" element={<LamDongLichSu />}></Route>

                <Route path="/LangSon" element={<LangSon />}></Route>
                <Route path="/LangSon-DLTC" element={<LangSonDanhLam />}></Route>
                <Route path="/LangSon-DTLS" element={<LangSonLichSu />}></Route>

                <Route path="/LaoCai" element={<LaoCai />}></Route>
                <Route path="/LaoCai-DLTC" element={<LaoCaiDanhLam />}></Route>
                <Route path="/LaoCai-DTLS" element={<LaoCaiLichSu />}></Route>

                <Route path="/LongAn" element={<LongAn />}></Route>
                <Route path="/LongAn-DLTC" element={<LongAnDanhLam />}></Route>
                <Route path="/LongAn-DTLS" element={<LongAnLichSu />}></Route>

                <Route path="/NamDinh" element={<NamDinh />}></Route>
                <Route path="/NamDinh-DLTC" element={<NamDinhDanhLam />}></Route>
                <Route path="/NamDinh-DTLS" element={<NamDinhLichSu />}></Route>

                <Route path="/NinhBinh" element={<NinhBinh />}></Route>
                <Route path="/NinhBinh-DLTC" element={<NinhBinhDanhLam />}></Route>
                <Route path="/NinhBinh-DTLS" element={<NinhBinhLichSu />}></Route>

                <Route path="/NinhThuan" element={<NinhThuan />}></Route>
                <Route path="/NinhThuan-DLTC" element={<NinhThuanDanhLam />}></Route>
                <Route path="/NinhThuan-DTLS" element={<NinhThuanLichSu />}></Route>

                <Route path="/NgheAn" element={<NgheAn />}></Route>
                <Route path="/NgheAn-DLTC" element={<NgheAnDanhLam />}></Route>
                <Route path="/NgheAn-DTLS" element={<NgheAnLichSu />}></Route>

                <Route path="/PhuTho" element={<PhuTho />}></Route>
                <Route path="/PhuTho-DLTC" element={<PhuThoDanhLam />}></Route>
                <Route path="/PhuTho-DTLS" element={<PhuThoLichSu />}></Route>

                <Route path="/PhuYen" element={<PhuYen />}></Route>
                <Route path="/PhuYen-DLTC" element={<PhuYenDanhLam />}></Route>
                <Route path="/PhuYen-DTLS" element={<PhuYenLichSu />}></Route>

                <Route path="/QuangBinh" element={<QuangBinh />}></Route>
                <Route path="/QuangBinh-DLTC" element={<QuangBinhDanhLam />}></Route>
                <Route path="/QuangBinh-DTLS" element={<QuangBinhLichSu />}></Route>

                <Route path="/QuangNam" element={<QuangNam />}></Route>
                <Route path="/QuangNam-DLTC" element={<QuangNamDanhLam />}></Route>
                <Route path="/QuangNam-DTLS" element={<QuangNamLichSu />}></Route>

                <Route path="/QuangNinh" element={<QuangNinh />}></Route>
                <Route path="/QuangNinh-DLTC" element={<QuangNinhDanhLam />}></Route>
                <Route path="/QuangNinh-DTLS" element={<QuangNinhLichSu />}></Route>

                <Route path="/QuangNgai" element={<QuangNgai />}></Route>
                <Route path="/QuangNgai-DLTC" element={<QuangNgaiDanhLam />}></Route>
                <Route path="/QuangNgai-DTLS" element={<QuangNgaiLichSu />}></Route>

                <Route path="/QuangTri" element={<QuangTri />}></Route>
                <Route path="/QuangTri-DLTC" element={<QuangTriDanhLam />}></Route>
                <Route path="/QuangTri-DTLS" element={<QuangTriLichSu />}></Route>

                <Route path="/SocTrang" element={<SocTrang />}></Route>
                <Route path="/SocTrang-DLTC" element={<SocTrangDanhLam />}></Route>
                <Route path="/SocTrang-DTLS" element={<SocTrangLichSu />}></Route>

                <Route path="/SonLa" element={<SonLa />}></Route>
                <Route path="/SonLa-DLTC" element={<SonLaDanhLam />}></Route>
                <Route path="/SonLa-DTLS" element={<SonLaLichSu />}></Route>

                <Route path="/TayNinh" element={<TayNinh />}></Route>
                <Route path="/TayNinh-DLTC" element={<TayNinhDanhLam />}></Route>
                <Route path="/TayNinh-DTLS" element={<TayNinhLichSu />}></Route>

                <Route path="/TienGiang" element={<TienGiang />}></Route>
                <Route path="/TienGiang-DLTC" element={<TienGiangDanhLam />}></Route>
                <Route path="/TienGiang-DTLS" element={<TienGiangLichSu />}></Route>

                <Route path="/TPHCM" element={<TPHCM />}></Route>
                <Route path="/TPHCM-DLTC" element={<TPHCMDanhLam />}></Route>
                <Route path="/TPHCM-DTLS" element={<TPHCMLichSu />}></Route>

                <Route path="/TuyenQuang" element={<TuyenQuang />}></Route>
                <Route path="/TuyenQuang-DLTC" element={<TuyenQuangDanhLam />}></Route>
                <Route path="/TuyenQuang-DTLS" element={<TuyenQuangLichSu />}></Route>

                <Route path="/ThaiBinh" element={<ThaiBinh />}></Route>
                <Route path="/ThaiBinh-DLTC" element={<ThaiBinhDanhLam />}></Route>
                <Route path="/ThaiBinh-DTLS" element={<ThaiBinhLichSu />}></Route>

                <Route path="/ThaiNguyen" element={<ThaiNguyen />}></Route>
                <Route path="/ThaiNguyen-DLTC" element={<ThaiNguyenDanhLam />}></Route>
                <Route path="/ThaiNguyen-DTLS" element={<ThaiNguyenLichSu />}></Route>

                <Route path="/ThanhHoa" element={<ThanhHoa />}></Route>
                <Route path="/ThanhHoa-DLTC" element={<ThanhHoaDanhLam />}></Route>
                <Route path="/ThanhHoa-DTLS" element={<ThanhHoaLichSu />}></Route>

                <Route path="/ThuaThienHue" element={<ThuaThienHue />}></Route>
                <Route path="/ThuaThienHue-DLTC" element={<ThuaThienHueDanhLam />}></Route>
                <Route path="/ThuaThienHue-DTLS" element={<ThuaThienHueLichSu />}></Route>

                <Route path="/TraVinh" element={<TraVinh />}></Route>
                <Route path="/TraVinh-DLTC" element={<TraVinhDanhLam />}></Route>
                <Route path="/TraVinh-DTLS" element={<TraVinhLichSu />}></Route>

                <Route path="/VinhLong" element={<VinhLong />}></Route>
                <Route path="/VinhLong-DLTC" element={<VinhLongDanhLam />}></Route>
                <Route path="/VinhLong-DTLS" element={<VinhLongLichSu />}></Route>

                <Route path="/VinhPhuc" element={<VinhPhuc />}></Route>
                <Route path="/VinhPhuc-DLTC" element={<VinhPhucDanhLam />}></Route>
                <Route path="/VinhPhuc-DTLS" element={<VinhPhucLichSu />}></Route>

                <Route path="/VungTau" element={<VungTau />}></Route>
                <Route path="/VungTau-DLTC" element={<VungTauDanhLam />}></Route>
                <Route path="/VungTau-DTLS" element={<VungTauLichSu />}></Route>

                <Route path="/YenBai" element={<YenBai />}></Route>
                <Route path="/YenBai-DLTC" element={<YenBaiDanhLam />}></Route>
                <Route path="/YenBai-DTLS" element={<YenBaiLichSu />}></Route>
            </Routes>
        </div>
    );
}

export default App;
