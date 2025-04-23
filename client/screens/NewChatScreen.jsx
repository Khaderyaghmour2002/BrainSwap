import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import {
  GiftedChat,
  Bubble,
  Send,
  InputToolbar,
} from 'react-native-gifted-chat';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import uuid from 'react-native-uuid';
import { Ionicons } from '@expo/vector-icons';


import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';

export default function NewChatScreen({ route }) {
  const { user } = route.params;
  const currentUser = FirebaseAuth.currentUser;
  const chatId = [currentUser.uid, user.id].sort().join('_');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(FirestoreDB, 'chats', chatId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const msgs = data.messages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt.toDate(),
        }));
        setMessages(msgs);
      } else {
        setMessages([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const onSend = useCallback(async (newMessages = []) => {
    const docRef = doc(FirestoreDB, 'chats', chatId);
    const docSnap = await getDoc(docRef);

    const prevMessages = docSnap.exists()
      ? docSnap.data().messages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt.toDate(),
        }))
      : [];

    // const updatedMessages = GiftedChat.append(prevMessages, newMessages);
    // console.log("Trying to create/update chat with:", {
    //   participants: [currentUser.uid, user.id],
    //   userInfo: [
    //     { id: currentUser.uid, name: currentUser.displayName || 'You' },
    //     { id: user.id, name: user.firstName || 'User' },
    //   ],
    // });
    
    await setDoc(docRef, {
      participants: [currentUser.uid, user.id],
      userInfo: [
        { id: currentUser.uid, name: currentUser.displayName || 'You' },
        { id: user.id, name: user.firstName || 'User' },
      ],
      messages: updatedMessages,
      lastUpdated: Date.now(),
    }, { merge: true });
  }, [chatId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(msgs) => onSend(msgs)}
      user={{
        _id: currentUser.uid,
        name: currentUser.displayName || 'You',
        avatar: 'https://i.pravatar.cc/300',
      }}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
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
        <InputToolbar {...props} containerStyle={styles.inputToolbar} />
      )}
      renderSend={(props) => (
        <Send {...props}>
          <View style={styles.sendButton}>
          <Ionicons name="send" size={20} color={colors.teal} />
          </View>
        </Send>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputToolbar: {
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    marginHorizontal: 8,
    marginBottom: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  sendButton: {
    padding: 8,
    marginRight: 8,
    marginBottom: 6,
  },
});
