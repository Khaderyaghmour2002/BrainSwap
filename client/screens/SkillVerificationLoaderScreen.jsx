import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function SkillVerificationLoaderScreen({ route }) {
  const { skill } = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    generateAndSaveQuestions();
  }, []);

  const generateAndSaveQuestions = async () => {
    try {
      const response = await axios.post(
        "http://172.20.10.13:8000/api/generate-quiz",
        { skill },
        { timeout: 30000 }
      );

      if (!response.data.questions || !Array.isArray(response.data.questions)) {
        throw new Error("Invalid response format from server");
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        `quiz_${skill}`,
        JSON.stringify(response.data.questions)
      );

      // Navigate to the quiz screen
      navigation.replace("SkillVerificationScreen", { skill });

    } catch (err) {
      console.error("❌ Axios error:", err.message || err);
      Alert.alert("Error", "Failed to generate quiz. Please try again.");
      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7fa" }}>
      <ActivityIndicator size="large" color="#6a11cb" />
      <Text style={{ marginTop: 10, fontSize: 16, color: "#555" }}>
        Generating quiz questions for "{skill}"...
      </Text>
    </View>
  );
}
