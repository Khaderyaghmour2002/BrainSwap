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
import { useNavigation } from '@react-navigation/native';

export default function RequestsScreen() {
  const navigation = useNavigation();
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

      // Fetch extra user data (name, photo) for each request
      const enrichedRequests = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const request = docSnap.data();
        const fromUserRef = doc(FirestoreDB, 'users', request.from);
        const fromUserSnap = await getDoc(fromUserRef);
        const fromUserData = fromUserSnap.exists() ? fromUserSnap.data() : {};
        return {
          id: docSnap.id,
          ...request,
          fromName: fromUserData.firstName || 'Unknown',
          fromPhoto: fromUserData.photoUrl || 'https://via.placeholder.com/64',
        };
      }));

      setRequests(enrichedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request) => {
    try {
      const currentUid = currentUser.uid;
      const requesterUid = request.from;

      await updateDoc(doc(FirestoreDB, 'requests', request.id), { status: 'accepted' });

      // Add connections both ways
      const currentUserRef = doc(FirestoreDB, 'users', currentUid);
      const requesterRef = doc(FirestoreDB, 'users', requesterUid);

      await runTransaction(FirestoreDB, async (tx) => {
        const currentSnap = await tx.get(currentUserRef);
        const requesterSnap = await tx.get(requesterRef);

        const currentConnections = currentSnap.exists() ? currentSnap.data().connections || [] : [];
        const requesterConnections = requesterSnap.exists() ? requesterSnap.data().connections || [] : [];

        if (!currentConnections.includes(requesterUid)) {
          tx.update(currentUserRef, { connections: [...currentConnections, requesterUid] });
        }
        if (!requesterConnections.includes(currentUid)) {
          tx.update(requesterRef, { connections: [...requesterConnections, currentUid] });
        }
      });

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

      fetchRequests();
      Alert.alert('Request Rejected');
    } catch (err) {
      console.error('Reject error:', err);
      Alert.alert('Error', 'Failed to reject request.');
    }
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate("ProfileViewScreen", { userId: item.from })}>
        <Image source={{ uri: item.fromPhoto }} style={styles.avatar} />
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.fromName}</Text>
        <Text style={styles.subtitle}>wants to connect with you</Text>
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
    return <ActivityIndicator size="large" color="#6a11cb" style={{ marginTop: 100 }} />;
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
    backgroundColor: '#fff',
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
