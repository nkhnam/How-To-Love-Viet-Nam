import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';
import SignWithGoogle from './signWithGoogle';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State to hold error message
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in successfully');
            navigate('/blog');
        } catch (error) {
            console.log(error.message);
            setError(error.message); // Set error message to state
            setTimeout(() => {
                setError(''); // Clear the error message after 5 seconds
            }, 5000);
        }
    };

    return (
        <div className="registerContainer">
            <div className="registerForm">
                <form onSubmit={handleSubmit} className="login-form-submit">
                    <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Đăng nhập</h3>

                    <div className="input-container">
                        <label className="formLabel">Email*</label>
                        <input
                            type="email"
                            className="input-effect"
                            placeholder="Vd: guest@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <span className="focus-border"></span>
                    </div>

                    <div className="input-container">
                        <label className="formLabel">Mật khẩu*</label>
                        <input
                            type="password"
                            className="input-effect"
                            placeholder="Vd: 123456@"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span className="focus-border"></span>
                    </div>

                    <div className="button-container">
                        <button type="submit" className="sign-button">
                            Đăng nhập
                        </button>
                    </div>

                    <p style={{ color: 'green', fontWeight: '600' }}>Trạng thái: {error}</p>

                    <p className="forgot-password text-right">
                        Người dùng mới? <Link to="/register">Đăng kí</Link>
                    </p>

                    <p className="forgot-password text-right">
                        <Link to="/forgotpass" type="button" className="forgot-password-button">
                            Quên mật khẩu?
                        </Link>
                    </p>
                </form>
                <SignWithGoogle />
            </div>
        </div>
    );
}

export default Login;
