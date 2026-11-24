import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './profile.css';
import { useNavigate, Link } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState(null);
    const [editing, setEditing] = useState(false);
    const [newFirstName, setNewFirstName] = useState('');
    const [newPhotoURL, setNewPhotoURL] = useState('');
    const [imageFile, setImageFile] = useState(null); // Store the file to upload
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [userBlogs, setUserBlogs] = useState([]);

    const fetchUserBlogs = async (uid) => {
        const q = query(collection(db, 'blogs'), where('author.uid', '==', uid));
        const querySnapshot = await getDocs(q);
        const blogs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserBlogs(blogs);
    };

    const fetchUserData = async (user) => {
        const docRef = doc(db, 'users', user.uid);
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

    const fetchAllUsers = async () => {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserData(user);
                fetchAllUsers();
                fetchUserBlogs(user.uid);
            } else {
                console.log('User is not logged in');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            localStorage.clear();
            window.location.href = '/';
            console.log('User logged out successfully!');
        } catch (error) {
            console.error('Error logging out:', error.message);
        }
    };

    const handleEditProfile = () => {
        setEditing(true);
        setNewFirstName(userDetails.firstName);
        setNewPhotoURL(userDetails.photo);
    };

    const handleSaveProfile = async () => {
        try {
            const updatedFirstName = newFirstName.trim() === '' ? userDetails.firstName : newFirstName;

            let updatedData = { firstName: updatedFirstName };

            if (imageFile) {
                const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
                await uploadBytes(storageRef, imageFile);
                const downloadURL = await getDownloadURL(storageRef);
                updatedData.photo = downloadURL;
            }

            const docRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(docRef, updatedData);
            await fetchUserData(auth.currentUser); // Update userDetails
            setEditing(false);
            console.log('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setNewPhotoURL(URL.createObjectURL(file));
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = users.filter((user) =>
        (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
    );

    return (
        <>
            <Link to="/" className="go-back">
                <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="chevron-left"
                    className="svg-back svg-inline--fa fa-chevron-left "
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                >
                    <path
                        fill="currentColor"
                        d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z"
                    ></path>
                </svg>
                Quay lại
            </Link>
            <div className="profile-main">
                <div className="profile-container">
                    {userDetails ? (
                        <>
                            <img src="" alt="" className="profile-background"></img>
                            <div className="profile-header">
                                <div className="profile-header-wrapped">
                                    <div className="profile-header-avarta">
                                        <img
                                            style={{}}
                                            src={newPhotoURL || userDetails.photo || './logo192.png'}
                                            alt="Profile"
                                        />
                                    </div>
                                    {!editing && <div className="profile-name">{userDetails.firstName}</div>}
                                </div>
                            </div>

                            <div className="other-info-wrapped">
                                {editing ? (
                                    <div className="profile-edit">
                                        <div className="input-container">
                                            <label htmlFor="newFirstName">Tên tài khoản:</label>
                                            <input
                                                maxLength="20"
                                                className="input-effect"
                                                id="newFirstName"
                                                type="text"
                                                value={newFirstName}
                                                onChange={(e) => setNewFirstName(e.target.value)}
                                                required
                                            />
                                            <span className="focus-border"></span>
                                        </div>

                                        <div className="input-container">
                                            <label htmlFor="newPhoto">Ảnh đại diện: </label>
                                            <input
                                                className="custom-file-input"
                                                id="newPhoto"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </div>

                                        <div className="profile-buttons">
                                            <button onClick={handleSaveProfile}>✏️ Lưu thay đổi</button>
                                            <button className="btn-primary" onClick={() => setEditing(false)}>
                                                ✨ Hủy
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="profile-details">
                                            <p>
                                                <strong style={{ fontWeight: '600' }}>Tên tài khoản:</strong>{' '}
                                                {userDetails.firstName}
                                            </p>
                                            <p>
                                                <strong style={{ fontWeight: '600' }}>Email:</strong>{' '}
                                                {userDetails.email}
                                            </p>
                                        </div>
                                        <div className="profile-buttons">
                                            <button onClick={handleEditProfile}>✏️ Chỉnh sửa</button>
                                            <button className="btn-primary" onClick={handleLogout}>
                                                ✨ Đăng xuất
                                            </button>
                                        </div>
                                    </>
                                )}

                                <>
                                    <div className="user-blogs">
                                        <h2 style={{ color: '#292929', marginBottom: '24px' }}>
                                            Bài viết của người dùng
                                        </h2>
                                        {userBlogs.length === 0 && (
                                            <p style={{ fontSize: '18px' }}>Chưa có bài viết nào</p>
                                        )}

                                        <div className="blogs-list">
                                            {userBlogs.map((blog) => (
                                                <div
                                                    key={blog.id}
                                                    className="blog-item blog-user-item"
                                                    onClick={() => navigate(`/blog/${blog.id}`)}
                                                >
                                                    <img
                                                        src={blog.CoverURL}
                                                        alt=""
                                                        style={{
                                                            width: '30%',
                                                            height: '200px',
                                                            objectFit: 'cover',
                                                            borderRadius: '15px',
                                                        }}
                                                        className="user-blog-cover-img"
                                                    ></img>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            width: '70%',
                                                            paddingLeft: '24px',
                                                        }}
                                                        className="user-blog-wrapped"
                                                    >
                                                        <h3 style={{ fontSize: '1.4rem' }} className="user-blog-title">
                                                            {blog.Title}
                                                        </h3>
                                                        <p className="user-blog-description">{blog.Sapo}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="search-section">
                                        <h1 class="blogs-display-title" style={{ marginBottom: '0' }}>
                                            Histflash community ✨
                                        </h1>
                                        <div
                                            className="search-bar"
                                            style={{
                                                padding: '32px 0',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <input
                                                id="searchQueryInput"
                                                type="text"
                                                placeholder="Tìm kiếm người dùng"
                                                value={searchTerm}
                                                onChange={handleSearch}
                                                style={{ maxWidth: '70%' }}
                                            />
                                            <button id="searchQuerySubmit" type="submit" name="searchQuerySubmit">
                                                <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px' }}>
                                                    <path
                                                        fill="#666666"
                                                        d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                                                    ></path>
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="user-list" style={{ display: 'grid', cursor: 'pointer' }}>
                                            {filteredUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="user-item"
                                                    onClick={() => navigate(`/profile/${user.id}`)}
                                                    style={{ display: 'flex' }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            cursor: 'pointer',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            flexDirection: 'row',
                                                            gap: '12px',
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                user.photo ||
                                                                'https://i.postimg.cc/zXkPfDnB/logo192.png'
                                                            }
                                                            alt="User"
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                objectFit: 'cover',
                                                                border: '1px solid #000',
                                                                borderRadius: '50%',
                                                                marginRight: '0',
                                                            }}
                                                        />
                                                        <div style={{ fontSize: '18px', fontWeight: '600' }}>
                                                            {user.firstName}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            </div>

                            <button className="inbox-btn" onClick={() => navigate('/messages')}>
                                📩 Hộp thư
                            </button>

                            <button className="inbox-btn-mobile inbox-btn" onClick={() => navigate('/inbox')}>
                                📩
                            </button>
                        </>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default Profile;
