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


import React, { useState } from "react";

import Background from "../components/Layout/Background";
import Logo from "../components/Branding/Logo";
import Header from "../components/Layout/Header";
import Button from "../components/UI/Button";
import TextInput from "../components/UI/TextInput";
import BackButton from "../components/Navigation/BackButton";
import { emailValidator } from "../helpers/emailValidator";

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState({ value: "", error: "" });

  const sendResetPasswordEmail = () => {
    const emailError = emailValidator(email.value);
    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }
    navigation.navigate("LoginScreen");
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Reset your password.</Header>
      <TextInput
        label="Email"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        description="You will receive an email with the reset link."
      />
      <Button
        mode="contained"
        onPress={sendResetPasswordEmail}
        style={{ marginTop: 16 }}
      >
        Continue
      </Button>
    </Background>
  );
}
