import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, PermissionsAndroid,
} from 'react-native';
import {
  HMSSDK,
  HMSUpdateListenerActions,
} from '@100mslive/react-native-hms';
import { FirebaseAuth } from '../../server/firebaseConfig';
import { getHmsAuthToken } from '../../server/hmsToken';

export default function VoiceCallScreen({ route, navigation }) {
  const { roomId, isCaller } = route.params;
  const sdkRef = useRef(null);
  const [peers, setPeers] = useState([]);
  const [localAudioOn, setLocalAudioOn] = useState(true);
  const [joining, setJoining] = useState(false);

  const ensurePermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };

  const doJoin = useCallback(async () => {
    const fbUser = FirebaseAuth.currentUser;
    if (!fbUser) {
      console.log('No Firebase user yet – will retry via auth listener');
      return;
    }

    setJoining(true);
    await ensurePermissions();

    sdkRef.current = await HMSSDK.build();

    const userName =
      (fbUser.displayName && fbUser.displayName.trim()) ||
      (fbUser.email && fbUser.email.split('@')[0]) ||
      ('User_' + fbUser.uid.slice(0, 6));

    const token = await getHmsAuthToken({
      roomId,
      role: isCaller ? 'host' : 'guest',
    });

    console.log('Join payload:', { userName, hasToken: !!token, roomId });

    try {
      await sdkRef.current.join({
        authToken: token,
        userName,
        localAudioEnabled: true,
        localVideoEnabled: false, // ✅ Video off for voice calls
      });
      console.log('JOIN SUCCEEDED (VOICE)');
    } catch (e) {
      console.log('JOIN FAILED', e);
      alert(e?.description || e?.message || 'Join failed');
      navigation.goBack();
    } finally {
      setJoining(false);
    }

    const updatePeers = ({ peers }) => setPeers([...peers]);

    sdkRef.current.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, updatePeers);
    sdkRef.current.addEventListener(HMSUpdateListenerActions.ON_TRACK_UPDATE, updatePeers);
    sdkRef.current.addEventListener(HMSUpdateListenerActions.ON_ERROR, e =>
      console.log('HMS ERROR', e)
    );
  }, [roomId, isCaller, navigation]);

  useEffect(() => {
    const unsubscribe = FirebaseAuth.onAuthStateChanged(u => {
      if (u && !sdkRef.current) {
        doJoin();
      }
    });
    return unsubscribe;
  }, [doJoin]);

  useEffect(() => {
    return () => {
      (async () => {
        try {
          await sdkRef.current?.leave();
          await sdkRef.current?.destroy();
        } catch {}
      })();
    };
  }, []);
  const toggleAudio = async () => {
    if (!sdkRef.current) return;
    await sdkRef.current.setLocalAudioEnabled(!localAudioOn);
    setLocalAudioOn(prev => !prev);
  };


  const endCall = async () => {
    try {
      await sdkRef.current?.leave();
    } finally {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Voice Call</Text>
      {joining ? (
        <Text style={styles.status}>Joining...</Text>
      ) : peers.length === 0 ? (
        <Text style={styles.status}>Waiting for others to join...</Text>
      ) : (
        peers.map(peer => (
          <Text key={peer.peerID} style={styles.peerText}>
            {peer.name || 'Unknown user'}
          </Text>
        ))
      )}

      <View style={styles.controls}>
        <Button label={localAudioOn ? 'Mute' : 'Unmute'} onPress={toggleAudio} />
        <Button label="Leave" danger onPress={endCall} />
      </View>
    </View>
  );
}

function Button({ label, onPress, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.btn, danger && { backgroundColor: '#d9534f' }]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  heading: { fontSize: 24, color: '#fff', marginBottom: 20 },
  status: { color: '#aaa', marginBottom: 30 },
  peerText: { color: '#fff', fontSize: 18, marginVertical: 5 },
  controls: { flexDirection: 'row', marginTop: 30 },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  btnText: { color: '#fff', fontSize: 16 },
});
