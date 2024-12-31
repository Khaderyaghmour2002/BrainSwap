import React from "react";
import { StyleSheet, View } from "react-native";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";
import { theme } from "../core/theme";

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
  paragraph: {
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
