import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, Button, ScrollView } from 'react-native';
import { Timestamp, collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../Data/Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
// import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

const ForumCreatePost = () => {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [sapo, setSapo] = useState('');
    const [body, setBody] = useState('');
    const [cover, setCover] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [user, setUser] = useState(null);
    const [authorDetails, setAuthorDetails] = useState(null);

    const fetchAuthorDetails = async (uid) => {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setAuthorDetails(docSnap.data());
        } else {
            console.error('No such user document!');
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                fetchAuthorDetails(user.uid);
            } else {
                console.log('User is not logged in');
                navigation.navigate('SignUp');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleCoverImgChange = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets) {
                const file = response.assets[0];
                setCover(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setCoverPreview(reader.result);
                };
                reader.readAsDataURL(file.uri);
            }
        });
    };

    const uploadImage = async (image) => {
        if (!image) return null;
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `covers/${image.fileName}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    const sub = async () => {
        try {
            const coverUrl = await uploadImage(cover);
            const currentUser = auth.currentUser;

            // Ensure we have user details to store
            if (!currentUser || !authorDetails) {
                throw new Error('User details are missing');
            }

            // Add data to the store
            await addDoc(collection(db, 'blogs'), {
                Title: title,
                Sapo: sapo,
                Body: body,
                CoverURL: coverUrl,
                publish: false,
                published_on: Timestamp.fromDate(new Date()),
                author: {
                    uid: currentUser.uid,
                    name: authorDetails.firstName,
                    photo: authorDetails.photo,
                },
            });

            navigation.navigate('Forum');
        } catch (error) {
            console.error('Error adding document: ', error);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
                <Text style={{ color: 'blue' }}>Quay lại</Text>
            </TouchableOpacity>
            <TextInput
                style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 16, padding: 8 }}
                placeholder="Tiêu đề bài viết"
                onChangeText={setTitle}
                value={title}
            />
            <TextInput
                style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 16, padding: 8 }}
                placeholder="Giới thiệu bài viết"
                onChangeText={setSapo}
                value={sapo}
            />
            <RichEditor
                style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 16, height: 300 }}
                editorStyle={{ backgroundColor: 'white' }}
                placeholder="Nội dung của bài viết"
                // initialContentHTML="<i>Nội dung của bài viết</i>"
                onChange={setBody}
            />
            <RichToolbar editor={RichEditor} actions={[actions.setBold, actions.setItalic, actions.insertImage]} />
            <Button title="Chọn ảnh bìa" onPress={handleCoverImgChange} />
            {coverPreview && <Image source={{ uri: coverPreview }} style={{ width: '100%', height: 200, marginTop: 16 }} />}
            <Button title="Xuất bản bài viết" onPress={sub} />
        </ScrollView>
    );
};


export default ForumCreatePost;
