import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Modal,
  Alert, RefreshControl, KeyboardAvoidingView, ScrollView, Platform, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import uuid from 'react-native-uuid';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy,where,doc,setDoc,getDoc,deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from 'firebase/storage';
import { FirestoreDB, FirebaseAuth } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';
import moment from 'moment';
import { useNavigation } from "@react-navigation/native";

export default function HomeContentScreen() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
const [pendingRequests, setPendingRequests] = useState({ sent: new Set(), received: new Set() });
const [connections, setConnections] = useState(new Set());
const [userData, setUserData] = useState(null);
const [userConnections, setUserConnections] = useState(new Set());
const fetchCurrentUserData = async () => {
  try {
    const currentUser = FirebaseAuth.currentUser;
    if (!currentUser) return;

    const docRef = doc(FirestoreDB, 'users', currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserData(data);
      setUserConnections(new Set(data.connections || []));
    }
  } catch (err) {
    console.error('Error fetching current user data:', err);
  }
};

const fetchPosts = async () => {
  try {
    const currentUser = FirebaseAuth.currentUser;
    if (!currentUser) return;

    const q = query(collection(FirestoreDB, 'posts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const postsData = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const post = { id: docSnap.id, ...docSnap.data() };

        // Fetch comments
        const commentsSnap = await getDocs(collection(FirestoreDB, 'posts', post.id, 'comments'));
        post.comments = commentsSnap.docs.map(c => c.data());

        // Fetch likes
        const likesSnap = await getDocs(collection(FirestoreDB, 'posts', post.id, 'likes'));
        post.likes = likesSnap.docs.map(doc => doc.data());

        return post;
      })
    );

    setPosts(postsData.filter(post => post.userId !== currentUser.uid));
  } catch (err) {
    console.error('Error fetching posts:', err);
  }
};


fetchCurrentUserData 
useEffect(() => {
  fetchPosts();
  fetchCurrentUserData(); 
}, []);

const fetchConnections = async () => {
  try {
    const currentUser = FirebaseAuth.currentUser;
    if (!currentUser) return;

    const snapshot = await getDocs(
      collection(FirestoreDB, `users/${currentUser.uid}/connections`)
    );
    const ids = snapshot.docs.map(doc => doc.id); // Assuming each doc is the connected user's UID
    setConnections(new Set(ids));
  } catch (err) {
    console.error("Error fetching connections:", err);
  }
};

  useEffect(() => {
    fetchPosts();
  }, []);
const fetchRequests = async () => {
  try {
    const currentUser = FirebaseAuth.currentUser;
    if (!currentUser) return;

    const sentSnapshot = await getDocs(
      query(
        collection(FirestoreDB, "requests"),
        where("from", "==", currentUser.uid),
        where("status", "==", "pending")
      )
    );
    const sentTo = new Set(sentSnapshot.docs.map(d => d.data().to));

    const receivedSnapshot = await getDocs(
      query(
        collection(FirestoreDB, "requests"),
        where("to", "==", currentUser.uid),
        where("status", "==", "pending")
      )
    );
    const receivedFrom = new Set(receivedSnapshot.docs.map(d => d.data().from));

    setPendingRequests({ sent: sentTo, received: receivedFrom });
  } catch (err) {
    console.error("Error fetching requests:", err);
  }
};

const sendRequest = async (targetUser) => {
  const currentUser = FirebaseAuth.currentUser;
  if (!currentUser || !targetUser) return;

  if (pendingRequests.received.has(targetUser.id)) {
    Alert.alert("Already Requested", `${targetUser.firstName || targetUser.userName} already sent you a request.`);
    return;
  }

  try {
    const requestRef = doc(FirestoreDB, "requests", `${currentUser.uid}_${targetUser.id}`);
    await setDoc(requestRef, {
      from: currentUser.uid,
      to: targetUser.id,
      status: "pending",
      timestamp: serverTimestamp(),
    });

    setPendingRequests(prev => ({
      ...prev,
      sent: new Set(prev.sent).add(targetUser.id)
    }));

    Alert.alert("Request Sent", `You have sent a request to ${targetUser.firstName || targetUser.userName}.`);
  } catch (err) {
    console.error("Failed to send request:", err);
    Alert.alert("Error", "Could not send request. Try again.");
  }
};

const toggleLike = async (postId, onComplete) => {
  const currentUser = FirebaseAuth.currentUser;
  if (!currentUser) return;

  const likesRef = collection(FirestoreDB, 'posts', postId, 'likes');

  try {
    const existing = await getDocs(query(likesRef, where('userId', '==', currentUser.uid)));

    if (!existing.empty) {
      await deleteDoc(doc(FirestoreDB, 'posts', postId, 'likes', existing.docs[0].id));
    } else {
      await addDoc(likesRef, {
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      });
    }

    if (onComplete) onComplete(); // 👉 refresh after
  } catch (err) {
    console.error('Failed to like/unlike post:', err);
  }
};
const [commentInput, setCommentInput] = useState('');

const addComment = async (postId) => {
  const currentUser = FirebaseAuth.currentUser;
  if (!currentUser || !commentInput.trim()) return;

  try {
    await addDoc(collection(FirestoreDB, 'posts', postId, 'comments'), {
      userId: currentUser.uid,
      userName: userData?.userName || 'User',
      content: commentInput.trim(),
      createdAt: serverTimestamp(),
    });
    setCommentInput('');
    fetchPosts(); // optional refresh
  } catch (err) {
    console.error('Failed to add comment:', err);
  }
};





useEffect(() => {
  fetchPosts();
  fetchRequests();
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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled) {
        setSelectedFile(result.assets[0].uri);
        setFileName(result.assets[0].name);
        setModalVisible(true);
      }
    } catch (err) {
      console.error('Document picker error:', err);
    }
  };

  const uploadPost = async () => {
  if (!selectedImage && !selectedFile) {
    Alert.alert('Error', 'No file or image selected.');
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

    const uri = selectedImage || selectedFile;
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError('Network request failed'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const fileId = uuid.v4();
    const ext = selectedFile ? fileName?.split('.').pop() : 'jpg';
    const fileRef = ref(getStorage(), `posts/${currentUser.uid}/${fileId}.${ext}`);
    const uploadTask = uploadBytesResumable(fileRef, blob);

    uploadTask.on(
      'state_changed',
      null,
      (err) => {
        console.error('Upload failed:', err);
        Alert.alert('Upload Error', 'File upload failed.');
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(fileRef);

        try {
       await addDoc(collection(FirestoreDB, 'posts'), {
  userId: currentUser.uid,
  userName: currentUser.displayName || 'User',
  photoUrl: currentUser.photoURL || '',
  imageUrl: selectedImage ? downloadURL : '',
  fileUrl: selectedFile ? downloadURL : '',
  fileName: selectedFile ? fileName : '',
  caption: caption || '',
  createdAt: serverTimestamp(),
  likes: 0,  // 👈 ADD THIS
});


          Alert.alert('Success', 'Post uploaded successfully.');
        } catch (error) {
          console.error('Error adding document to Firestore:', error);
          Alert.alert('Error', 'Could not create Firestore post.');
        }

        setUploading(false);
        setModalVisible(false);
        setSelectedImage(null);
        setSelectedFile(null);
        setFileName('');
        setCaption('');
        await fetchPosts();
      }
    );
  } catch (err) {
    console.error('Error uploading post:', err);
    Alert.alert('Error', 'Upload failed. Please try again.');
    setUploading(false);
  }
};


const PostCard = ({
  item,
  pendingRequests,
  userConnections,
  sendRequest,
  navigation,
  userData,
  toggleLike,
  commentInput,
  setCommentInput,
  addComment,
}) => {
  const currentUser = FirebaseAuth.currentUser;
  const isSelf = currentUser?.uid === item.userId;
  const isSentPending = pendingRequests.sent.has(item.userId);
  const isReceivedPending = pendingRequests.received.has(item.userId);
  const isConnected = userConnections.has(item.userId);

  const [userPhotoUrl, setUserPhotoUrl] = useState(item.photoUrl || null);

  useEffect(() => {
    const fetchFallbackPhoto = async () => {
      if (!item.photoUrl) {
        try {
          const userDoc = await getDoc(doc(FirestoreDB, "users", item.userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data?.photoUrl) {
              setUserPhotoUrl(data.photoUrl);
            }
          }
        } catch (err) {
          console.error("Failed to fetch user photo for post:", err);
        }
      }
    };
    fetchFallbackPhoto();
  }, [item.userId]);

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ProfileViewScreen", { userId: item.userId })}
          >
            <Image
              source={{ uri: userPhotoUrl || "https://via.placeholder.com/150" }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            {item.createdAt && (
              <Text style={styles.timestamp}>
                {moment(item.createdAt.toDate()).fromNow()}
              </Text>
            )}
          </View>
        </View>

        {!isSelf && !isConnected && (
          isSentPending ? (
            <View style={styles.pendingButtonSmall}>
              <Text style={styles.buttonTextSmall}>⏳</Text>
            </View>
          ) : isReceivedPending ? (
            <View style={styles.pendingButtonSmall}>
              <Text style={styles.buttonTextSmall}>💬</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.connectIconButton}
              onPress={() =>
                sendRequest({ id: item.userId, firstName: item.userName })
              }
            >
              <Text style={styles.buttonTextSmall}>🤝</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {item.caption ? <Text style={styles.caption}>{item.caption}</Text> : null}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      )}
      {item.fileUrl && (
        <View style={styles.fileContainer}>
          <Ionicons name="document-text-outline" size={24} color={colors.primary} />
          <Text style={styles.fileName}>{item.fileName}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(item.fileUrl)}>
            <Text style={styles.openFile}>Open</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ❤️ Like Button */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={() => toggleLike(item.id, item.likes || [])}>
          <Text style={styles.likeText}>❤️ {item.likes?.length || 0}</Text>
        </TouchableOpacity>
      </View>

      {/* 💬 Comment Section */}
      <View style={styles.commentSection}>
        {(item.comments || []).slice(0, 2).map((c, index) => (
          <Text key={index} style={styles.comment}>
            <Text style={{ fontWeight: 'bold' }}>{c.userName}: </Text>
            {c.content}
          </Text>
        ))}

        <TextInput
          value={commentInput}
          onChangeText={setCommentInput}
          placeholder="Add a comment..."
          placeholderTextColor="#999"
          style={styles.commentInput}
          onSubmitEditing={() => addComment(item.id)}
        />
      </View>
    </View>
  );
};










  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Brain Swap</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickDocument}>
            <Ionicons name="attach-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && <ActivityIndicator size="large" color={colors.teal} style={{ marginTop: 10 }} />}

    <FlatList
  data={posts}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <PostCard
      item={item}
      pendingRequests={pendingRequests}
      userConnections={userConnections}
      sendRequest={sendRequest}
      navigation={navigation}
      userData={userData}
      toggleLike={toggleLike}
      commentInput={commentInput}
      setCommentInput={setCommentInput}
      addComment={addComment}
    />
  )}
  contentContainerStyle={{ paddingBottom: 100 }}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
/>



      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
                          setSelectedFile(null);
                          setFileName('');
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

              {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullImage} />}
              {fileName ? (
                <View style={styles.filePreview}>
                  <Ionicons name="document-outline" size={20} color="#fff" />
                  <Text style={{ color: '#fff', marginLeft: 6 }}>{fileName}</Text>
                </View>
              ) : null}

              <View style={styles.captionContainer}>
                <TextInput
                  placeholder="Write a caption..."
                  value={caption}
                  onChangeText={setCaption}
                  style={styles.captionInputFull}
                  placeholderTextColor="#aaa"
                  multiline
                />
                <TouchableOpacity style={styles.uploadButtonFull} onPress={uploadPost} disabled={uploading}>
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
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f4f4f4',
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
    color: '#333',
  },
  openFile: {
    color: colors.teal,
    fontWeight: '600',
  },
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
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 10,
  },
  actionsRow: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  padding: 10,
  gap: 10,
},
requestButton: {
  backgroundColor: colors.primary,
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
},
pendingButton: {
  backgroundColor: '#ccc',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 6,
},
buttonText: {
  color: '#fff',
  fontWeight: '600',
},
connectIconButton: {
  marginRight: 8,
  backgroundColor: colors.primary,
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},
pendingButtonSmall: {
  marginRight: 8,
  backgroundColor: '#ccc',
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},
buttonTextSmall: {
  fontSize: 16,
  color: '#fff',
},
postHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 10,
},
headerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
},
connectIconButton: {
  backgroundColor: colors.primary,
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},
pendingButtonSmall: {
  backgroundColor: '#ccc',
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
},
buttonTextSmall: {
  fontSize: 16,
  color: '#fff',
},
connectButton: {
  backgroundColor: colors.primary,
  margin: 10,
  paddingVertical: 8,
  borderRadius: 8,
  alignItems: 'center',
},
connectText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 15,
},
actionsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
},
likeText: {
  fontSize: 16,
  color: 'red',
  marginRight: 10,
},
commentSection: {
  paddingHorizontal: 12,
  paddingBottom: 12,
},
comment: {
  fontSize: 14,
  marginTop: 4,
},
commentInput: {
  borderColor: '#ccc',
  borderWidth: 1,
  padding: 6,
  borderRadius: 6,
  marginTop: 8,
},

});
