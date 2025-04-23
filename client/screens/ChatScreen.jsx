import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import * as ImagePicker from 'expo-image-picker';
import EmojiModal from 'react-native-emoji-modal';
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
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';

export default function Chat({ route }) {
  const { recipientId, recipientName } = route.params;
  const currentUser = FirebaseAuth.currentUser;
  const chatId = [currentUser.uid, recipientId].sort().join('_');

  const [messages, setMessages] = useState([]);
  const [modal, setModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(FirestoreDB, 'chats', chatId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(
          data.messages.map((msg) => ({
            ...msg,
            createdAt: msg.createdAt.toDate(),
            image: msg.image ?? '',
          }))
        );
      }
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Keyboard.dismiss();
      if (modal) {
        setModal(false);
        return true;
      }
      return false;
    });

    const keyboardListener = Keyboard.addListener('keyboardDidShow', () => {
      if (modal) setModal(false);
    });

    return () => {
      unsubscribe();
      backHandler.remove();
      keyboardListener.remove();
    };
  }, [chatId, modal]);

  const onSend = useCallback(
    async (newMessages = []) => {
      const docRef = doc(FirestoreDB, 'chats', chatId);
      const docSnap = await getDoc(docRef);
      const prevMessages = docSnap.exists()
        ? docSnap.data().messages.map((msg) => ({
            ...msg,
            createdAt: msg.createdAt.toDate(),
          }))
        : [];

      const updatedMessages = GiftedChat.append(prevMessages, newMessages);

      await setDoc(
        docRef,
        {
          messages: updatedMessages,
          lastUpdated: Date.now(),
        },
        { merge: true }
      );
    },
    [chatId]
  );

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
              avatar: 'https://i.pravatar.cc/300',
            },
          },
        ]);
      }
    );
  };

  const toggleEmojiPanel = () => {
    setModal((prev) => {
      Keyboard.dismiss();
      return !prev;
    });
  };

  return (
    <>
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
          avatar: 'https://i.pravatar.cc/300',
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
        renderSend={(props) => (
          <TouchableOpacity {...props} onPress={pickImage} style={styles.attachButton}>
            <Ionicons name="attach-outline" size={26} color={colors.teal} />
          </TouchableOpacity>
        )}
        renderInputToolbar={(props) => (
          <View style={styles.toolbarRow}>
            <TouchableOpacity onPress={toggleEmojiPanel} style={styles.emojiIcon}>
              <Ionicons name="happy-outline" size={26} color={colors.teal} />
            </TouchableOpacity>
            <InputToolbar
              {...props}
              containerStyle={styles.inputToolbar}
            />
            <Send {...props}>
              <View style={styles.sendButton}>
                <Ionicons name="send" size={20} color={colors.teal} />
              </View>
            </Send>
          </View>
        )}
      />

      {modal && (
        <EmojiModal
          onPressOutside={toggleEmojiPanel}
          columns={6}
          emojiSize={32}
          onEmojiSelected={(emoji) =>
            onSend([
              {
                _id: uuid.v4(),
                createdAt: new Date(),
                text: emoji,
                user: {
                  _id: currentUser.uid,
                  name: currentUser.displayName || 'User',
                  avatar: 'https://i.pravatar.cc/300',
                },
              },
            ])
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  uploadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
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
    flex: 1,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    marginHorizontal: 8,
    marginBottom: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f8f8f8',
  },
});
