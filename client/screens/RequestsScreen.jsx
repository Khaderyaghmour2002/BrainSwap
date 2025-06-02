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
  updateDoc,
  getDoc,
  runTransaction,
  query,
  where,
} from 'firebase/firestore';
import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';

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
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
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
    const requesterUid = request.from;
    const requestId = request.id;

 
    // Step 1: Update request status
    console.log("🟡 Updating request status to 'accepted'...");
    await updateDoc(doc(FirestoreDB, 'requests', requestId), {
      status: 'accepted',
    });

    // Step 2: Add requester to current user's connections
    const currentUserRef = doc(FirestoreDB, 'users', currentUid);
    const currentSnap = await getDoc(currentUserRef);
    const currentConnections = currentSnap.exists() ? currentSnap.data().connections || [] : [];

    if (!currentConnections.includes(requesterUid)) {
      await updateDoc(currentUserRef, {
        connections: [...currentConnections, requesterUid],
      });
    } else {
      console.log("⚠️ Requester already in current user's connections.");
    }

    // Step 3: Add current user to requester's connections
    const requesterRef = doc(FirestoreDB, 'users', requesterUid);
    const requesterSnap = await getDoc(requesterRef);
    const requesterConnections = requesterSnap.exists() ? requesterSnap.data().connections || [] : [];
    console.log("🟢 Requester connections before update:", requesterConnections);

    if (!requesterConnections.includes(currentUid)) {
      await updateDoc(requesterRef, {
        connections: [...requesterConnections, currentUid],
      });
    } else {
      console.log("⚠️ Current user already in requester's connections.");
    }

    Alert.alert('✅ Connection accepted', 'Both users are now connected.');
    fetchRequests();
  } catch (error) {
    console.error('❌ Accept error:', error);
    Alert.alert('❌ Error', error.message || 'Something went wrong');
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

    fetchRequests(); // Refresh list
    Alert.alert('Request Rejected');
  } catch (err) {
    console.error('Reject error:', err);
    Alert.alert('Error', 'Failed to reject request.');
  }
};


  const renderRequestItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.firstName}</Text>
        <Text style={styles.subtitle}>Wants to connect with you</Text>
        <View style={styles.buttonsContainer}>
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
  );

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
      renderItem={renderRequestItem}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#F7FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    backgroundColor: '#ccc',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});