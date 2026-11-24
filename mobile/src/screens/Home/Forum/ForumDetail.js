import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { auth, db } from '../../Data/Firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import RenderHTML from 'react-native-render-html'; // Import thư viện render HTML

const ForumDetail = () => {
    const route = useRoute();
    const { id } = route.params;
    const [blog, setBlog] = useState({});
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [replyContent, setReplyContent] = useState('');
    const [replyToCommentId, setReplyToCommentId] = useState(null);
    const [showReplies, setShowReplies] = useState({});
    const navigation = useNavigation();
    const screenWidth = Dimensions.get('window').width; // Lấy kích thước màn hình

    useEffect(() => {
        const getBlog = async () => {
            try {
                const docRef = doc(db, 'blogs', id);
                const docSnapshot = await getDoc(docRef);
                if (docSnapshot.exists()) {
                    const blogData = docSnapshot.data();
                    setBlog(blogData);
                    setLikes(blogData.likes || 0);
                    setComments(blogData.comments || []);
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching blog: ', error);
            }
        };

        const fetchUserData = async (uid) => {
            try {
                const userDoc = await getDoc(doc(db, 'users', uid));
                if (userDoc.exists()) {
                    setUser(userDoc.data());
                }
            } catch (error) {
                console.error('Error fetching user data: ', error);
            }
        };

        const checkIfLiked = async (uid) => {
            try {
                const docRef = doc(db, 'blogs', id);
                const docSnapshot = await getDoc(docRef);
                if (docSnapshot.exists()) {
                    const blogData = docSnapshot.data();
                    if (blogData.likedBy?.includes(uid)) {
                        setIsLiked(true);
                    } else {
                        setIsLiked(false);
                    }
                }
            } catch (error) {
                console.error('Error checking if liked: ', error);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                fetchUserData(currentUser.uid);
                checkIfLiked(currentUser.uid);
            }
        });

        getBlog();

        return () => unsubscribe();
    }, [id]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        if (!user) {
            console.error('User not authenticated');
            return;
        }

        const comment = {
            userId: auth.currentUser.uid,
            userName: user.firstName || 'Anonymous',
            userPhoto: user.photo || 'https://primex-bd.com/logo192.png',
            content: newComment,
            timestamp: new Date(),
        };

        try {
            const docRef = doc(db, 'blogs', id);
            await updateDoc(docRef, {
                comments: arrayUnion(comment),
            });
            setComments([...comments, comment]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment: ', error);
        }
    };

    const { Sapo, Body, Title, CoverURL } = blog;

    return (
        <ScrollView contentContainerStyle={styles.scrollView}>
            
            <View style={styles.goBack}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.goBackText}>&lt;</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.blogDetailContainer}>
                <Text style={styles.blogTitle}>{Title}</Text>
                {CoverURL && <Image source={{ uri: CoverURL }} style={styles.coverImage} />}
                <RenderHTML
                    contentWidth={screenWidth}
                    source={{ html: Sapo || '<p>Không có mô tả</p>' }}
                />
                <RenderHTML
                    contentWidth={screenWidth}
                    source={{ html: Body || '<p>Không có nội dung</p>' }}
                />

                <View style={styles.likeContainer}>
                    <TouchableOpacity
                        style={isLiked ? [styles.likeButton, styles.liked] : styles.likeButton}
                        onPress={() => setIsLiked(!isLiked)}
                    >
                        <Text>{isLiked ? '❤️' : '🤍'}</Text>
                        <Text style={styles.likesCount}>{likes}</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.commentInput}
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Viết bình luận của bạn"
                    multiline={true}
                />
                <TouchableOpacity style={styles.commentButton} onPress={handleCommentSubmit}>
                    <Text style={styles.commentButtonText}>Gửi</Text>
                </TouchableOpacity>

                <Text style={styles.commentTitle}>Bình luận</Text>
                {comments.map((comment, index) => (
                    <View key={index} style={styles.commentContainer}>
                        <Image source={{ uri: comment.userPhoto }} style={styles.commentUserPhoto} />
                        <View style={styles.commentContent}>
                            <Text style={styles.commentUserName}>{comment.userName}</Text>
                            <RenderHTML
                                contentWidth={screenWidth}
                                source={{ html: comment.content }}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 1,
        paddingVertical: 20,
    },
    goBack:{
        left: 10,
        width: 45,
        height: 45,
        backgroundColor: '#A5A5A5',
        borderRadius: 100,
    },
    goBackText: {
        color: 'white',
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 30,
    },
    blogDetailContainer: {
        padding: 20,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    authorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    authorName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    timePost: {
        fontSize: 14,
        color: '#888',
    },
    blogTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    coverImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
    },
    blogContent: {
        marginBottom: 20,
    },
    blogSapo: {
        fontSize: 18,
        fontStyle: 'italic',
        lineHeight: 24,
        color:         '#292929',
        marginBottom: 20,
    },
    blogBody: {
        fontSize: 20,
        lineHeight: 26,
    },
    likeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    liked: {
        color: 'red', 
    },
    checkboxContainer: {
        marginRight: 5,
    },
    likesCount: {
        fontSize: 16,
        marginLeft: 5,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    commentButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 10,
    },
    commentButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    signInText: {
        marginBottom: 10,
        fontSize: 16,
        color: '#888',
    },
    commentTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    commentContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    commentUserPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
    },
    commentUserName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    commentText: {
        fontSize: 16,
        marginBottom: 5,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    commentActionButtons: {
        flexDirection: 'row',
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: '#f44336',
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 5,
    },
    editButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 5,
    },
    replyButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#007AFF',
        borderRadius: 10,
        marginLeft: 'auto',
    },
    replyInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
    },
    showHideRepliesButton: {
        marginBottom: 10,
        color: '#888',
    },
    replyContainer: {
        flexDirection: 'row',
        marginLeft: 50,
        marginBottom: 10,
    },
    replyUserPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    replyContent: {
        flex: 1,
    },
    replyUserName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    replyText: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default ForumDetail;

