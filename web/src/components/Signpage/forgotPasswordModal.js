import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

function ForgotPasswordModal() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Đặt lại mật khẩu đã được gửi đến email của bạn.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 5000);
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="registerContainer">
            <div className="forgotForm">
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Đặt lại mật khẩu</h3>
                <form onSubmit={handleResetPassword}>
                    <label className="formLabel">Email:</label>
                    <input
                        type="email"
                        className="input-effect"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <span className="focus-border"></span>

                    <button className="sign-button" type="submit">
                        Gửi liên kết
                    </button>
                </form>
                {<p style={{ color: 'green', fontWeight: '600', marginTop: '10px' }}>Trạng thái: {message}</p>}
            </div>
        </div>
    );
}

export default ForgotPasswordModal;
