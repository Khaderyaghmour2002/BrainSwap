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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  addDoc,
  collection,
} from 'firebase/firestore';

import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';

const NewChatScreen = ({ route, navigation }) => {
  const { user, currentUserData } = route.params;
  const currentUser = FirebaseAuth.currentUser;
  const chatId = [currentUser.uid, user.id].sort().join('_');

  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [selectedTeachSkill, setSelectedTeachSkill] = useState('');
  const [selectedLearnSkill, setSelectedLearnSkill] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // Compute valid skills
  const myTeachSkills = (currentUserData?.skillsToTeach || []).map(s => s.name).filter(skill => user.skillsToLearn?.includes(skill));
  const myLearnSkills = (currentUserData?.skillsToLearn || []).filter(skill => user.skillsToTeach?.some(s => s.name === skill));

  const createSession = async () => {
    if (!selectedTeachSkill || !selectedLearnSkill) {
      Alert.alert('Error', 'Please select both a teaching and learning skill.');
      return;
    }

    try {
      await addDoc(collection(FirestoreDB, 'sessions'), {
        from: currentUser.uid,
        to: user.id,
        teaching: selectedTeachSkill,
        learning: selectedLearnSkill,
        date: sessionDate.toISOString(),
        createdAt: serverTimestamp(),
      });
      Alert.alert('✅ Session set successfully!');
      setSessionModalVisible(false);
      setSelectedTeachSkill('');
      setSelectedLearnSkill('');
    } catch (err) {
      console.error('Error creating session:', err);
      Alert.alert('Error', 'Failed to create session');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f7' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image source={{ uri: user.photoUrl }} style={styles.headerAvatar} />
        <Text style={styles.headerTitle}>{user.firstName}</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setSessionModalVisible(true)}>
          <Ionicons name="calendar-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('VoiceCallScreen', { user })}>
          <Ionicons name="call-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('VideoCallScreen', { user })}>
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
          <Bubble {...props} wrapperStyle={{
            right: { backgroundColor: colors.primary },
            left: { backgroundColor: '#e5e5ea' },
          }} />
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
      />

      <Modal visible={sessionModalVisible} animationType="slide" onRequestClose={() => setSessionModalVisible(false)}>
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Set Session</Text>

          <Text style={{ marginTop: 10 }}>📝 Select a skill you want to teach:</Text>
          {myTeachSkills.map(skill => (
            <TouchableOpacity key={skill} onPress={() => setSelectedTeachSkill(skill)} style={{ padding: 8, backgroundColor: selectedTeachSkill === skill ? colors.teal : '#eee', borderRadius: 6, marginTop: 4 }}>
              <Text>{skill}</Text>
            </TouchableOpacity>
          ))}

          <Text style={{ marginTop: 10 }}>🎯 Select a skill you want to learn:</Text>
          {myLearnSkills.map(skill => (
            <TouchableOpacity key={skill} onPress={() => setSelectedLearnSkill(skill)} style={{ padding: 8, backgroundColor: selectedLearnSkill === skill ? colors.teal : '#eee', borderRadius: 6, marginTop: 4 }}>
              <Text>{skill}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginTop: 10 }}>
            <Text style={{ color: colors.teal }}>Pick date & time: {sessionDate.toLocaleString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={sessionDate}
              mode="datetime"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSessionDate(date);
              }}
            />
          )}

          <TouchableOpacity style={{ backgroundColor: colors.primary, padding: 10, borderRadius: 6, marginTop: 20 }} onPress={createSession}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Confirm Session</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setSessionModalVisible(false)}>
            <Text style={{ textAlign: 'center', color: 'red' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    paddingTop: 20,
  },
  headerIcon: { padding: 8, paddingTop: 25 },
  headerAvatar: { width: 40, height: 40, borderRadius: 24, backgroundColor: '#ccc' },
  headerTitle: { flex: 1, fontSize: 22, color: '#fff', fontWeight: '600', marginLeft: 8, paddingTop: 20 },
  uploadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999,
    justifyContent: 'center', alignItems: 'center',
  },
  inputToolbar: {
    borderRadius: 30, borderColor: '#ddd', borderWidth: 1,
    marginHorizontal: 8, marginBottom: 35, paddingHorizontal: 4,
    backgroundColor: '#fff', elevation: 2, alignItems: 'center',
  },
  sendButton: {
    backgroundColor: colors.teal,
    borderRadius: 20,
    padding: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  actionsContainer: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { padding: 6 },
});

export default NewChatScreen;
