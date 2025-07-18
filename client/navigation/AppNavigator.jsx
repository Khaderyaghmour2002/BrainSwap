import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import StartScreen from "../screens/StartScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import ProfileMakerScreen from "../screens/ProfileMakerScreen"; 
import ProfileMakerScreen1 from "../screens/ProfileMakerScreen1"; 
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PhotoUploadScreen from "../screens/PhotoUploadScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import BioScreen from "../screens/BioScreen";
import LanguagePickerScreen from "../screens/LanguagePickerScreen";
import LocationPickerScreen from "../screens/LocationPickerScreen";
import MatchingScreen from "../screens/MatchingScreen";
import ChatsScreen from "../screens/ChatsScreen";
import ChatInfoScreen from "../screens/ChatInfoScreen";
import ProfileViewScreen from "../screens/ProfileViewScreen";
import NewChatScreen from "../screens/NewChatScreen";
import VoiceCallScreen from "../screens/VoiceCallScreen";
import RequestsScreen from "../screens/RequestsScreen";
import EditSkillsScreen from "../screens/EditSkillsScreen";
import SkillVerificationScreen from "../screens/SkillVerificationScreen";
import HomeContentScreen from "../screens/HomeContentScreen";
import SessionCreationScreen from "../screens/SessionCreationScreen";
import ProfileViewScreen1 from "../screens/ProfileViewScreen1";
import SkillVerificationLoaderScreen from "../screens/SkillVerificationLoaderScreen";
import VideoCallScreen from "../screens/VideoCallScreen";
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="StartScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StartScreen" component={StartScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
      <Stack.Screen name="ProfileMakerScreen" component={ProfileMakerScreen} />
      <Stack.Screen name="ProfileMakerScreen1" component={ProfileMakerScreen1} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="PhotoUploadScreen" component={PhotoUploadScreen} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="BioScreen" component={BioScreen} />
      <Stack.Screen name="LanguagePickerScreen" component={LanguagePickerScreen} />
      <Stack.Screen name="LocationPickerScreen" component={LocationPickerScreen} />
      <Stack.Screen name="MatchingScreen" component={MatchingScreen} />
      <Stack.Screen name="ChatsScreen" component={ChatsScreen} />
      <Stack.Screen name="ChatInfoScreen" component={ChatInfoScreen} />
      <Stack.Screen name="ProfileViewScreen" component={ProfileViewScreen} />
      <Stack.Screen name="NewChatScreen" component={NewChatScreen} />
      <Stack.Screen name="VoiceCallScreen" component={VoiceCallScreen} />
      <Stack.Screen name="RequestsScreen" component={RequestsScreen} />
      <Stack.Screen name="EditSkillsScreen" component={EditSkillsScreen} />
     <Stack.Screen name="SkillVerificationScreen" component={SkillVerificationScreen} />
      <Stack.Screen name="HomeContentScreen" component={HomeContentScreen} />
      <Stack.Screen name="SessionCreationScreen" component={SessionCreationScreen} />
      <Stack.Screen name="ProfileViewScreen1" component={ProfileViewScreen1} />
      <Stack.Screen name="SkillVerificationLoaderScreen" component={SkillVerificationLoaderScreen} />
      <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} />
    </Stack.Navigator>
  );
}
