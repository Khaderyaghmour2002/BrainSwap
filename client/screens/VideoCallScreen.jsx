import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, PermissionsAndroid,
} from 'react-native';
import {
  HMSSDK,
  HMSUpdateListenerActions,
  HMSVideoView,
} from '@100mslive/react-native-hms';
import { FirebaseAuth } from '../../server/firebaseConfig';
import { getHmsAuthToken } from '../../server/hmsToken';

export default function VideoCallScreen({ route, navigation }) {
  const { roomId, isCaller } = route.params;
  const sdkRef = useRef(null);
  const [peers, setPeers] = useState([]);
  const [localVideoOn, setLocalVideoOn] = useState(true);
  const [localAudioOn, setLocalAudioOn] = useState(true);
  const [joining, setJoining] = useState(false);

  const ensurePermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
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
        localVideoEnabled: true,
      });
      console.log('JOIN SUCCEEDED');
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

const toggleVideo = async () => {
  if (!sdkRef.current) return;
  await sdkRef.current.setLocalVideoEnabled(!localVideoOn);
  setLocalVideoOn(prev => !prev);
};


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
      <View style={styles.grid}>
        {joining && peers.length === 0 && (
          <View style={[styles.tile, styles.placeholder]}>
            <Text style={styles.placeholderText}>Joining…</Text>
          </View>
        )}
        {!joining && peers.length === 0 && (
          <View style={[styles.tile, styles.placeholder]}>
            <Text style={styles.placeholderText}>No peers yet</Text>
          </View>
        )}
        {peers.map(peer =>
          peer.videoTrack ? (
            <HMSVideoView
              key={peer.peerID}
              trackId={peer.videoTrack}
              mirror={peer.isLocal}
              scaleType="ASPECT_FILL"
              style={styles.tile}
            />
          ) : (
            <View key={peer.peerID} style={[styles.tile, styles.placeholder]}>
              <Text style={styles.placeholderText}>{peer.name?.[0] || '?'}</Text>
            </View>
          )
        )}
      </View>

      <View style={styles.controls}>
        <Button label={localAudioOn ? 'Mute' : 'Unmute'} onPress={toggleAudio} />
        <Button label={localVideoOn ? 'Video Off' : 'Video On'} onPress={toggleVideo} />
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
  container: { flex: 1, backgroundColor: '#000' },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  tile: { width: '50%', aspectRatio: 9 / 16, backgroundColor: '#222' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#aaa' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#111',
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  btnText: { color: '#fff', fontSize: 13 },
});
