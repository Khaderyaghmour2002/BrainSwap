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
import ChatScreen from "../screens/ChatScreen";
import ProfileViewScreen from "../screens/ProfileViewScreen";



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
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ProfileViewScreen" component={ProfileViewScreen} />

    </Stack.Navigator>
  );
}
