import React from "react";
import { TouchableOpacity, Image } from "react-native";
import styles from "./BackButton.styles";

export default function BackButton({ goBack }) {
  return (
    <TouchableOpacity onPress={goBack} style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/items/back.png")}
      />
    </TouchableOpacity>
  );
}
