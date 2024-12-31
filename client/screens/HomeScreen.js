import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Paragraph from "../components/Paragraph";
import Button from "../components/Button";
import { theme } from "../core/theme";

export default function HomeScreen({ navigation }) {
  return (
    <Background>
      <View style={styles.container}>
        <Logo />
        <Header>Welcome to the Future! 💫</Header>
        <Paragraph style={styles.text}>
          You’ve just unlocked a world of knowledge and skills. It’s time to
          start learning and exchanging!
        </Paragraph>
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("SkillMatchScreen")}
            style={styles.button}
          >
            Start Exchanging Skills
          </Button>
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    textAlign: "center",
    fontSize: 16,
    color: theme.colors.secondary,
    marginBottom: 40,
  },
  actions: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    marginBottom: 16,
    width: "%",
  },
  signOutButton: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
});
