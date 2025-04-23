import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  orderBy,
  getDocs,
  getDoc,
} from 'firebase/firestore';

import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import ContactRow from '../components/ContactRow';
import { colors } from '../assets/constants';

const Chats = ({ setUnreadCount }) => {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [newMessages, setNewMessages] = useState({});
  const [connections, setConnections] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const currentUser = FirebaseAuth.currentUser;

  useFocusEffect(
    useCallback(() => {
      if (!currentUser) return;

      const loadNewMessages = async () => {
        const stored = await AsyncStorage.getItem('newMessages');
        const parsed = stored ? JSON.parse(stored) : {};
        setNewMessages(parsed);
        setUnreadCount(Object.values(parsed).reduce((a, b) => a + b, 0));
      };

      const q = query(
        collection(FirestoreDB, 'chats'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('lastUpdated', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setChats(snapshot.docs);
        setLoading(false);

        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const chatId = change.doc.id;
            const messages = change.doc.data().messages || [];
            const latest = messages[0];
            if (latest && latest.user._id !== currentUser.uid) {
              setNewMessages((prev) => {
                const updated = { ...prev, [chatId]: (prev[chatId] || 0) + 1 };
                AsyncStorage.setItem('newMessages', JSON.stringify(updated));
                setUnreadCount(Object.values(updated).reduce((a, b) => a + b, 0));
                return updated;
              });
            }
          }
        });
      });

      loadNewMessages();
      return () => unsubscribe();
    }, [setUnreadCount])
  );

  useEffect(() => {
    const fetchConnections = async () => {
      if (!currentUser) return;
      try {
        const userDocRef = doc(FirestoreDB, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const connectionIds = userData.connections || [];
          if (connectionIds.length === 0) {
            setConnections([]);
            return;
          }
          const fetchedConnections = [];
          const chunks = [];
          const clonedIds = [...connectionIds];
          while (clonedIds.length) chunks.push(clonedIds.splice(0, 10));
          for (const chunk of chunks) {
            const q = query(collection(FirestoreDB, 'users'), where('__name__', 'in', chunk));
            const snapshot = await getDocs(q);
            snapshot.forEach((docSnap) => {
              if (docSnap.id !== currentUser.uid) {
                fetchedConnections.push({ id: docSnap.id, ...docSnap.data() });
              }
            });
          }
          setConnections(fetchedConnections);
        }
      } catch (error) {
        console.error('Error fetching connections:', error);
        Alert.alert('Error', 'Failed to load connections.');
      }
    };
    fetchConnections();
  }, []);

  const handleChatName = (chat) => {
    const other = chat.data().userInfo?.find((u) => u.id !== currentUser.uid);
    return other?.name || 'Chat';
  };

  const handleOnPress = (chat) => {
    const chatId = chat.id;
    if (selectedItems.includes(chatId)) {
      selectItems(chat);
    } else {
      setNewMessages((prev) => {
        const updated = { ...prev, [chatId]: 0 };
        AsyncStorage.setItem('newMessages', JSON.stringify(updated));
        setUnreadCount(Object.values(updated).reduce((a, b) => a + b, 0));
        return updated;
      });
      navigation.navigate('ChatScreen', {
        chatId,
        recipientName: handleChatName(chat),
      });
    }
  };

  const startNewChat = async (connection) => {
    const ids = [currentUser.uid, connection.id].sort();
    const chatId = ids.join('_');
    const chatRef = doc(FirestoreDB, 'chats', chatId);
    await setDoc(chatRef, {
      participants: ids,
      userInfo: [
        { id: currentUser.uid, name: currentUser.displayName || 'You' },
        { id: connection.id, name: connection.firstName || 'User' },
      ],
      messages: [],
      lastUpdated: Date.now(),
    }, { merge: true });
    setModalVisible(false);
    navigation.navigate('ChatScreen', {
      chatId,
      recipientName: connection.firstName,
    });
  };

  const handleLongPress = (chat) => {
    selectItems(chat);
  };

  const selectItems = (chat) => {
    const exists = selectedItems.includes(chat.id);
    setSelectedItems(exists ? selectedItems.filter((id) => id !== chat.id) : [...selectedItems, chat.id]);
  };

  const handleDeleteChat = () => {
    Alert.alert('Delete chat?', 'Are you sure you want to delete selected chat(s)?', [
      {
        text: 'Delete',
        onPress: () => {
          selectedItems.forEach(async (chatId) => {
            await deleteDoc(doc(FirestoreDB, 'chats', chatId));
          });
          setSelectedItems([]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getSelected = (chat) => selectedItems.includes(chat.id);

  const handleSubtitle = (chat) => {
    const message = chat.data().messages?.[0];
    if (!message) return 'No messages yet';
    const isMe = message.user._id === currentUser.uid;
    const name = isMe ? 'You' : message.user.name;
    return `${name}: ${message.text?.slice(0, 20)}${message.text?.length > 20 ? '...' : ''}`;
  };

  const handleTimestamp = (chat) => {
    const date = new Date(chat.data().lastUpdated);
    return date.toLocaleDateString();
  };

  return (
    <Pressable style={styles.container} onPress={() => setSelectedItems([])}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.teal} />
      ) : (
        <ScrollView>
          {chats.length === 0 ? (
            <View style={styles.blankContainer}>
              <Text>No conversations yet</Text>
            </View>
          ) : (
            chats.map((chat) => (
              <ContactRow
                key={chat.id}
                name={handleChatName(chat)}
                subtitle={handleSubtitle(chat)}
                subtitle2={handleTimestamp(chat)}
                onPress={() => handleOnPress(chat)}
                onLongPress={() => handleLongPress(chat)}
                selected={getSelected(chat)}
                newMessageCount={newMessages[chat.id] || 0}
              />
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleGroup}>
            <Text style={styles.modalTitle}>Select contact</Text>
            <Text style={styles.subtitle}>{connections.length} contacts</Text>
          </View>
          <Ionicons name="search" size={22} color="#fff" />
        </View>

        <FlatList
          data={connections}
          keyExtractor={(item) => item.id}
          style={styles.modalList}
          renderItem={({ item }) => (
            <TouchableOpacity
            style={styles.connectionItem}
            onPress={() => {
              setModalVisible(false);
              navigation.navigate('NewChatScreen', { user: item });
            }}
            >
              <Image
                source={{ uri: item.photoUrl || 'https://i.pravatar.cc/150' }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.connectionName}>{item.firstName}</Text>
                <Text style={styles.statusText}>{item.status || 'Available'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </Modal>
    </Pressable>
  );
};

Chats.propTypes = {
  setUnreadCount: PropTypes.func,
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
  titleGroup: {
    flex: 1,
  },
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
});

export default Chats;
