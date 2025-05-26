import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  Text,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import * as ImagePicker from 'expo-image-picker';
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar,
} from 'react-native-gifted-chat';
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  getStorage,
} from 'firebase/storage';
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';

import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';

const NewChatScreen = ({ route, navigation }) => {
  const { user } = route.params;
  const currentUser = FirebaseAuth.currentUser;
  const chatId = [currentUser.uid, user.id].sort().join('_');

  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(FirestoreDB, 'chats', chatId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const msgs = data.messages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt),
          user: {
            ...msg.user,
            avatar: msg.user._id === currentUser.uid ? currentUser.photoURL : user.photoUrl,
          },
        }));
        setMessages(msgs);
      }
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Keyboard.dismiss();
      return true;
    });

    return () => {
      unsub();
      backHandler.remove();
    };
  }, [chatId]);

  const onSend = useCallback(async (newMessages = []) => {
    const docRef = doc(FirestoreDB, 'chats', chatId);
    const docSnap = await getDoc(docRef);
    const prevMessages = docSnap.exists() ? docSnap.data().messages || [] : [];

    const updated = GiftedChat.append(prevMessages, newMessages);

    await setDoc(
      docRef,
      {
        messages: updated.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt || new Date(),
        })),
        lastUpdated: Date.now(),
        participants: [currentUser.uid, user.id].sort(),
        userInfo: [
          { id: currentUser.uid, name: currentUser.displayName || 'You', photoUrl: currentUser.photoURL },
          { id: user.id, name: user.firstName || 'User', photoUrl: user.photoUrl },
        ],
      },
      { merge: true }
    );
  }, [chatId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new TypeError('Network request failed'));
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const fileId = uuid.v4();
    const fileRef = ref(getStorage(), fileId);
    const uploadTask = uploadBytesResumable(fileRef, blob);

    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(fileRef);
        setUploading(false);
        onSend([
          {
            _id: fileId,
            createdAt: new Date(),
            text: '',
            image: downloadURL,
            user: {
              _id: currentUser.uid,
              name: currentUser.displayName || 'User',
              avatar: currentUser.photoURL,
            },
          },
        ]);
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri: user.photoUrl }} style={styles.headerAvatar} />
        <Text style={styles.headerTitle}>{user.firstName}</Text>
        <TouchableOpacity
          style={[styles.headerIcon, { marginTop: 10 }]}
          onPress={() => navigation.navigate('VoiceCallScreen', { user })}
        >
          <Ionicons name="call-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerIcon, { marginTop: 0 }]}
          onPress={() => navigation.navigate('VideoCallScreen', { user })}
        >
          <Ionicons name="videocam-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      )}

      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={{
          _id: currentUser.uid,
          name: currentUser.displayName || 'User',
          avatar: currentUser.photoURL,
        }}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        imageStyle={{ height: 212, width: 212 }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: colors.primary },
              left: { backgroundColor: '#eee' },
            }}
          />
        )}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={styles.inputToolbar}
          />
        )}
        renderSend={(props) => (
          <Send {...props}>
            <View style={styles.sendButton}>
              <Ionicons name="send" size={22} color={colors.teal} />
            </View>
          </Send>
        )}
        renderAccessory={() => (
          <View style={styles.toolbarRow}>
            <TouchableOpacity onPress={() => alert('Emoji picker not implemented')} style={styles.emojiIcon}>
              <Ionicons name="happy-outline" size={26} color={colors.teal} />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
              <Ionicons name="attach-outline" size={26} color={colors.teal} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 20,
    gap: 8,
  },
  headerIcon: {
    padding: 8,
  },
  headerAvatar: {
    marginTop: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    marginBottom: 5,
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButton: {
    padding: 8,
    marginLeft: 8,
    marginBottom: 6,
  },
  sendButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 6,
  },
  emojiIcon: {
    padding: 6,
    marginLeft: 8,
    marginBottom: 6,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  inputToolbar: {
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    marginHorizontal: 8,
    marginBottom: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f8f8f8',
  },
});

export default NewChatScreen;