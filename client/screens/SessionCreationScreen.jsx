import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { FirestoreDB, FirebaseAuth } from '../../server/firebaseConfig';
import { colors } from '../assets/constants';

export default function SessionCreationScreen({ navigation, route }) {
  const { user, myTeachSkills, myLearnSkills } = route.params;
  const currentUser = FirebaseAuth.currentUser;

  const [selectedTeachSkill, setSelectedTeachSkill] = useState('');
  const [selectedLearnSkill, setSelectedLearnSkill] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('30 min');

  const createSession = async () => {
    if (!selectedTeachSkill || !selectedLearnSkill) {
      alert('Please select both a teaching and learning skill.');
      return;
    }

    try {
      // Create the session document
      const sessionRef = await addDoc(collection(FirestoreDB, 'sessions'), {
        from: currentUser.uid,
        to: user.id,
        teaching: selectedTeachSkill,
        learning: selectedLearnSkill,
        date: sessionDate.toISOString(),
        duration: selectedDuration,
        confirmed: false,
        createdAt: serverTimestamp(),
      });

      // Prepare chat message
      const chatId = [currentUser.uid, user.id].sort().join('_');
      const chatDocRef = doc(FirestoreDB, 'chats', chatId);
      const chatSnap = await getDoc(chatDocRef);
      const prevMessages = chatSnap.exists() ? chatSnap.data().messages || [] : [];

      const confirmationMsg = {
        _id: sessionRef.id,
        text: `📢 New session proposed!\n\n📝 Teach: ${selectedTeachSkill}\n🎯 Learn: ${selectedLearnSkill}\n📅 ${sessionDate.toLocaleDateString()} at ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n⏱ Duration: ${selectedDuration}\n\nPlease confirm this session.`,
        createdAt: new Date(),
        user: {
          _id: currentUser.uid,
          name: currentUser.displayName || 'User',
        },
        sessionId: sessionRef.id,
        pendingConfirmation: true,
      };

      // Save the chat message
      await setDoc(
        chatDocRef,
        {
          messages: [...prevMessages, confirmationMsg],
          lastUpdated: Date.now(),
        },
        { merge: true }
      );

      alert('✅ Session sent for confirmation!');
      navigation.goBack();

    } catch (err) {
      console.error('❌ Error creating session:', err);
      alert('Error creating session');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f0f8ff' }}>
      <Text style={styles.header}>🌟 Plan Your Skill Swap Session</Text>

      <Text style={styles.label}>📝 I want to teach:</Text>
      <View style={styles.skillWrap}>
        {myTeachSkills.map(skill => (
          <TouchableOpacity
            key={skill}
            onPress={() => setSelectedTeachSkill(skill)}
            style={[
              styles.chip,
              { backgroundColor: selectedTeachSkill === skill ? colors.teal : '#e0f7fa' }
            ]}
          >
            <Ionicons name="book-outline" size={16} color={selectedTeachSkill === skill ? '#fff' : colors.primary} />
            <Text style={{ color: selectedTeachSkill === skill ? '#fff' : colors.primary, marginLeft: 4 }}>{skill}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 16 }]}>🎯 I want to learn:</Text>
      <View style={styles.skillWrap}>
        {myLearnSkills.map(skill => (
          <TouchableOpacity
            key={skill}
            onPress={() => setSelectedLearnSkill(skill)}
            style={[
              styles.chip,
              { backgroundColor: selectedLearnSkill === skill ? colors.teal : '#e8f5e9' }
            ]}
          >
            <Ionicons name="bulb-outline" size={16} color={selectedLearnSkill === skill ? '#fff' : colors.primary} />
            <Text style={{ color: selectedLearnSkill === skill ? '#fff' : colors.primary, marginLeft: 4 }}>{skill}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateBox}>
        <Text style={styles.dateLabel}>📅 Session Date & Time</Text>
        {!showDatePicker ? (
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
            <View>
              <Text style={{ fontSize: 13, color: '#555' }}>Selected:</Text>
              <Text style={{ fontSize: 15, fontWeight: '500' }}>
                {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={styles.changeButton}>
              <Ionicons name="calendar-outline" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 4 }}>Change</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <DateTimePicker
            value={sessionDate}
            mode="datetime"
            display="default"
            onChange={(event, date) => {
              if (date) setSessionDate(date);
              setShowDatePicker(false);
            }}
          />
        )}
      </View>

      <Text style={[styles.label, { marginTop: 16 }]}>⏱ Session Duration</Text>
      <View style={styles.skillWrap}>
        {['30 min', '1 hr', '1.5 hr', '2 hr'].map(duration => (
          <TouchableOpacity
            key={duration}
            onPress={() => setSelectedDuration(duration)}
            style={[
              styles.durationChip,
              { backgroundColor: selectedDuration === duration ? colors.teal : '#eee' }
            ]}
          >
            <Text style={{ color: selectedDuration === duration ? '#fff' : '#333' }}>{duration}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={createSession} style={styles.saveButton}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Save Session</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
        <Text style={{ textAlign: 'center', color: 'red', fontWeight: '500' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: 'bold', color: colors.primary, textAlign: 'center', marginBottom: 16, paddingTop: 30 },
  label: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 6 },
  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 50, marginBottom: 6 },
  durationChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginBottom: 6 },
  dateBox: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginTop: 16, elevation: 2 },
  dateLabel: { fontWeight: '600', fontSize: 16, color: '#444', marginBottom: 6 },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  changeButton: {
     backgroundColor: colors.teal,
     paddingVertical: 6,
      paddingHorizontal: 12,
       borderRadius: 8,
        flexDirection: 'row',
         alignItems: 'center' 
        },
  saveButton: { 

    backgroundColor: colors.primary,
     paddingVertical: 14,
      borderRadius: 10,
       alignItems: 'center',
        justifyContent: 'center',
         marginTop: 24
},
});
