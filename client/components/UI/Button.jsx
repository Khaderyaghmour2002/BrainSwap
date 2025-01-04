import React from "react";
import { Button as PaperButton } from "react-native-paper";
import styles from "./Button.styles";

export default function Button({ mode, style, ...props }) {
  return (
    <PaperButton
      style={[styles.button, mode === "outlined" && styles.outlined, style]}
      labelStyle={styles.text}
      mode={mode}
      {...props}
    />
  );
}
