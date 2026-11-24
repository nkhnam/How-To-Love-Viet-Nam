import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, realtimeDb, db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function Inbox() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                fetchConversations(user.uid);
            } else {
                setIsAuthenticated(false);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchUserProfile = async (uid) => {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    };

    const fetchConversations = async (currentUserUid) => {
        const messagesRef = ref(realtimeDb, 'messages');

        onValue(messagesRef, async (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const conversationsMap = {};
                Object.entries(data).forEach(([chatId, messages]) => {
                    Object.values(messages).forEach((message) => {
                        const { sender, receiver } = message;
                        const otherUserId = sender === currentUserUid ? receiver : sender;

                        if (sender === currentUserUid || receiver === currentUserUid) {
                            conversationsMap[otherUserId] = true;
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
                        };
                    }),
                );

                setConversations(conversationsList);
            } else {
                setConversations([]);
            }
            setLoading(false);
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <div>Please log in to view and send messages.</div>;
    }

    return (
        <div className="inbox-container">
            <h2>Your Conversations</h2>
            <div className="conversation-list">
                {conversations.length > 0 ? (
                    conversations.map((conversation) => (
                        <div key={conversation.id} className="conversation-item">
                            <Link to={`/messages/${conversation.id}`} className="conversation-link">
                                <img src={conversation.photo || '/logo192.png'} alt="avatar" className="avatar" />
                                <span>{conversation.name}</span>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div>No conversations found.</div>
                )}
            </div>
        </div>
    );
}

export default Inbox;
