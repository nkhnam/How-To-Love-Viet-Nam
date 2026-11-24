
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from '../firebase';
import { collection, doc, deleteDoc, getDocs, getDoc, query, limit, setDoc } from "firebase/firestore";
import { FaPen, FaEraser } from 'react-icons/fa';
import Header from '../Header/Header';



const FeaturePages = () => {
    
    const [userDetails, setUserDetails] = useState(null);
    const navigate = useNavigate();
    
    
    
    //Lấy dữ liệu user
    const fetchUserData = async (user) => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        } else {
        // Tạo tài liệu người dùng mới nếu không tồn tại
        const newUserDetails = {
            firstName: user.displayName,
            email: user.email,
            photo: user.photoURL,
        };
        await setDoc(docRef, newUserDetails);
        setUserDetails(newUserDetails);
        }
    };
    
    //Xem user
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            fetchUserData(user);
          } else {
            console.log("User is not logged in");
            alert("Người dùng chưa đăng nhập")
          }
        });
        return () => unsubscribe();
    }, []);


    return (
        <>
            <Header backgroundColor={"white"}></Header>
            <div className='blog-section-body' style={{backgroundColor: "white"}}>
                <div className='blogs-container-section'>

                        <div className='menu-container-blog menu-container-feature'>
                            <div className='menu-item'>
                                {userDetails && (
                                    <Link className='blog-profile' to="/profile">
                                        <img src={userDetails.photo || './logo192.png'} alt="User Avatar" className="user-avatar" />
                                        <span className='displayName'>Chào mừng bạn, {userDetails.firstName}</span>
                                    </Link>
                                )}

                                {!userDetails && (
                                    <>
                                        <Link to="/login" className="menu-item add-post feature-login">
                                            Đăng nhập
                                        </Link>

                                        <Link to="/register" className="menu-item add-post edit-delete-post">
                                            Đăng kí
                                        </Link>

                                    </>

                                )}
                            </div>

                            {/* <div className='add-delete-container'>
                                <Link to="/blogcreate" className="menu-item add-post">
                                    Viết blog
                                </Link>

                                <Link to="/mypost" className="menu-item edit-delete-post">
                                    Blog của tôi
                                </Link>

                            </div> */}
                        </div>

                    <h1 className="blogs-display-title">Trang tính năng website 😍</h1>

                    
                    <div className="blogs-grid">
                        
                        <Link to={"/blog"} key={" "} className="blog-item">
                            

                            <img src={" "} alt='' className='blog-cover' />
                            <p className='blogs-title'>Tính năng blog (Trang diễn đàn) Hisflash-Hub</p>
                            <p className='blogs-sapo'>Nơi người dùng, đặc biệt là học sinh và sinh viên có thể chia sẻ, trao đổi và bàn luận kiến thức về lịch sử, văn hóa của Việt Nam</p>

                            {/* {user && user.uid === blog.author.uid && (
                                <div className="blog-actions">
                                    <Link
                                        to={"/blog/edit/" + blog.id}
                                        className="edit-link"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => DeleteBlog(blog.id)}
                                        className="delete-button"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )} */}


                        </Link>

                    </div>

                </div>

            </div>
        </>
    );
};

export default FeaturePages;