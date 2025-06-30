// import React, { useEffect } from "react";
// import { View, Text, ActivityIndicator, Alert } from "react-native";
// import axios from "axios";
// import { useNavigation } from "@react-navigation/native";

// export default function SkillVerificationLoaderScreen({ route }) {
//   const { skill } = route.params;
//   const navigation = useNavigation();

//   useEffect(() => {
//     generateQuestions();
//   }, []);

//   const generateQuestions = async () => {
//     try {
//       const response = await fetch.post("http://127.0.0.1   :3001/api/generate-quiz"
// , {
//         skill,
//       });

//       if (!response.data || !response.data.questions || response.data.questions.length < 5) {
//         throw new Error("Insufficient questions received.");
//       }

//       navigation.replace("SkillVerificationScreen", {
//         skill,
//         questions: response.data.questions,
//       });
//     } catch (err) {
//       console.error("Failed to generate quiz:", err);
//       Alert.alert("Error", "Failed to generate quiz. Please try again later.");
//       navigation.goBack();
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f7fa" }}>
//       <ActivityIndicator size="large" color="#6a11cb" />
//       <Text style={{ marginTop: 10, fontSize: 16, color: "#555" }}>
//         Generating quiz questions for "{skill}"...
//       </Text>
//     </View>
//   );
// }
    