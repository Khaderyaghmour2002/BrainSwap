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
  deleteDoc,
  runTransaction
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
    const currentUid = FirebaseAuth.currentUser.uid;

    const requestDocRef = doc(FirestoreDB, 'requests', request.id);
    const userRef = doc(FirestoreDB, 'users', currentUid);

    await runTransaction(FirestoreDB, async (transaction) => {
      // Read the request document first
      const requestSnap = await transaction.get(requestDocRef);
      if (!requestSnap.exists()) {
        throw new Error('Request document not found');
      }

      const requestData = requestSnap.data();

      // Validate that the current user is authorized
      if (requestData.to !== currentUid) {
        throw new Error('You are not authorized to accept this request');
      }

      const requesterUid = requestData.from;
      const requesterRef = doc(FirestoreDB, 'users', requesterUid);

      // Read both user documents
      const userSnap = await transaction.get(userRef);
      const requesterSnap = await transaction.get(requesterRef);

      if (!userSnap.exists()) {
        throw new Error('Your user profile is missing');
      }
      if (!requesterSnap.exists()) {
        throw new Error('Requester profile is missing');
      }

      const userConnections = new Set(userSnap.data().connections || []);
      const requesterConnections = new Set(requesterSnap.data().connections || []);

      userConnections.add(requesterUid);
      requesterConnections.add(currentUid);

      // Update connections
      transaction.update(userRef, { connections: Array.from(userConnections) });
      transaction.update(requesterRef, { connections: Array.from(requesterConnections) });

      // Update request status to accepted
      transaction.update(requestDocRef, { status: 'accepted' });
    });

    fetchRequests();
    Alert.alert('Success', 'Request accepted!');
  } catch (error) {
    console.error('Accept error:', error);
    Alert.alert('Error', error.message || 'Failed to accept request.');
  }
};





const handleReject = async (requestId) => {
  try {
    const requestRef = doc(FirestoreDB, 'requests', requestId);
    await runTransaction(FirestoreDB, async (transaction) => {
      const requestSnap = await transaction.get(requestRef);
      if (!requestSnap.exists()) throw new Error('Request does not exist');
      transaction.update(requestRef, { status: 'rejected' });
    });

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
