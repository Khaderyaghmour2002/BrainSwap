import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  query,
  where,
   Timestamp,
} from 'firebase/firestore';
import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function UpdatesScreen() {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = FirebaseAuth.currentUser;

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
      fetchSessions();
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
      const enriched = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const userSnap = await getDoc(doc(FirestoreDB, 'users', data.from));
        const userData = userSnap.exists() ? userSnap.data() : {};
        return {
          id: docSnap.id,
          ...data,
          fromName: userData.firstName || 'Unknown',
          fromPhoto: userData.photoUrl || 'https://via.placeholder.com/64',
        };
      }));
      setRequests(enriched);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

 const fetchSessions = async () => {
  try {
    const now = Timestamp.now(); // Firestore-compatible timestamp

    const q = query(
      collection(FirestoreDB, 'sessions'),
      where('from', '==', currentUser.uid),
      where('date', '>', new Date().toISOString())
    );

    const snapshot = await getDocs(q);

    const enriched = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const userSnap = await getDoc(doc(FirestoreDB, 'users', data.to));
      const userData = userSnap.exists() ? userSnap.data() : {};
      return {
        id: docSnap.id,
        ...data,
        partnerName: userData.firstName || 'Unknown',
      };
    }));

    setSessions(enriched);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    Alert.alert('Error', 'Failed to fetch sessions.');
  }
};

  const handleAccept = async (request) => {
    try {
      await updateDoc(doc(FirestoreDB, 'requests', request.id), { status: 'accepted' });
      const requesterRef = doc(FirestoreDB, 'users', request.from);
      const currentUserRef = doc(FirestoreDB, 'users', currentUser.uid);

      await runTransaction(FirestoreDB, async (tx) => {
        const [currentSnap, requesterSnap] = await Promise.all([
          tx.get(currentUserRef),
          tx.get(requesterRef),
        ]);

        const currentConnections = currentSnap.exists() ? currentSnap.data().connections || [] : [];
        const requesterConnections = requesterSnap.exists() ? requesterSnap.data().connections || [] : [];

        if (!currentConnections.includes(request.from)) {
          tx.update(currentUserRef, { connections: [...currentConnections, request.from] });
        }
        if (!requesterConnections.includes(currentUser.uid)) {
          tx.update(requesterRef, { connections: [...requesterConnections, currentUser.uid] });
        }
      });
      fetchRequests();
    } catch (err) {
      Alert.alert('Error', 'Failed to accept request.');
    }
  };

  const handleReject = async (id) => {
    try {
      await updateDoc(doc(FirestoreDB, 'requests', id), { status: 'rejected' });
      fetchRequests();
    } catch (err) {
      Alert.alert('Error', 'Failed to reject request.');
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;

  // Keep your imports and logic exactly as you wrote

return (
  <ScrollView style={styles.container}>
    <Text style={styles.header}>🔔 Updates</Text>

    {/* Pending Requests */}
    {requests.length > 0 && (
      <>
        <Text style={styles.subHeader}>🤝 Pending Connection Requests</Text>
        {requests.map((req) => (
          <View key={req.id} style={styles.card}>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ProfileViewScreen', { userId: req.from })
                }
              >
                <Image source={{ uri: req.fromPhoto }} style={styles.avatar} />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{req.fromName}</Text>
                <Text style={styles.subText}>wants to connect with you</Text>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleAccept(req)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleReject(req.id)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </>
    )}

    {/* Upcoming Sessions */}
    {sessions.length > 0 && (
      <>
        <Text style={styles.subHeader}>📅 Your Upcoming Sessions</Text>
        {sessions.map((s) => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.sessionText}>
              🗓 {new Date(s.date).toLocaleString()}
            </Text>
            <Text style={styles.sessionDetails}>
              🎓 Teaching: <Text style={styles.bold}>{s.teaching}</Text>
            </Text>
            <Text style={styles.sessionDetails}>
              📘 Learning: <Text style={styles.bold}>{s.learning}</Text>
            </Text>
            <Text style={styles.sessionDetails}>
              🤝 With: <Text style={styles.bold}>{s.partnerName}</Text>
            </Text>
          </View>
        ))}
      </>
    )}

    {/* System Messages */}
    <Text style={styles.subHeader}>📢 System Updates</Text>
    <View style={[styles.card, { backgroundColor: '#e7f4ff' }]}>
      <Text style={{ fontSize: 15, color: '#0077cc' }}>
        💡 New skill verification features are now live! Try verifying a skill from your profile.
      </Text>
    </View>
  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f7fb',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    marginTop: 25,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    color: '#2a2a2a',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
    color: '#222',
  },
  subText: {
    color: '#666',
    marginTop: 2,
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sessionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sessionDetails: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
    color: '#000',
  },
});

