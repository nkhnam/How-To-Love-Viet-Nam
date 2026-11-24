import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fname, setFname] = useState('');
    // const [lname, setLname] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [newPhotoURL, setNewPhotoURL] = useState('');
    const [error, setError] = useState(''); // State to hold error message
    const navigate = useNavigate(); // Hook to manage navigation

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser;
            console.log(user);

            if (user) {
                let photoURL = '';

                if (profilePic) {
                    const storageRef = ref(storage, `profilePics/${user.uid}`);
                    await uploadBytes(storageRef, profilePic);
                    photoURL = await getDownloadURL(storageRef);
                }

                await setDoc(doc(db, 'users', user.uid), {
                    email: email,
                    firstName: fname,
                    photo: photoURL,
                });

                await signInWithEmailAndPassword(auth, email, password);
            }

            navigate('/blog'); // Redirect to home or another desired page
            console.log('User Registered Successfully!!');
        } catch (error) {
            console.log(error.message);
            setError(error.message); // Set error message to state
        }
    };

    const handleImageChange = (e) => {
        setProfilePic(e.target.files[0]);
        const file = e.target.files[0];
        setNewPhotoURL(URL.createObjectURL(file));
    };

    return (
        <div className="registerContainer">
            <form onSubmit={handleRegister} className="registerForm">
                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Đăng ký</h3>

                <div className="avarta">
                    <img
                        src={newPhotoURL || 'https://i.postimg.cc/zXkPfDnB/logo192.png'}
                        alt="Profile"
                        width={'150px'}
                        height={'150px'}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                    />
                </div>

                <div className="input-container">
                    <label className="formLabel">Tên tài khoản* </label>
                    <input
                        maxLength="20"
                        type="text"
                        className="input-effect"
                        placeholder="Vd: Nguyễn Văn A"
                        onChange={(e) => setFname(e.target.value)}
                        required
                    />
                    <span className="focus-border"></span>
                </div>

                <div className="input-container">
                    <label className="formLabel">Email* </label>
                    <input
                        type="email"
                        className="input-effect"
                        placeholder="Vd: guest@gmail.com"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <span className="focus-border"></span>
                </div>

                <div className="input-container">
                    <label className="formLabel">Mật khẩu* </label>
                    <input
                        type="password"
                        className="input-effect"
                        placeholder="Vd: 123456@"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span className="focus-border"></span>
                </div>

                <div className="input-container">
                    <label className="formLabel">Ảnh đại diện </label>
                    <input type="file" className="custom-file-input" onChange={handleImageChange} accept="image/*" />
                </div>

                <div className="button-container">
                    <button type="submit" className="sign-button">
                        Tạo tài khoản
                    </button>
                </div>

                <p style={{ color: 'green', fontWeight: '600' }}>Trạng thái: {error}</p>

                <p className="forgot-password text-right">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;
