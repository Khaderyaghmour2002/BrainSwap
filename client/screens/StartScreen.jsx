import React from "react";
import { StyleSheet, View } from "react-native";
import Background from "../components/Layout/Background";
import Logo from "../components/Branding/Logo";
import Header from "../components/Layout/Header";
import Button from "../components/UI/Button";
import { theme } from "../core/theme";
import Paragraph from "../components/UI/Paragraph";


export default function StartScreen({ navigation }) {
  return (
    <Background>
      <Logo />
      <Header>Welcome to BrainSwap</Header>
      <Paragraph style={styles.paragraph}>
        A platform where you can exchange skills with others! Whether you're
        looking to teach or learn, connect with people across the globe.
      </Paragraph>
      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("LoginScreen")}
          style={styles.button}
        >
          Log in
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate("RegisterScreen")}
          style={styles.button}
        >
          Create an account
        </Button>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  Paragraph: {
    marginBottom: 24,
    textAlign: "center",
    color: theme.colors.text,
  },
  buttonsContainer: {
    width: "100%",
    marginTop: 20,
  },
  button: {
    marginBottom: 12,
  },
});
