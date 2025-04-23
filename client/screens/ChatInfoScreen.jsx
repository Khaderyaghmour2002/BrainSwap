import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { colors } from '../assets/constants';
import { database } from '../../server/firebaseConfig';

const ChatInfo = ({ route }) => {
  const { chatId, user } = route.params; // chatId and user (recipient info)
  const [recipient, setRecipient] = useState(null);

  useEffect(() => {
    const fetchRecipient = async () => {
      try {
        const userRef = doc(database, 'users', user?.id);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setRecipient(userDoc.data());
        } else {
          Alert.alert('Error', 'User not found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load user information.');
        console.error(error);
      }
    };

    fetchRecipient();
  }, [user]);

  if (!recipient) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loading}>Loading user info...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.avatar}>
        <Text style={styles.avatarLabel}>
          {recipient.firstName?.[0] || 'U'}
        </Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name}>{recipient.firstName}</Text>
        <Text style={styles.email}>{recipient.email || 'Email not available'}</Text>
      </View>

      <View style={styles.section}>
        <Ionicons name="location-outline" size={20} color={colors.primary} />
        <Text style={styles.sectionText}>
          {recipient.city && recipient.country
            ? `${recipient.city}, ${recipient.country}`
            : 'Location not specified'}
        </Text>
      </View>

      <View style={styles.section}>
        <Ionicons name="language-outline" size={20} color={colors.primary} />
        <Text style={styles.sectionText}>
          {recipient.language || 'Language not specified'}
        </Text>
      </View>

      <View style={styles.section}>
        <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
        <Text style={styles.sectionText}>
          Skill Points: {recipient.skillPoints || 0}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 16,
    color: '#666',
  },
  avatar: {
    backgroundColor: colors.primary,
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLabel: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  info: {
    alignItems: 'center',
    marginBottom: 30,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    elevation: 1,
  },
  sectionText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#555',
  },
});

ChatInfo.propTypes = {
  route: PropTypes.object.isRequired,
};

export default ChatInfo;
