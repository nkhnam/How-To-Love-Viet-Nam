import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, realtimeDb, db } from '../firebase';
import { ref, push, onValue, set, update, remove } from 'firebase/database';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
// import './messages.css';

function Messages() {
    const { userId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [otherUserProfile, setOtherUserProfile] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async (uid) => {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        };

        const fetchAllUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setAllUsers(usersList);
        };

        const fetchConversations = async (currentUserUid) => {
            const messagesRef = ref(realtimeDb, 'messages');

            onValue(messagesRef, async (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const conversationsMap = {};
                    Object.entries(data).forEach(([chatId, messages]) => {
                        Object.values(messages).forEach((message) => {
                            const { sender, receiver, text, timestamp } = message;
                            const otherUserId = sender === currentUserUid ? receiver : sender;

                            if (sender === currentUserUid || receiver === currentUserUid) {
                                if (
                                    !conversationsMap[otherUserId] ||
                                    conversationsMap[otherUserId].timestamp < timestamp
                                ) {
                                    conversationsMap[otherUserId] = { text, timestamp, sender };
                                }
                            }
                        });
                    });

                    const conversationsList = await Promise.all(
                        Object.keys(conversationsMap).map(async (userId) => {
                            const userProfile = await fetchUserProfile(userId);
                            return {
                                id: userId,
                                name: userProfile?.firstName,
                                photo: userProfile?.photo,
                                latestMessage: conversationsMap[userId].text,
                                timestamp: conversationsMap[userId].timestamp,
                                sender: conversationsMap[userId].sender,
                            };
                        }),
                    );

                    setConversations(conversationsList.sort((a, b) => b.timestamp - a.timestamp));
                } else {
                    setConversations([]);
                }
            });
        };

        const fetchData = async () => {
            const currentUserProfile = await fetchUserProfile(auth.currentUser.uid);
            setUserProfile(currentUserProfile);

            if (userId) {
                const otherUserProfile = await fetchUserProfile(userId);
                setOtherUserProfile(otherUserProfile);

                const chatId = [auth.currentUser.uid, userId].sort().join('_');
                const messagesRef = ref(realtimeDb, 'messages/' + chatId);

                onValue(messagesRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        setMessages(Object.entries(data).map(([key, val]) => ({ id: key, ...val })));
                    } else {
                        setMessages([]);
                    }
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                fetchData();
                fetchConversations(user.uid);
                fetchAllUsers();
            } else {
                setIsAuthenticated(false);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    const sendMessage = async () => {
        if (auth.currentUser && newMessage.trim() !== '') {
            const chatId = [auth.currentUser.uid, userId].sort().join('_');
            const messagesRef = ref(realtimeDb, 'messages/' + chatId);
            const timestamp = Date.now();
            const newMessageData = {
                sender: auth.currentUser.uid,
                receiver: userId,
                text: newMessage,
                timestamp,
            };

            push(messagesRef, newMessageData)
                .then(() => {
                    setNewMessage('');
                })
                .catch((error) => {
                    console.error('Error sending message: ', error);
                });
        }
    };

    const editMessage = (id, text) => {
        setEditingMessageId(id);
        setNewMessage(text);
    };

    const deleteMessage = (id) => {
        if (auth.currentUser) {
            const chatId = [auth.currentUser.uid, userId].sort().join('_');
            const messageRef = ref(realtimeDb, `messages/${chatId}/${id}`);
            remove(messageRef).then(() => {
                if (editingMessageId === id) {
                    setEditingMessageId(null);
                    setNewMessage('');
                }

                // Check if there are any remaining messages
                const messagesRef = ref(realtimeDb, `messages/${chatId}`);
                onValue(
                    messagesRef,
                    (snapshot) => {
                        const data = snapshot.val();
                        if (!data) {
                            // No remaining messages, navigate to "/messages"
                            navigate('/messages');
                        }
                    },
                    { onlyOnce: true },
                );
            });
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/messages/${userId}`);
        setSearchTerm('');
    };

    const filteredUsers = allUsers.filter((user) =>
        (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
    );

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div className="please-log-in">Please log in to view and send messages.</div>;
    }

    return (
        <div className="chat-container">
            <div className="sidebar" id="sidebar">
                <div className="sidebar-header">
                    <h2>Chats</h2>
                    <input type="text" placeholder="Search users" onChange={handleSearch} value={searchTerm} />
                </div>
                <div className="user-list">
                    {searchTerm
                        ? filteredUsers.map((user) => (
                              <div key={user.id} className="user-item" onClick={() => handleUserClick(user.id)}>
                                  <img src={user.photo || './logo192.png'} alt="avatar" />
                                  <div>
                                      <span>{user.firstName}</span>
                                      <span className="latest-message">
                                          {`${user.latestMessage} - ${
                                              user.timestamp ? formatDistanceToNow(new Date(user.timestamp)) : ''
                                          } ago`}
                                      </span>
                                  </div>
                              </div>
                          ))
                        : conversations.map((user) => (
                              <div key={user.id} className="user-item" onClick={() => handleUserClick(user.id)}>
                                  <img src={user.photo || './logo192.png'} alt="avatar" />
                                  <div>
                                      <span>{user.name}</span>
                                      <span className="latest-message">
                                          {`${user.sender === auth.currentUser.uid ? 'You' : user.name}: ${
                                              user.latestMessage
                                          }`}
                                      </span>
                                  </div>
                              </div>
                          ))}
                </div>
            </div>
            <div className="main-content">
                {userId ? (
                    <>
                        <div className="messages-header">
                            <h2>{otherUserProfile?.firstName}</h2>
                        </div>
                        <div className="messages-list">
                            {messages.map((msg) => {
                                const isSentByCurrentUser = msg.sender === auth.currentUser.uid;
                                const profile = isSentByCurrentUser ? userProfile : otherUserProfile;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`message comment-item ${isSentByCurrentUser ? 'sent' : 'received'}`}
                                    >
                                        <img
                                            src={profile?.photo || './logo192.png'}
                                            alt="avatar"
                                            className={`avatar ${!isSentByCurrentUser ? 'block' : 'none'}`}
                                        />

                                        <div
                                            className="comment-container"
                                            style={{ alignItems: `${isSentByCurrentUser ? 'flex-end' : 'start'}` }}
                                        >
                                            <span style={{ fontSize: '16px', fontWeight: '700' }}>
                                                {profile?.firstName}
                                            </span>
                                            <p>
                                                {msg.text}
                                                {msg.edited && <span className="edited-label"> (edited)</span>}
                                            </p>
                                        </div>

                                        <img
                                            src={profile?.photo || './logo192.png'}
                                            alt="avatar"
                                            className={`avatar ${isSentByCurrentUser ? 'block' : 'none'}`}
                                        />

                                        <span
                                            className={`message-time ${
                                                !isSentByCurrentUser ? 'message-time-right' : 'message-time-left'
                                            }`}
                                        >
                                            {msg.timestamp ? formatDistanceToNow(new Date(msg.timestamp)) : ''} ago
                                        </span>

                                        {isSentByCurrentUser && (
                                            <div className="message-actions">
                                                <button onClick={() => editMessage(msg.id, msg.text)}>Edit</button>
                                                <button onClick={() => deleteMessage(msg.id)}>Delete</button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="messages-input">
                            <input
                                id="input-text-message"
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Aa"
                            />
                            <svg
                                viewBox="0 0 12 13"
                                onClick={newMessage.trim() !== '' ? sendMessage : null}
                                width="20"
                                height="20"
                                fill="currentColor"
                                className={`send-icon ${newMessage.trim() !== '' ? 'enabled' : 'disabled'}`}
                            >
                                <g fillRule="evenodd" transform="translate(-450 -1073)">
                                    <path
                                        d="m458.371 1079.75-6.633.375a.243.243 0 0 0-.22.17l-.964 3.255c-.13.418-.024.886.305 1.175a1.08 1.08 0 0 0 1.205.158l8.836-4.413c.428-.214.669-.677.583-1.167-.06-.346-.303-.633-.617-.79l-8.802-4.396a1.073 1.073 0 0 0-1.183.14c-.345.288-.458.77-.325 1.198l.963 3.25c.03.097.118.165.22.17l6.632.375s.254 0 .254.25-.254.25-.254.25"
                                        style={{ color: newMessage.trim() !== '' ? 'blue' : 'gray' }}
                                    />
                                </g>
                            </svg>
                        </div>
                    </>
                ) : (
                    <img
                        src="https://www.shawmarketingservices.com/wp-content/uploads/2019/01/bigstock-Digital-Statistics-Collecting-262034506.jpg"
                        alt=""
                        style={{ width: '100%', height: '100%' }}
                    />
                )}
            </div>
        </div>
    );
}

export default Messages;
