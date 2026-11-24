import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import { API_URL } from '../../config';

const Cameras = () => {
  const [imageUri, setImageUri] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImage = async (response) => {
    if (response.didCancel || response.error) return;

    setImageUri(response.assets[0].uri);
    await uploadImage(response.assets[0].uri);
  };

  const uploadImage = async (uri) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      setAnalysis(data.result);
    } catch (error) {
      console.error(error);
      setAnalysis('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri && (
        <Image source={{uri: imageUri}} style={styles.image} />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            launchCamera(
              {
                mediaType: 'photo',
                quality: 0.8,
              },
              handleImage,
            )
          }>
          <Text style={styles.buttonText}>Chụp ảnh</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            launchImageLibrary(
              {
                mediaType: 'photo',
                quality: 0.8,
              },
              handleImage,
            )
          }>
          <Text style={styles.buttonText}>Chọn ảnh</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text style={styles.analysisText}>{analysis}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '40%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  analysisText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Cameras;