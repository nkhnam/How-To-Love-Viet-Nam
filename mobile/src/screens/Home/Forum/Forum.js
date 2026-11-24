import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Image, 
    FlatList, 
    StyleSheet, 
    ActivityIndicator,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../../Data/Firebase';
import { collection, doc, getDoc, query, limit, setDoc, getDocs, orderBy } from 'firebase/firestore';

const ITEMS_PER_PAGE = 20;
const DEFAULT_AVATAR = 'https://example.com/default-avatar.png';
const BlogsCollection = collection(db, 'blogs');

const Forum = () => {
    const navigation = useNavigation();
    const [userDetails, setUserDetails] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Memoize search results
    const searchResults = useMemo(() => {
        if (!search.trim()) return blogs;
        return blogs.filter((blog) =>
            blog.Title?.toLowerCase().includes(search.toLowerCase())
        );
    }, [blogs, search]);

    const fetchUserData = useCallback(async (user) => {
        try {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setUserDetails(docSnap.data());
            } else {
                const newUserDetails = {
                    firstName: user.displayName || 'User',
                    email: user.email,
                    photo: user.photoURL || DEFAULT_AVATAR,
                    createdAt: new Date(),
                };
                await setDoc(docRef, newUserDetails);
                setUserDetails(newUserDetails);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Không thể tải thông tin người dùng');
        }
    }, []);

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const q = query(
                BlogsCollection, 
                orderBy('published_on', 'desc'),
                limit(ITEMS_PER_PAGE)
            );
            
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            
            setBlogs(data);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setError('Không thể tải bài viết');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBlogs();
    }, [fetchBlogs]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserData(user);
            } else {
                setUserDetails(null);
            }
        });
        
        fetchBlogs();
        return () => unsubscribe();
    }, [fetchUserData, fetchBlogs]);

    const renderBlogItem = useCallback(({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ForumDetail', { id: item.id })}
            style={styles.blogItem}
        >
            {item.CoverURL && (
                <Image 
                    source={{ uri: item.CoverURL }} 
                    style={styles.blogCover}
                    resizeMode="cover"
                />
            )}
            <Text style={styles.blogTitle} numberOfLines={2}>
                {item.Title}
            </Text>
            <Text style={styles.blogSapo} numberOfLines={3}>
                {item.Sapo}
            </Text>
            {item.author && (
                <View style={styles.authorInfo}>
                    <Image
                        source={{ uri: item.author.photo || DEFAULT_AVATAR }}
                        style={styles.authorPhoto}
                    />
                    <Text style={styles.authorName} numberOfLines={1}>
                        {item.author.name}
                    </Text>
                    <Text style={styles.dateText}>
                        {new Date(item.published_on.seconds * 1000).toLocaleDateString('vi-VN')}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    ), [navigation]);

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={fetchBlogs}
                >
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.blogSectionBody}>
            <View style={styles.menuContainer}>
                {userDetails ? (
                    <View style={styles.userProfile}>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('SignUp')}
                            style={styles.avatarContainer}
                        >
                            <Image
                                source={{ uri: userDetails.photo || DEFAULT_AVATAR }}
                                style={styles.userAvatar}
                            />
                            <Text style={styles.displayName} numberOfLines={1}>
                                {userDetails.firstName}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('SignUp')}
                        style={styles.avatarContainer}
                    >
                        <Image
                            source={require('../../../assets/icon/account.jpg')}
                            style={styles.defaultAvatar}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.blogsContainer}>
                <View style={styles.searchWrapper}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm các bài viết"
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#666"
                    />
                </View>
                
                <Text style={styles.blogsTitle}>Bài viết nổi bật ✨</Text>
                
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={renderBlogItem}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !loading && (
                            <Text style={styles.emptyText}>
                                {search ? 'Không tìm thấy bài viết phù hợp' : 'Chưa có bài viết nào'}
                            </Text>
                        )
                    }
                    ListFooterComponent={
                        loading && <ActivityIndicator size="large" color="#0000ff" />
                    }
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    blogSectionBody: {
        flex: 1,
        backgroundColor: 'white',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        marginBottom: 10,
    },
    retryButton: {
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
    },
    menuContainer: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    displayName: {
        marginLeft: 12,
        fontSize: 18,
        flex: 1,
    },
    defaultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    blogsContainer: {
        flex: 1,
        padding: 16,
    },
    searchWrapper: {
        marginBottom: 16,
    },
    searchInput: {
        padding: 12,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 16,
    },
    blogsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    blogItem: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        padding: 12,
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    blogCover: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    blogTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    blogSapo: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    authorPhoto: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
    },
    authorName: {
        marginLeft: 8,
        fontSize: 14,
        flex: 1,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20,
    },
});

export default Forum;