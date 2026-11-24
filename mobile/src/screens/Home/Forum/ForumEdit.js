import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Timestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db, storage } from '../../Data/Firebase';
import { collection } from 'firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

const BlogsCollection = collection(db, 'blogs');

const ForumEdit = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;
    const [title, setTitle] = useState('');
    const [sapo, setSapo] = useState('');
    const [body, setBody] = useState('');
    const [cover, setCover] = useState(null);
    const [coverUrl, setCoverUrl] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const docRef = doc(BlogsCollection, id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.Title);
                    setSapo(data.Sapo);
                    setBody(data.Body);
                    setCoverUrl(data.CoverURL);
                } else {
                    console.error('No such document!');
                }
            } catch (error) {
                console.error('Error fetching document:', error);
            }
        };

        fetchData();
    }, [id]);

    const handleCoverChange = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (!response.didCancel && !response.error) {
                const file = response.assets[0];
                setCover(file);
                setCoverUrl(file.uri);
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

    const handleSubmit = async () => {
        const docRef = doc(BlogsCollection, id);

        try {
            let updatedCoverUrl = coverUrl;

            if (cover) {
                updatedCoverUrl = await uploadImage(cover);
            }

            await updateDoc(docRef, {
                Title: title,
                CoverURL: updatedCoverUrl,
                Sapo: sapo,
                Body: body,
                last_Updated: Timestamp.fromDate(new Date()),
            });
            navigation.navigate('MyPosts');
        } catch (error) {
            console.error('Error updating document:', error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBack}>
                <Text style={styles.goBackText}>Quay lại</Text>
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Tiêu đề bài viết"
                value={title}
                onChangeText={setTitle}
            />

            <TextInput
                style={styles.input}
                placeholder="Giới thiệu bài viết"
                value={sapo}
                onChangeText={setSapo}
            />

            <View style={styles.editorContainer}>
                <RichEditor
                    initialContentHTML={body}
                    onChange={setBody}
                    editorStyle={{ backgroundColor: 'white' }}
                    placeholder="Nội dung bài viết"
                />
                <RichToolbar editor={() => this.richText} />
            </View>

            <TouchableOpacity onPress={handleCoverChange} style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Chọn ảnh bìa</Text>
            </TouchableOpacity>

            {coverUrl ? (
                <Image source={{ uri: coverUrl }} style={styles.imagePreview} />
            ) : null}

            <Button title="Chỉnh sửa bài viết" onPress={handleSubmit} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    goBack: {
        marginBottom: 20,
    },
    goBackText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    editorContainer: {
        height: 300,
        marginBottom: 20,
    },
    uploadButton: {
        marginBottom: 20,
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
    },
    uploadButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginBottom: 20,
    },
});

export default ForumEdit;
