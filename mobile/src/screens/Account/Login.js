import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import { auth } from '../Data/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const ERROR_MESSAGES = {
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/wrong-password': 'Sai mật khẩu.',
  'auth/user-not-found': 'Tài khoản không tồn tại.',
  'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
  default: 'Đăng nhập thất bại. Vui lòng thử lại.',
};

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log('User logged in successfully');
      navigation.replace('Home');
    } catch (error) {
      console.error('Login error:', error.code);
      const errorMessage = ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default;
      setError(errorMessage);
      setLoading(false);
    }
  }, [email, password, navigation]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/bg-login.jpg')}
        resizeMode="cover"
        style={styles.imageBg}
      >
        <View style={styles.shadow}>
          <View style={styles.goHome}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.goHomeText}>X</Text>
            </TouchableOpacity>
          </View>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>How to love VietNam</Text>

          <View style={styles.white}>
            <Text style={styles.welcome}>Chào Mừng</Text>
            <View style={styles.rowContainer}>
              <Text style={styles.ask}>Bạn đã có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.register}>Đăng Ký</Text>
              </TouchableOpacity>
            </View>

            <View style={{ top: 40, left: 30, width: '85%' }}>
              <Text>Địa chỉ email</Text>
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Text>Mật khẩu</Text>
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity 
                style={[
                  styles.button,
                  (!email.trim() || !password.trim() || loading) && { opacity: 0.7 }
                ]} 
                onPress={handleLogin}
                disabled={!email.trim() || !password.trim() || loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
                </Text>
              </TouchableOpacity>

              {loading && <ActivityIndicator size="large" color="#007BFF" />}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBg: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  shadow: {
    height: '100%',
    width: '100%',
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(58, 64, 174, 0.5)',
    alignItems: 'center',
  },
  logo: {
    height: '40%',
    width: '40%',
  },
  goHome: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 45,
    height: 45,
    backgroundColor: '#A5A5A5',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goHomeText: {
    color: 'white',
    fontSize: 30,
  },
  title: {
    bottom: 120,
    color: 'white',
    fontSize: 22,
    lineHeight: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  white: {
    width: '100%',
    height: '70%',
    bottom: 20,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  welcome: {
    fontSize: 30,
    color: '#1165A1',
    top: 20,
    left: 30,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ask: {
    fontSize: 15,
    color: 'gray',
    marginRight: 35,
    top: 20,
    left: 30,
  },
  register: {
    top: 20,
    fontSize: 15,
    color: 'red',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    width: '100%',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Login;