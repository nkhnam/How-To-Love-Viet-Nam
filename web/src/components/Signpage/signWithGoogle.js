// src/components/SignWithGoogle.js

import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const SignWithGoogle = () => {
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            console.log('User signed in with Google');
            navigate('/blog');
        } catch (error) {
            console.log('Error signing in with Google: ', error.message);
        }
    };

    return (
        <div className="button-container">
            <button className="social-button" id="google-connect" onClick={handleGoogleSignIn}>
                <span>Connect with Google</span>
            </button>
        </div>
    );
};

export default SignWithGoogle;
