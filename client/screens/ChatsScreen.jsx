import React, { useState, useEffect } from 'react';
import { Swipeable } from 'react-native-gesture-handler';

import {
  Text,
  View,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  orderBy,
  getDocs,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';

import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';

const ChatsScreen = ({ setUnreadCount = () => {} }) => {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const currentUser = FirebaseAuth.currentUser;
  const [userPhotos, setUserPhotos] = useState({});
const [searchText, setSearchText] = useState('');
const [filteredChats, setFilteredChats] = useState([]);
const [connectionSearchText, setConnectionSearchText] = useState('');

 const createSession = async () => {
  if (!selectedTeachSkill || !selectedLearnSkill) {
    Alert.alert('Error', 'Please select both a teaching and learning skill.');
    return;
  }
  const filtered = snapshot.docs.filter(chat => {
  const otherId = chat.data().participants.find(id => id !== currentUser.uid);
  const other = chat.data().userInfo?.find(u => u.id === otherId);
  return other?.name?.toLowerCase().includes(searchText.toLowerCase());
});

setFilteredChats(filtered);

useEffect(() => {
  if (!searchText.trim()) {
    setFilteredChats(chats);
    return;
  }

  const filtered = chats.filter(chat => {
    const otherId = chat.data().participants.find(id => id !== currentUser.uid);
    const other = chat.data().userInfo?.find(u => u.id === otherId);
    return other?.name?.toLowerCase().includes(searchText.toLowerCase());
  });

  setFilteredChats(filtered);
}, [searchText, chats]);

  try {
    await addDoc(collection(FirestoreDB, 'sessions'), {
      from: currentUser.uid,
      to: user.id,
      teaching: selectedTeachSkill,
      learning: selectedLearnSkill,
      date: sessionDate.toISOString(),
      duration: selectedDuration,
        status: 'pending',
      createdAt: serverTimestamp(),
    });
    Alert.alert('✅ Session set successfully!');
    setSessionModalVisible(false);
    setSelectedTeachSkill('');
    setSelectedLearnSkill('');
    setSelectedDuration('30 min'); // Reset to default if you want
  } catch (err) {
    console.error('❌ Error creating session:', err);
    Alert.alert('Error', 'Failed to create session');
  }
};

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(FirestoreDB, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        console.log('📥 Chats snapshot received:', snapshot.size);
        setChats(snapshot.docs);
        const photoUpdates = {};

        for (const chat of snapshot.docs) {
          const otherId = chat.data().participants.find(id => id !== currentUser.uid);
          if (otherId && !userPhotos[otherId]) {
            const userSnap = await getDoc(doc(FirestoreDB, 'users', otherId));
            if (userSnap.exists()) {
              photoUpdates[otherId] = userSnap.data().photoUrl;
            }
          }
        }

        setUserPhotos(prev => ({ ...prev, ...photoUpdates }));
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error fetching chats:', error);
        setChats([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!currentUser) return;
      try {
        console.log('🔍 Fetching connections...');
        const userDoc = await getDoc(doc(FirestoreDB, 'users', currentUser.uid));
        const connectionIds = [...(userDoc.data()?.connections || [])];

        console.log('✅ Connection IDs:', connectionIds);

        const chunks = [];
        while (connectionIds.length) chunks.push(connectionIds.splice(0, 10));

        const allConnections = [];
        for (const chunk of chunks) {
          const q = query(collection(FirestoreDB, 'users'), where('__name__', 'in', chunk));
          const snapshot = await getDocs(q);
          snapshot.forEach(docSnap => {
            if (docSnap.id !== currentUser.uid) {
              allConnections.push({ id: docSnap.id, ...docSnap.data() });
            }
          });
        }
        console.log('✅ Connections loaded:', allConnections.length);
        setConnections(allConnections);
      } catch (err) {
        console.error('❌ Error loading connections:', err);
      }
    };

    fetchConnections();
  }, []);
const deleteChat = async (chatId) => {
  try {
    await deleteDoc(doc(FirestoreDB, 'chats', chatId));
    Alert.alert("Deleted", "Chat successfully deleted.");
  } catch (err) {
    console.error('Error deleting chat:', err);
    Alert.alert("Error", "Failed to delete chat.");
  }
};
  const getChatPreview = (chat) => {
    const lastMessage = chat.data().messages?.[0];
    if (!lastMessage) return 'Start chatting';
    const sender = lastMessage.user._id === currentUser.uid ? 'You' : lastMessage.user.name;
    return `${sender}: ${lastMessage.text?.slice(0, 25)}${lastMessage.text?.length > 25 ? '...' : ''}`;
  };

  const getTimestamp = (chat) => {
    const date = new Date(chat.data().lastUpdated);
    return date.toLocaleDateString();
  };

  const startNewChat = async (contact) => {
    try {
      console.log('👉 Contact pressed:', contact);

      const ids = [currentUser.uid, contact.id].sort();
      const chatId = ids.join('_');
      const chatRef = doc(FirestoreDB, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        const newChatData = {
          participants: ids,
          userInfo: [
            {
              id: currentUser.uid,
              name: currentUser.displayName || 'You',
              photoUrl: currentUser.photoURL || '',
            },
            {
              id: contact.id,
              name: contact.firstName || 'User',
              photoUrl: contact.photoUrl || '',
            },
          ],
          messages: [],
          lastUpdated: Date.now(),
        };

        console.log('🚀 Attempting to create new chat:', newChatData);

        await setDoc(chatRef, newChatData);

        console.log('✅ New chat created');
      } else {
        console.log('ℹ Chat already exists');
      }

      setModalVisible(false);
      navigation.navigate('NewChatScreen', {
        user: {
          id: contact.id,
          firstName: contact.firstName,
          photoUrl: contact.photoUrl,
          status: contact.status || 'Available',
        },
      });
    } catch (err) {
      console.error('❌ Error in startNewChat:', err);
      Alert.alert('Error', err.message || 'Could not start chat');
    }
  };

  return (
    <Pressable style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.teal} />
      ) : chats.length === 0 ? (
        <View style={styles.blankContainer}>
          <Text>No conversations yet</Text>
        </View>
      ) : (
       <>
  {/* 🔍 Search Bar */}
  <TextInput
    style={styles.searchBar1}
    placeholder="Search chats..."
    placeholderTextColor="#666"
    value={searchText}
    onChangeText={setSearchText}
  />

  <ScrollView>
    {chats
      .filter(chat => {
        if (!searchText.trim()) return true; // show all if no search
        const otherId = chat.data().participants.find(id => id !== currentUser.uid);
        const other = chat.data().userInfo?.find(u => u.id === otherId);
        return other?.name?.toLowerCase().includes(searchText.toLowerCase());
      })
      .sort((a, b) => b.data().lastUpdated - a.data().lastUpdated) // sort by newest
      .map(chat => {
        const otherId = chat.data().participants.find(id => id !== currentUser.uid);
        const other = chat.data().userInfo?.find(u => u.id === otherId);
        return (
          <Swipeable
  key={chat.id}  // 🔄 Move key here
  renderRightActions={() => (
    <TouchableOpacity
      style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
      }}
      onPress={() => {
        Alert.alert(
          'Delete Chat',
          'Are you sure you want to delete this chat?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteChat(chat.id),
            },
          ]
        );
      }}
    >
      <Ionicons name="trash" size={24} color="#fff" />
    </TouchableOpacity>
  )}
>
  <TouchableOpacity
    onPress={() =>
      navigation.navigate('NewChatScreen', {
        user: {
          id: other?.id,
          firstName: other?.name,
          photoUrl: userPhotos[otherId],
          status: other?.status || 'Available',
        },
      })
    }
    style={styles.connectionItem}
  >
    <Image source={{ uri: userPhotos[otherId] }} style={styles.avatar} />
    <View>
      <Text style={styles.connectionName}>{other?.name || 'Chat'}</Text>
      <Text style={styles.statusText}>{getChatPreview(chat)}</Text>
    </View>
    <Text style={styles.timestamp}>{getTimestamp(chat)}</Text>
  </TouchableOpacity>
</Swipeable>

        );
      })}
  </ScrollView>
</>

      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
      </TouchableOpacity>
<Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
  <View style={styles.modalContainer}>
    {/* 🔻 Header */}
    <View style={styles.modalHeader}>
      <TouchableOpacity onPress={() => setModalVisible(false)}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.titleGroup}>
        <Text style={styles.modalTitle}>Select contact</Text>
        <Text style={styles.subtitle}>{connections.length} contacts</Text>
      </View>
    </View>

    {/* 🔍 Search */}
    <TextInput
      placeholder="Search contacts..."
      placeholderTextColor="#999"
      value={connectionSearchText}
      onChangeText={setConnectionSearchText}
      style={styles.searchBar}
    />

    {/* 👥 List */}
    <FlatList
      data={connections.filter(item =>
        item.firstName?.toLowerCase().includes(connectionSearchText.toLowerCase())
      )}
      keyExtractor={(item) => item.id}
      style={styles.modalList}
      contentContainerStyle={{ paddingBottom: 100 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.connectionItem}
          onPress={() => startNewChat(item)}
        >
          <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.connectionName}>{item.firstName}</Text>
            <Text style={styles.statusText}>{item.status || 'Available'}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  </View>
</Modal>

    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  blankContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.teal,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#128C7E',
    padding: 16,
    gap: 12,
  },
  titleGroup: { flex: 1 },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 25,
  },
  subtitle: {
    color: '#eee',
    fontSize: 12,
  },
  modalList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ccc',
  },
  connectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  timestamp: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#aaa',
  },
  searchBar: {
  backgroundColor: '#f0f0f0',
  margin: 8,
  padding: 10,
  borderRadius: 10,
  fontSize: 14,
  color: '#333',
  marginTop:50,
},
searchBar1: {
  backgroundColor: '#f0f0f0',
  marginHorizontal: 16,
  marginTop: 45,
  padding: 10,
  borderRadius: 10,
  fontSize: 14,
  color: '#333',
},
modalContainer: {
  flex: 1,
  backgroundColor: '#fff',
},

modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#128C7E',
  paddingTop: 50,
  paddingBottom: 16,
  paddingHorizontal: 16,
  gap: 12,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},

titleGroup: { flex: 1 },

modalTitle: {
  fontSize: 18,
  color: '#fff',
  fontWeight: 'bold',
},

subtitle: {
  color: '#eee',
  fontSize: 12,
},

searchBar: {
  backgroundColor: '#f0f0f0',
  margin: 16,
  padding: 12,
  borderRadius: 12,
  fontSize: 14,
  color: '#333',
},

modalList: {
  flex: 1,
  backgroundColor: '#fff',
},

connectionItem: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  padding: 14,
  borderBottomColor: '#eee',
  borderBottomWidth: 1,
},

avatar: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: '#ccc',
},

connectionName: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
},

statusText: {
  fontSize: 12,
  color: '#666',
},


});

export default ChatsScreen;
