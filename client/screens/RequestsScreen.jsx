import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {
  collection,
  getDocs,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';
import { query, where} from 'firebase/firestore';

export default function RequestsScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = FirebaseAuth.currentUser;

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, []);

 const fetchRequests = async () => {
  try {
    const q = query(
      collection(FirestoreDB, 'requests'),
      where('to', '==', currentUser.uid),
      where('status', '==', 'pending') // Only show pending requests
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    setRequests(data);
  } catch (error) {
    console.error('Error fetching requests:', error);
    Alert.alert('Error', 'Failed to fetch requests.');
  } finally {
    setLoading(false);
  }
};

  const handleAccept = async (request) => {
    try {
      // 1. Add each other to connections
      const userRef = doc(FirestoreDB, 'users', currentUser.uid);
      const requesterRef = doc(FirestoreDB, 'users', request.id);

      await Promise.all([
        FirestoreDB.runTransaction(async (transaction) => {
          const userSnap = await transaction.get(userRef);
          const conn = userSnap.data().connections || [];
          transaction.update(userRef, {
            connections: [...new Set([...conn, request.id])]
          });
        }),
        FirestoreDB.runTransaction(async (transaction) => {
          const userSnap = await transaction.get(requesterRef);
          const conn = userSnap.data().connections || [];
          transaction.update(requesterRef, {
            connections: [...new Set([...conn, currentUser.uid])]
          });
        }),
        deleteDoc(doc(FirestoreDB, 'users', currentUser.uid, 'requests', request.id))
      ]);

      fetchRequests();
      Alert.alert('Request Accepted');
    } catch (err) {
      console.error('Accept error:', err);
      Alert.alert('Error', 'Failed to accept request.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await deleteDoc(doc(FirestoreDB, 'users', currentUser.uid, 'requests', requestId));
      fetchRequests();
      Alert.alert('Request Rejected');
    } catch (err) {
      console.error('Reject error:', err);
      Alert.alert('Error', 'Failed to reject request.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />;
  }

  if (requests.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No connection requests</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.firstName}</Text>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4CAF50' }]}
                onPress={() => handleAccept(item)}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#f44336' }]}
                onPress={() => handleReject(item.id)}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
