import React from "react";
import { Alert } from "react-native";

import Background from "../components/Layout/Background";
import Logo from "../components/Branding/Logo";
import Header from "../components/Layout/Header";
import Paragraph from "../components/UI/Paragraph";
import Button from "../components/UI/Button";
import { FirebaseAuth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";

export default function HomeScreen({ navigation }) {
  const handleSignOut = async () => {
    try {
      await signOut(FirebaseAuth); // Sign out the current user
      navigation.reset({
        index: 0,
        routes: [navigation.navigate("StartScreen")
        ], // Redirect to StartScreen after successful sign out
      });
    } catch (error) {
      Alert.alert("Sign Out Failed", error.message);
    }
  };

  return (
    <Background>
      <Logo />
      <Header>Welcome 💫</Header>
      <Paragraph>Congratulations! You are logged in.</Paragraph>
      <Button
  mode="outlined"
  onPress={() =>
    navigation.reset({
      index: 0,
      routes: [{ name: "StartScreen" }],
    })
  }
>
  Sign out
</Button>

    </Background>
  );
}
