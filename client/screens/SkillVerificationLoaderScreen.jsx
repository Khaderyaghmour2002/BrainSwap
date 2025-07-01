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
    console.log("🟡 [Loader] Started quiz generation for skill:", skill);

    try {
      console.log("🟢 [Loader] Sending request to backend...");

      const response = await axios.post("http:// 192.168.136.1:8000/api/generate-quiz", {
        skill,
      }, {
        timeout: 20000,
      });

      console.log("✅ [Loader] Received response from backend:", response.data);

      const questionObj = response.data.question;

      if (!questionObj || !questionObj.question || !questionObj.options) {
        throw new Error("Invalid quiz format.");
      }

      console.log("📦 [Loader] Storing question in AsyncStorage...");

      await AsyncStorage.setItem(`quiz_${skill}`, JSON.stringify([questionObj]));

      console.log("🚀 [Loader] Navigating to SkillVerificationScreen...");
      navigation.replace("SkillVerificationScreen", { skill });

    } catch (err) {
      console.error("❌ [Loader] Failed to generate quiz:", err);
      Alert.alert("Error", "Failed to generate quiz. Please try again later.");
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
