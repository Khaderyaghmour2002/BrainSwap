import React from "react";
import { View, Text } from "react-native";
import { TextInput as PaperInput } from "react-native-paper";
import styles from "./TextInput.styles";

export default function TextInput({ errorText, description, ...props }) {
  return (
    <View style={styles.container}>
      <PaperInput
        style={styles.input}
        selectionColor="#6200ee"
        underlineColor="transparent"
        mode="outlined"
        {...props}
      />
      {description && !errorText ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
}
