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
  getDoc,
  query,
  collection,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { getHmsAuthToken } from '../../server/hmsToken';
import IncomingCallModal from './IncomingCallModal';

import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';


const NewChatScreen = ({ route, navigation }) => {
const [incomingCall, setIncomingCall] = useState(null); // { roomId, type, caller }

  const { user } = route.params;
  const currentUser = FirebaseAuth.currentUser;
  const chatId = [currentUser.uid, user.id].sort().join('_');

  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fullCurrentUserData, setFullCurrentUserData] = useState(null);
  const [fullOtherUserData, setFullOtherUserData] = useState(null);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const currentUserSnap = await getDoc(doc(FirestoreDB, 'users', currentUser.uid));
        const otherUserSnap = await getDoc(doc(FirestoreDB, 'users', user.id));

        if (currentUserSnap.exists() && otherUserSnap.exists()) {
          setFullCurrentUserData(currentUserSnap.data());
          setFullOtherUserData(otherUserSnap.data());
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUsersData();
  }, []);
  
  useEffect(() => {
    const unsub = onSnapshot(doc(FirestoreDB, 'chats', chatId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const msgs = data.messages
          .map((msg) => ({
            ...msg,
            createdAt: msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt),
            user: {
              ...msg.user,
              avatar: msg.user._id === currentUser.uid ? currentUser.photoURL : user.photoUrl,
            },
          }))
.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // ✅ Newest first
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
  const createCallDoc = useCallback(
    ({ roomId, type }) => setDoc(doc(FirestoreDB, 'calls', roomId), {
      roomId:"6879e51da48ca61c4647608d",
      type,                  // 'voice' | 'video'
      callerId: currentUser.uid,
      receiverId: user.id,
      status: 'ringing',
      createdAt: serverTimestamp(),
    }),
    [currentUser, user.id],
  );

  /* ---------- התחלת שיחה ---------- */
  const startCall = useCallback(
    async (type) => {
      if (!currentUser) { alert('User not authenticated yet'); return; }

      const roomId = uuid.v4();
      await createCallDoc({ roomId, type });

      // אם תרצה token מהפונקציה: const token = await getHmsAuthToken({ roomId, role: 'host' });
      navigation.navigate(
        type === 'video' ? 'VideoCallScreen' : 'VoiceCallScreen',
        { roomId, isCaller: true },
      );
    },
    [currentUser, createCallDoc, navigation],
  );

  /* ---------- listener לשיחות נכנסות ---------- */
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(FirestoreDB, 'calls'),
      where('receiverId', '==', currentUser.uid),
      where('status', '==', 'ringing'),
    );
    const unsub = onSnapshot(q, async (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const call = change.doc.data();
          // TODO: show modal here
          await setDoc(change.doc.ref, { status: 'accepted' }, { merge: true });
          navigation.navigate(
            call.type === 'video' ? 'VideoCallScreen' : 'VoiceCallScreen',
            { roomId: call.roomId, isCaller: false },
          );
        }
      });
    });
    return unsub;
  }, [currentUser, navigation]);
useEffect(() => {
  if (!currentUser) return;

  const q = query(
    collection(FirestoreDB, 'calls'),
    where('receiverId', '==', currentUser.uid),
    where('status', '==', 'ringing'),
  );

  const unsub = onSnapshot(q, async (snap) => {
    for (const change of snap.docChanges()) {
      if (change.type === 'added') {
        const call = change.doc.data();
        const callerSnap = await getDoc(doc(FirestoreDB, 'users', call.callerId));
        const caller = callerSnap.exists() ? callerSnap.data() : { name: 'Unknown', photoUrl: '' };

        setIncomingCall({
          docRef: change.doc.ref,
          roomId: call.roomId,
          type: call.type,
          caller,
        });
      }
    }
  });

  return unsub;
}, [currentUser]);

  const onSend = useCallback(async (newMessages = []) => {
    const docRef = doc(FirestoreDB, 'chats', chatId);
    const docSnap = await getDoc(docRef);
    const prevMessages = docSnap.exists() ? docSnap.data().messages || [] : [];
    const updated = GiftedChat.append(prevMessages, newMessages);

    // Remove duplicates
    const uniqueMessages = updated.reduce((acc, msg) => {
      if (!acc.find(m => m._id === msg._id)) {
        acc.push(msg);
      }
      return acc;
    }, []);

    // Sort by createdAt
    uniqueMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    await setDoc(
      docRef,
      {
        messages: uniqueMessages.map((msg) => ({
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
const acceptCall = async () => {
  await setDoc(incomingCall.docRef, { status: 'accepted' }, { merge: true });
  navigation.navigate(
    incomingCall.type === 'video' ? 'VideoCallScreen' : 'VoiceCallScreen',
    { roomId: incomingCall.roomId, isCaller: false }
  );
  setIncomingCall(null);
};

const declineCall = async () => {
  await setDoc(incomingCall.docRef, { status: 'declined' }, { merge: true });
  setIncomingCall(null);
};

  const handleSessionResponse = async (sessionId, isConfirmed) => {
    try {
      await setDoc(doc(FirestoreDB, 'sessions', sessionId), { confirmed: isConfirmed }, { merge: true });

      const chatRef = doc(FirestoreDB, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      const prevMessages = chatSnap.exists() ? chatSnap.data().messages || [] : [];

      const updatedMessages = prevMessages.map(msg => {
        if (msg._id === sessionId) {
          return {
            ...msg,
            pendingConfirmation: false,
            confirmationResult: isConfirmed ? '✅ Confirmed by recipient' : '❌ Cancelled by recipient'
          };
        }
        return msg;
      });

      await setDoc(chatRef, {
        messages: updatedMessages,
        lastUpdated: Date.now()
      }, { merge: true });

      alert(isConfirmed ? 'Session confirmed!' : 'Session cancelled!');
    } catch (err) {
      console.error('Error updating session:', err);
      alert('Error updating session');
    }
  };
  

  return (
    
    <View style={{ flex: 1, backgroundColor: '#f2f2f7' }}>
  <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
    <Ionicons name="arrow-back" size={24} color="#fff" />
  </TouchableOpacity>

<TouchableOpacity onPress={() => navigation.navigate('ProfileViewScreen1', { userId: user.id })}>
  <Image source={{ uri: user.photoUrl }} style={styles.headerAvatar} />
</TouchableOpacity>

  <Text style={styles.headerTitle} numberOfLines={1}>
    {user.firstName}
  </Text>

  <TouchableOpacity
    style={styles.headerIcon}
    onPress={() => {
      if (fullCurrentUserData && fullOtherUserData) {
        navigation.navigate('SessionCreationScreen', {
          user,
          myTeachSkills: (fullCurrentUserData.skillsToTeach || []).map(s => s.name).filter(skill =>
            (fullOtherUserData.skillsToLearn || []).includes(skill)
          ),
          myLearnSkills: (fullCurrentUserData.skillsToLearn || []).filter(skill =>
            (fullOtherUserData.skillsToTeach || []).some(s => s.name === skill)
          ),
        });
      } else {
        alert('User data not loaded yet');
      }
    }}
  >
    <Ionicons name="calendar-outline" size={24} color="#fff" />
  </TouchableOpacity>

  <TouchableOpacity
  style={styles.headerIcon}
  onPress={() => startCall('voice')}
>
  <Ionicons name="call-outline" size={24} color="#fff" />
</TouchableOpacity>

<TouchableOpacity
  style={styles.headerIcon}
  onPress={() => startCall('video')}
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
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: colors.primary },
              left: { backgroundColor: '#e5e5ea' },
            }}
          />
        )}
        renderInputToolbar={(props) => (
          <InputToolbar {...props} containerStyle={styles.inputToolbar} />
        )}
        renderSend={(props) => (
          <Send {...props}>
            <View style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#fff" />
            </View>
          </Send>
        )}
        renderActions={() => (
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => alert('Emoji picker not implemented')} style={styles.actionIcon}>
              <Ionicons name="happy-outline" size={24} color={colors.teal} />
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.actionIcon}>
              <Ionicons name="attach-outline" size={24} color={colors.teal} />
            </TouchableOpacity>
          </View>
        )}
renderCustomView={({ currentMessage }) => {
  if (currentMessage.pendingConfirmation && currentMessage.user._id !== currentUser.uid) {
    return (
      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleSessionResponse(currentMessage.sessionId, true)}
            style={{ backgroundColor: 'green', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSessionResponse(currentMessage.sessionId, false)}
            style={{ backgroundColor: 'red', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (currentMessage.confirmationResult) {
    return (
      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <Text
          style={{
            color: currentMessage.confirmationResult.includes('Confirmed') ? 'green' : 'red',
            fontWeight: '600'
          }}
        >
          {currentMessage.confirmationResult}
        </Text>
        {incomingCall && (
  <IncomingCallModal
    visible={!!incomingCall}
    caller={incomingCall.caller}
    type={incomingCall.type}
    onAccept={acceptCall}
    onDecline={declineCall}
  />
)}

      </View>
    );
  }

  return null;
}}



      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 40,
  },
  headerIcon: {
    paddingHorizontal: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputToolbar: {
    borderRadius: 30,
    borderColor: '#ddd',
    borderWidth: 1,
    marginHorizontal: 8,
    marginBottom: 35,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    elevation: 2,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: colors.teal,
    borderRadius: 20,
    padding: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 6,
  },
});


export default NewChatScreen;
