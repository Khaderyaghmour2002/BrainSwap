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
  const [selectedDuration, setSelectedDuration] = useState('30 min');

  const { user } = route.params;
  const currentUser = FirebaseAuth.currentUser;
  const chatId = [currentUser.uid, user.id].sort().join('_');

  const [messages, setMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [selectedTeachSkill, setSelectedTeachSkill] = useState('');
  const [selectedLearnSkill, setSelectedLearnSkill] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fullCurrentUserData, setFullCurrentUserData] = useState(null);
  const [fullOtherUserData, setFullOtherUserData] = useState(null);

  // Fetch full user data
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        console.log('Fetching user data...');
        const currentUserSnap = await getDoc(doc(FirestoreDB, 'users', currentUser.uid));
        const otherUserSnap = await getDoc(doc(FirestoreDB, 'users', user.id));

        if (currentUserSnap.exists() && otherUserSnap.exists()) {
          setFullCurrentUserData(currentUserSnap.data());
          setFullOtherUserData(otherUserSnap.data());

          console.log('✅ CurrentUserData:', currentUserSnap.data());
          console.log('✅ OtherUserData:', otherUserSnap.data());
        } else {
          Alert.alert("Error", "Could not fetch user data");
        }
      } catch (err) {
        console.error("❌ Error fetching user data:", err);
        Alert.alert("Error", "Failed to load user data");
      }
    };

    fetchUsersData();
  }, []);

  // Listen to chat messages
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

  // Compute valid skills (when data is loaded)
  let myTeachSkills = [];
  let myLearnSkills = [];

  if (fullCurrentUserData && fullOtherUserData) {
    myTeachSkills = (fullCurrentUserData.skillsToTeach || [])
      .map(s => s.name)
      .filter(skill => (fullOtherUserData.skillsToLearn || []).includes(skill));

    myLearnSkills = (fullCurrentUserData.skillsToLearn || [])
      .filter(skill => (fullOtherUserData.skillsToTeach || []).some(s => s.name === skill));

    console.log('✅ Computed myTeachSkills:', myTeachSkills);
    console.log('✅ Computed myLearnSkills:', myLearnSkills);
  }

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
      console.error('❌ Error creating session:', err);
      Alert.alert('Error', 'Failed to create session');
    }
  };

  if (!fullCurrentUserData || !fullOtherUserData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text>Loading user data...</Text>
      </View>
    );
  }

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
      />
<Modal visible={sessionModalVisible} animationType="slide" onRequestClose={() => setSessionModalVisible(false)}>
  <View style={{ flex: 1, padding: 16, backgroundColor: '#f0f8ff' }}>
    <Text
      style={{
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 16,
        paddingTop: 30,
      }}
    >
      🌟 Plan Your Skill Swap Session
    </Text>

    <Text style={{ fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 6 }}>📝 I want to teach:</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {myTeachSkills.map((skill) => (
        <TouchableOpacity
          key={skill}
          onPress={() => setSelectedTeachSkill(skill)}
          style={{
            backgroundColor: selectedTeachSkill === skill ? colors.teal : '#e0f7fa',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 50,
            marginBottom: 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="book-outline" size={16} color={selectedTeachSkill === skill ? '#fff' : colors.primary} />
          <Text style={{ color: selectedTeachSkill === skill ? '#fff' : colors.primary, marginLeft: 4 }}>{skill}</Text>
        </TouchableOpacity>
      ))}
    </View>

    <Text style={{ fontSize: 16, fontWeight: '600', color: '#444', marginTop: 16, marginBottom: 6 }}>
      🎯 I want to learn:
    </Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {myLearnSkills.map((skill) => (
        <TouchableOpacity
          key={skill}
          onPress={() => setSelectedLearnSkill(skill)}
          style={{
            backgroundColor: selectedLearnSkill === skill ? colors.teal : '#e8f5e9',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 50,
            marginBottom: 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="bulb-outline" size={16} color={selectedLearnSkill === skill ? '#fff' : colors.primary} />
          <Text style={{ color: selectedLearnSkill === skill ? '#fff' : colors.primary, marginLeft: 4 }}>{skill}</Text>
        </TouchableOpacity>
      ))}
    </View>

    <View
      style={{
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        marginTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <Text style={{ fontWeight: '600', fontSize: 16, color: '#444', marginBottom: 6 }}>
        📅 Session Date & Time
      </Text>

      {!showDatePicker ? (
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View>
            <Text style={{ fontSize: 13, color: '#555' }}>Selected:</Text>
            <Text style={{ fontSize: 15, fontWeight: '500', marginTop: 2 }}>
              {sessionDate.toLocaleDateString()} at{' '}
              {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: colors.teal,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4 }}>Change</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View>
          <DateTimePicker
            value={sessionDate}
            mode="datetime"
            display="default"
            onChange={(event, date) => {
              if (date) {
                setSessionDate(date);
              }
            }}
          />
          <TouchableOpacity
            onPress={() => setShowDatePicker(false)}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 10,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>OK</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>

    <Text style={{ fontWeight: '600', fontSize: 16, color: '#444', marginTop: 16 }}>⏱ Session Duration</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {['30 min', '1 hr', '1.5 hr', '2 hr'].map((duration) => (
        <TouchableOpacity
          key={duration}
          onPress={() => setSelectedDuration(duration)}
          style={{
            backgroundColor: selectedDuration === duration ? colors.teal : '#eee',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 20,
            marginBottom: 6,
          }}
        >
          <Text style={{ color: selectedDuration === duration ? '#fff' : '#333' }}>{duration}</Text>
        </TouchableOpacity>
      ))}
    </View>

    <TouchableOpacity
      onPress={createSession}
      style={{
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
      }}
    >
      
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 2 }}>Save Session</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => setSessionModalVisible(false)} style={{ marginTop: 12 }}>
      <Text style={{ textAlign: 'center', color: 'red', fontWeight: '500' }}>Cancel</Text>
    </TouchableOpacity>
  </View>
</Modal>





    </View>
  );
};

const styles = StyleSheet.create({
  skillChip: {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 20,
  marginBottom: 6,
},
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
  }
});

export default NewChatScreen;
