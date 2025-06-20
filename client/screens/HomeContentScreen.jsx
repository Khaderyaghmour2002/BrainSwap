import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, doc, getDoc, getDocs, query, where, setDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseAuth, FirestoreDB } from '../../server/firebaseConfig';

export default function HomeContentScreen() {
  const [userName, setUserName] = useState('User');
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [mutualOpportunities, setMutualOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = FirebaseAuth.currentUser;

  useEffect(() => {
    if (currentUser) {
      fetchData();
    } else {
      Alert.alert('Error', 'User not authenticated');
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      const userRef = doc(FirestoreDB, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        Alert.alert('Error', 'User data not found');
        setLoading(false);
        return;
      }

      const userData = userSnap.data();
      setUserName(userData.firstName || 'User');

      // Fetch sessions
      const sessionsQ = query(
        collection(FirestoreDB, 'sessions'),
        where('participants', 'array-contains', currentUser.uid)
      );
      const sessionsSnap = await getDocs(sessionsQ);
      const sessions = sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpcomingSessions(sessions);

      // Fetch mutual opportunities
      const connectionsIds = userData.connections || [];
      const usersSnap = await getDocs(collection(FirestoreDB, 'users'));

      const mutuals = usersSnap.docs
        .filter(docSnap => {
          const data = docSnap.data();
          if (docSnap.id === currentUser.uid || connectionsIds.includes(docSnap.id)) return false;

          const teaches = (data.skillsToTeach || []).map(s => s.name);
          const wants = data.skillsToLearn || [];
          const myTeaches = (userData.skillsToTeach || []).map(s => s.name);
          const myWants = userData.skillsToLearn || [];

          const teachesWhatILearn = teaches.some(skill => myWants.includes(skill));
          const wantsWhatITeach = wants.some(skill => myTeaches.includes(skill));

          return teachesWhatILearn && wantsWhatITeach;
        })
        .map(docSnap => ({
          id: docSnap.id,
          name: docSnap.data().firstName,
          teaches: (docSnap.data().skillsToTeach || []).map(s => s.name),
          wants: docSnap.data().skillsToLearn || [],
        }));

      setMutualOpportunities(mutuals);
    } catch (err) {
      console.error('Error fetching data:', err);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

const proposeExchange = async (targetUserId) => {
  try {
    const requestId = `${currentUser.uid}_${targetUserId}`;
    const requestRef = doc(FirestoreDB, 'requests', requestId);

    await setDoc(requestRef, {
      from: currentUser.uid,
      to: targetUserId,
      status: 'pending',
      timestamp: serverTimestamp(),
    });

    // Remove the user from mutualOpportunities
    setMutualOpportunities(prev => prev.filter(item => item.id !== targetUserId));

    Alert.alert('✅ Request Sent', 'Your exchange proposal was sent.');
  } catch (err) {
    console.error('Error sending request:', err);
    Alert.alert('❌ Error', 'Failed to send exchange request.');
  }
};


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>👋 Hello, <Text style={styles.highlight}>{userName}</Text>!</Text>

      {/* Sessions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Upcoming Sessions</Text>
        {upcomingSessions.length === 0 ? (
          <Text style={styles.placeholder}>No sessions scheduled.</Text>
        ) : (
          upcomingSessions.map(session => (
            <View key={session.id} style={styles.card}>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>{session.date} {session.time}</Text> | {session.type}: <Text style={styles.skill}>{session.skill}</Text> with {session.with}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Mutuals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔗 Mutual Opportunities</Text>
        {mutualOpportunities.length === 0 ? (
          <Text style={styles.placeholder}>No mutual matches found.</Text>
        ) : (
          mutualOpportunities.map(match => (
            <View key={match.id} style={styles.card}>
              <Text style={styles.cardText}>
                <Text style={styles.bold}>{match.name}</Text> | Teaches: <Text style={styles.skill}>{match.teaches.join(', ')}</Text> | Wants: <Text style={styles.skill}>{match.wants.join(', ')}</Text>
              </Text>
              <TouchableOpacity style={styles.button} onPress={() => proposeExchange(match.id)}>
                <Text style={styles.buttonText}>✨ Propose Exchange</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 28, paddingTop: 15, fontWeight: '700', marginBottom: 20, color: '#333' },
  highlight: { color: '#6a11cb' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10, color: '#444' },
  placeholder: { color: '#999', fontStyle: 'italic' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardText: { fontSize: 14, color: '#333' },
  bold: { fontWeight: '600' },
  skill: { color: '#6a11cb', fontWeight: '500' },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
