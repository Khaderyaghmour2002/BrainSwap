import React from "react";
import { Image } from "react-native";
import styles from "./Logo.styles";

export default function Logo() {
  return <Image source={require("../../assets/items/logo.png")} style={styles.image} />;
}
