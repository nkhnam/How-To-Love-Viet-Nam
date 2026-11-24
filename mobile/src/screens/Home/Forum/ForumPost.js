import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../../Data/Firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
// import { format } from 'date-fns';

const ForumPost = () => {
    const navigation = useNavigation();
    const [userBlogs, setUserBlogs] = useState([]);
    const [user, setUser] = useState(null);

    const fetchUserBlogs = async (user) => {
        try {
            const blogsQuery = query(collection(db, 'blogs'), where('author.uid', '==', user.uid));
            const querySnapshot = await getDocs(blogsQuery);
            const blogsData = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setUserBlogs(blogsData);
        } catch (error) {
            console.error('Error fetching user blogs: ', error);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                fetchUserBlogs(user);
            } else {
                console.log('User is not logged in');
                navigation.navigate('ForumEdit');
            }
        });
        return () => unsubscribe();
    }, []);

    const deleteBlog = async (id) => {
        try {
            await deleteDoc(doc(db, 'blogs', id));
            setUserBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
        } catch (error) {
            console.error('Error removing document: ', error);
        }
    };

    const confirmDelete = (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this blog post?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteBlog(id), style: 'destructive' },
            ],
            { cancelable: true }
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.blogItem}>
            <TouchableOpacity onPress={() => navigation.navigate('ForumDetail', { blogId: item.id })}>
                {item.CoverURL && (
                    <Image source={{ uri: item.CoverURL }} style={styles.blogCover} />
                )}
                <Text style={styles.blogTitle}>{item.Title}</Text>
                <Text style={styles.blogSapo} numberOfLines={2}>{item.Sapo}</Text>
            </TouchableOpacity>
            <View style={styles.blogFooter}>
                <View style={styles.authorInfo}>
                    <Image source={{ uri: item.author.photo || './logo192.png' }} style={styles.authorPhoto} />
                    <Text>{item.author.name}</Text>
                </View>
                {/* <Text>{format(new Date(item.published_on.seconds * 1000), 'dd/MM/yyyy')}</Text> */}
                <View style={styles.blogActions}>
                    <TouchableOpacity onPress={() => navigation.navigate('ForumEdit', { blogId: item.id })}>
                        <Text style={styles.editLink}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                        <Text style={styles.deleteButton}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBack}>
                <Text style={styles.goBackText}>Quay lại</Text>
            </TouchableOpacity>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Bài viết của bạn 🦜</Text>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('ForumEdit', { blogId: null })} 
                    style={styles.createButton}
                >
                    <Text style={styles.createButtonText}>Tạo bài viết</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={userBlogs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.blogsGrid}
            />
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
        padding: 16,
    },
    goBack: {
        marginBottom: 20,
    },
    goBackText: {
        color: 'blue',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    createButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 8,
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    blogsGrid: {
        paddingBottom: 20,
    },
    blogItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 16,
        paddingBottom: 16,
    },
    blogCover: {
        width: '100%',
        height: 200,
        marginBottom: 8,
    },
    blogTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    blogSapo: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    blogFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    blogActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editLink: {
        color: 'blue',
        marginRight: 16,
    },
    deleteButton: {
        color: 'red',
    },
};

export default ForumPost;