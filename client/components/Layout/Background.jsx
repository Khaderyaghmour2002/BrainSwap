import React from "react";
import { ImageBackground, KeyboardAvoidingView } from "react-native";
import styles from "./Background.styles";

export default function Background({ children }) {
  return (
    <ImageBackground
      source={require("../../assets/items/dot.png")}
      resizeMode="repeat"
      style={styles.background}
    >
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        {children}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
