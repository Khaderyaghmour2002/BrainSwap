import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Modal, Alert, RefreshControl, KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import uuid from 'react-native-uuid';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from 'firebase/storage';
import { FirestoreDB, FirebaseAuth } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';
import moment from 'moment';

export default function HomeContentScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchPosts = async () => {
    try {
      const q = query(collection(FirestoreDB, 'posts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setModalVisible(true);
      }
    } catch (err) {
      console.error('Image picker error:', err);
    }
  };

  const uploadPost = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'No image selected.');
      return;
    }

    try {
      setUploading(true);
      const currentUser = FirebaseAuth.currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to upload.');
        setUploading(false);
        return;
      }

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new TypeError('Network request failed'));
        xhr.responseType = 'blob';
        xhr.open('GET', selectedImage, true);
        xhr.send(null);
      });

      const fileId = uuid.v4();
      const fileRef = ref(getStorage(), `posts/${currentUser.uid}/${fileId}.jpg`);
      const uploadTask = uploadBytesResumable(fileRef, blob);

      uploadTask.on(
        'state_changed',
        null,
        (err) => {
          console.error('Upload failed:', err);
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(fileRef);
          await addDoc(collection(FirestoreDB, 'posts'), {
            userId: currentUser.uid,
            userName: currentUser.displayName || 'User',
            photoUrl: currentUser.photoURL,
            imageUrl: downloadURL,
            caption: caption || '',
            createdAt: serverTimestamp(),
          });
          setUploading(false);
          setModalVisible(false);
          setSelectedImage(null);
          setCaption('');
          await fetchPosts();
        }
      );
    } catch (err) {
      console.error('Error uploading post:', err);
      setUploading(false);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
  <View style={styles.postHeader}>
    <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
    <View>
      <Text style={styles.userName}>{item.userName}</Text>
      {item.createdAt && (
        <Text style={styles.timestamp}>
          {moment(item.createdAt.toDate()).fromNow()}
        </Text>
      )}
    </View>
  </View>

  {/* Caption above image */}
  <Text style={styles.caption}>{item.caption}</Text>

  <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
</View>

  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SkillGram</Text>
        <TouchableOpacity onPress={pickImage}>
          <Ionicons name="add-circle-outline" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color={colors.teal} style={{ marginTop: 10 }} />}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>No posts yet. Be the first to share!</Text>}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.fullModal}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert("Discard post?", "Are you sure you want to cancel?", [
                      { text: "No" },
                      {
                        text: "Yes",
                        onPress: () => {
                          setModalVisible(false);
                          setSelectedImage(null);
                          setCaption('');
                        }
                      }
                    ])
                  }}
                >
                  <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Create Post</Text>
                <View style={{ width: 28 }} /> 
              </View>

              {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.fullImage} />
              )}

              <View style={styles.captionContainer}>
                <TextInput
                  placeholder="Write a caption..."
                  value={caption}
                  onChangeText={setCaption}
                  style={styles.captionInputFull}
                  placeholderTextColor="#aaa"
                  multiline
                />
                <TouchableOpacity
                  style={styles.uploadButtonFull}
                  onPress={uploadPost}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Post</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  postContainer: {
    marginVertical: 10,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 10,
    elevation: 2,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc' },
  userName: { marginLeft: 8, fontWeight: '600', fontSize: 16 },
  timestamp: { marginLeft: 8, fontSize: 12, color: '#777' },
  postImage: { width: '100%', height: 300 },
  caption: { padding: 10, fontSize: 14, color: '#333' },
  fullModal: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 10,
  },
  captionContainer: {
    flex: 1,
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  captionInputFull: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    textAlignVertical: 'top',
  },
  uploadButtonFull: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
});
