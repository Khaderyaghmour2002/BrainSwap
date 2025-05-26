// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   PermissionsAndroid,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import RtcEngine, {
//   ChannelProfile,
//   ClientRole,
// } from 'react-native-agora';
// import { FirebaseAuth } from '../../server/firebaseConfig';
// import { colors } from '../assets/constants';

// const APP_ID = '14b09c0676c0428ea53b39a58f171293'; // ✅ Your Agora App ID

// const VoiceCallScreen = ({ route, navigation }) => {
//   const { user } = route.params; // recipient user
//   const channelName = [FirebaseAuth.currentUser.uid, user.id].sort().join('_');
//   const engineRef = useRef(null);

//   const [joined, setJoined] = useState(false);
//   const [micOn, setMicOn] = useState(true);

//   useEffect(() => {
//     const init = async () => {
//       if (Platform.OS === 'android') {
//         await PermissionsAndroid.requestMultiple([
//           PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         ]);
//       }

//       const engine = await RtcEngine.create(APP_ID);
//       engineRef.current = engine;

//       await engine.setChannelProfile(ChannelProfile.Communication);
//       await engine.setClientRole(ClientRole.Broadcaster);

//       engine.addListener('JoinChannelSuccess', () => {
//         setJoined(true);
//       });

//       engine.addListener('UserOffline', () => {
//         navigation.goBack();
//       });

//       await engine.joinChannel(null, channelName, null, 0);
//     };

//     init();

//     return () => {
//       if (engineRef.current) {
//         engineRef.current.leaveChannel();
//         engineRef.current.destroy();
//       }
//     };
//   }, []);

//   const toggleMicrophone = async () => {
//     if (engineRef.current) {
//       await engineRef.current.enableLocalAudio(!micOn);
//       setMicOn(!micOn);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.nameText}>{user.firstName}</Text>
//       <Text style={styles.callStatus}>{joined ? 'In Call' : 'Calling...'}</Text>

//       <View style={styles.controls}>
//         <TouchableOpacity style={styles.iconButton} onPress={toggleMicrophone}>
//           <Ionicons
//             name={micOn ? 'mic' : 'mic-off'}
//             size={32}
//             color={micOn ? '#fff' : '#f33'}
//           />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.iconButton, { backgroundColor: '#f44336' }]}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="call" size={32} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default VoiceCallScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   nameText: {
//     fontSize: 28,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   callStatus: {
//     fontSize: 16,
//     color: '#eee',
//     marginTop: 10,
//   },
//   controls: {
//     flexDirection: 'row',
//     gap: 40,
//     marginTop: 40,
//   },
//   iconButton: {
//     backgroundColor: '#333',
//     padding: 20,
//     borderRadius: 50,
//   },
// });



import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function WelcomeScreen({ navigation }) {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const currentUser = FirebaseAuth.currentUser;

        if (currentUser) {
          const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.firstName || "User");
          } else {
            console.error("No user data found in Firestore.");
            setUserName("User");
          }
        } else {
          console.error("No user is logged in.");
          setUserName("User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName("User");
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>Nice to meet you, {userName}!</Text>
      <Text style={styles.descriptionText}>
        You must be excited to start practicing and learning skills with others
        on our platform.
      </Text>
      <Text style={styles.descriptionText}>
        We have a few questions to help you find the right people in our large
        community.
      </Text>

      <TouchableOpacity
        style={styles.letsGoButton}
        onPress={() => navigation.navigate("LanguagePickerScreen")}
      >
        <Text style={styles.letsGoText}>LET'S GO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  letsGoButton: {
    marginTop: 20,
    backgroundColor: "#00BFFF",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    alignItems: "center",
  },
  letsGoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
