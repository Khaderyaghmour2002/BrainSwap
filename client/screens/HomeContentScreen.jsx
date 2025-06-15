import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

export default function HomeContentScreen() {
  const [userName] = useState('John');
  const [upcomingSessions] = useState([
    { id: 1, date: '2025-07-14', time: '16:00', skill: 'JavaScript', type: 'Teaching', with: 'Maria' },
    { id: 2, date: '2025-07-20', time: '14:00', skill: 'English', type: 'Learning', with: 'Ali' },
  ]);
  const [mutualOpportunities] = useState([
    { id: 1, name: 'Sara', teaches: ['Figma'], wants: ['English'] },
    { id: 2, name: 'Omar', teaches: ['Photoshop'], wants: ['JavaScript'] },
  ]);
  const [skills] = useState({
    teaching: ['JavaScript', 'English'],
    learning: ['Figma', 'Guitar'],
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>👋 Hello, <Text style={styles.highlight}>{userName}</Text>!</Text>

      {/* Upcoming Sessions */}
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

      {/* Mutual Opportunities */}
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
              <TouchableOpacity style={styles.button}>
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
  skillSummary: { marginBottom: 4, fontSize: 14 },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  smallButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  smallButtonText: { color: '#fff', fontSize: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  actionButton: {
    flex: 1,
    backgroundColor: '#6a11cb',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: '#fff', fontWeight: '700' },
});
