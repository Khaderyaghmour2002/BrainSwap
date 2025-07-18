import React from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity } from 'react-native';

export default function IncomingCallModal({ visible, caller, type, onAccept, onDecline }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Image source={{ uri: caller.photoUrl }} style={styles.avatar} />
          <Text style={styles.name}>{caller.name}</Text>
          <Text style={styles.callType}>{type === 'video' ? 'Video Call' : 'Voice Call'}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#28a745' }]} onPress={onAccept}>
              <Text style={styles.btnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#dc3545' }]} onPress={onDecline}>
              <Text style={styles.btnText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    width: 300, backgroundColor: 'white', borderRadius: 10, padding: 20, alignItems: 'center',
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: 'bold' },
  callType: { fontSize: 16, marginBottom: 20 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: {
    flex: 1, padding: 10, marginHorizontal: 5, borderRadius: 6, alignItems: 'center',
  },
  btnText: { color: 'white', fontWeight: 'bold' },
});
