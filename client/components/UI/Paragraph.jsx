import React from "react";
import { Text } from "react-native-paper";
import styles from "./Paragraph.styles";

export default function Paragraph(props) {
  return <Text style={styles.text} {...props} />;
}
