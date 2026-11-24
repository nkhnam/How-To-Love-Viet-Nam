import React, { useState, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Image, 
    StyleSheet, 
    Alert, 
    ScrollView, 
    ActivityIndicator,
    ImageBackground,
    Platform,
    Dimensions
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { auth, db, storage } from '../Data/Firebase';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const ERROR_MESSAGES = {
    'auth/email-already-in-use': 'Email đã được sử dụng.',
    'auth/invalid-email': 'Email không hợp lệ.',
    'auth/operation-not-allowed': 'Tài khoản bị vô hiệu hóa.',
    'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
    default: 'Đã xảy ra lỗi. Vui lòng thử lại.',
};

const windowHeight = Dimensions.get('window').height;

function SignUp() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fname: '',
        profilePic: null,
        photoURL: 'https://i.postimg.cc/zXkPfDnB/logo192.png',
        error: '',
        loading: false
    });

    const navigation = useNavigation();

    const updateFormData = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
            error: ''
        }));
    }, []);

    const handleImageChange = useCallback(async () => {
        try {
            const result = await launchImageLibrary({ 
                mediaType: 'photo',
                quality: 0.7,
                maxWidth: 800,
                maxHeight: 800
            });

            if (!result.didCancel && result.assets) {
                const file = result.assets[0];
                setFormData(prev => ({
                    ...prev,
                    profilePic: file,
                    photoURL: file.uri,
                    error: ''
                }));
            }
        } catch (err) {
            console.error('Error selecting image:', err);
            Alert.alert('Lỗi', 'Không thể chọn ảnh đại diện. Vui lòng thử lại.');
        }
    }, []);

    const validateForm = useCallback(() => {
        if (!formData.fname.trim()) {
            setFormData(prev => ({ ...prev, error: 'Vui lòng nhập tên tài khoản' }));
            return false;
        }
        if (!formData.email.trim()) {
            setFormData(prev => ({ ...prev, error: 'Vui lòng nhập email' }));
            return false;
        }
        if (!formData.password) {
            setFormData(prev => ({ ...prev, error: 'Vui lòng nhập mật khẩu' }));
            return false;
        }
        if (formData.password.length < 6) {
            setFormData(prev => ({ ...prev, error: 'Mật khẩu phải có ít nhất 6 ký tự' }));
            return false;
        }
        return true;
    }, [formData.fname, formData.email, formData.password]);

    const handleRegister = useCallback(async () => {
        if (!validateForm()) return;

        setFormData(prev => ({ ...prev, loading: true, error: '' }));

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                formData.email.trim(), 
                formData.password
            );
            const user = userCredential.user;

            let photoURL = '';
            if (formData.profilePic) {
                const storageRef = ref(storage, `profilePics/${user.uid}`);
                const response = await fetch(formData.profilePic.uri);
                const bytes = await response.blob();
                await uploadBytes(storageRef, bytes);
                photoURL = await getDownloadURL(storageRef);
            }

            await setDoc(doc(db, 'users', user.uid), {
                email: formData.email.trim(),
                firstName: formData.fname.trim(),
                photo: photoURL,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            });

            Alert.alert('Thành công', 'Tạo tài khoản thành công!', [
                { text: 'OK', onPress: () => navigation.replace('Home') }
            ]);
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default;
            setFormData(prev => ({ ...prev, error: errorMessage }));
        } finally {
            setFormData(prev => ({ ...prev, loading: false }));
        }
    }, [formData, navigation, validateForm]);

    const isButtonDisabled = useMemo(() => {
        return !formData.email.trim() || !formData.password || !formData.fname.trim() || formData.loading;
    }, [formData.email, formData.password, formData.fname, formData.loading]);

    return (
        <ScrollView 
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <ImageBackground
                source={require('../../assets/bg-login.jpg')}
                resizeMode="cover"
                style={styles.imageBg}
            >
                <View style={styles.overlay}>
                    <View style={styles.goHome}>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Home')}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.goHomeText}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.title}>Tạo Tài Khoản Mới</Text>

                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: formData.photoURL }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity 
                                style={styles.changePhotoButton} 
                                onPress={handleImageChange}
                            >
                                <Text style={styles.changePhotoText}>Chọn ảnh đại diện</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Tên tài khoản"
                                placeholderTextColor="#666"
                                onChangeText={(text) => updateFormData('fname', text)}
                                value={formData.fname}
                                autoCorrect={false}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#666"
                                keyboardType="email-address"
                                onChangeText={(text) => updateFormData('email', text)}
                                value={formData.email}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Mật khẩu"
                                placeholderTextColor="#666"
                                secureTextEntry
                                onChangeText={(text) => updateFormData('password', text)}
                                value={formData.password}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.button, isButtonDisabled && styles.buttonDisabled]} 
                            onPress={handleRegister}
                            disabled={isButtonDisabled}
                        >
                            {formData.loading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.buttonText}>TẠO TÀI KHOẢN</Text>
                            )}
                        </TouchableOpacity>

                        {formData.error ? (
                            <Text style={styles.errorText}>{formData.error}</Text>
                        ) : null}

                        <TouchableOpacity 
                            style={styles.loginLink}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginText}>
                                Đã có tài khoản? 
                                <Text style={styles.loginTextBold}> Đăng nhập</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flexGrow: 1,
    },
    imageBg: {
        minHeight: windowHeight,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    formContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
    },
    title: { 
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#FFF',
        textAlign: 'center',
        ...Platform.select({
            ios: {
                marginTop: 50
            },
            android: {
                marginTop: 30
            }
        })
    },
    avatarContainer: { 
        alignItems: 'center',
        marginBottom: 30
    },
    goHome: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        right: 20,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    goHomeText: {
        color: 'white',
        fontSize: 30,
        lineHeight: 35,
    },
    avatar: { 
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#FFF',
        marginBottom: 15
    },
    changePhotoButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    changePhotoText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 25,
        paddingHorizontal: 20,
        marginBottom: 15,
        fontSize: 16,
        color: '#333',
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#B0BEC5',
        elevation: 0,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FF5252',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        marginTop: 10,
        fontSize: 14,
        textAlign: 'center',
    },
    loginLink: {
        marginTop: 20,
        padding: 10,
    },
    loginText: {
        color: '#FFF',
        fontSize: 15,
    },
    loginTextBold: {
        fontWeight: 'bold',
    }
});

export default SignUp;