import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function SkillVerificationScreen({ route, navigation }) {
  const { skill } = route.params || {};
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!skill) {
      Alert.alert("Error", "No skill provided.");
      navigation.goBack();
      return;
    }

    const loadQuestions = async () => {
      try {
        const stored = await AsyncStorage.getItem(`quiz_${skill}`);
        if (!stored) throw new Error("No quiz found.");

        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setQuestions(parsed);
        } else {
          throw new Error("Invalid quiz format.");
        }
      } catch (err) {
        console.error("Failed to load quiz:", err);
        Alert.alert("Error", "Could not load quiz. Please try again.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      startTimer();
    }
    return () => clearInterval(timerRef.current);
  }, [currentIndex, questions]);

  const startTimer = () => {
    setTimeLeft(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timerRef.current);
          handleAnswer(null); // No answer selected
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (option) => {
    clearInterval(timerRef.current);
    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion?.answer;

    if (option === null) {
      Alert.alert("Time's Up", "⏱ You didn't select an answer in time.");
    }

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setSelectedOption(option);

    setTimeout(async () => {
      setSelectedOption(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        const finalScore = isCorrect ? correctAnswers + 1 : correctAnswers;
        const isSkillVerified = finalScore >= 4;

        if (isSkillVerified) {
          try {
            const currentUser = FirebaseAuth.currentUser;
            const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              const updatedSkills = userData.skillsToTeach.map((skillObj) => {
                if (skillObj.name === skill) {
                  return { ...skillObj, verified: true };
                }
                return skillObj;
              });

              await updateDoc(userDocRef, {
                skillsToTeach: updatedSkills,
              });

              Alert.alert(
                "🎉 Verified!",
                `You answered ${finalScore} out of ${questions.length} correctly.\nYour skill has been verified!`,
                [{ text: "Done", onPress: () => navigation.goBack() }]
              );
            }
          } catch (error) {
            console.error("Error verifying skill:", error);
            Alert.alert("Error", "Could not update skill verification. Please try again.");
          }
        } else {
          Alert.alert(
            "Not Verified",
            `You answered ${finalScore} out of ${questions.length}.\nTry again to verify the skill.`,
            [{ text: "Done", onPress: () => navigation.goBack() }]
          );
        }
      }
    }, 1000);
  };

  if (loading || questions.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="help-circle-outline" size={28} color="#6a11cb" />
        <Text style={styles.title}>Verify Skill: {skill}</Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <Text style={[styles.timer, timeLeft <= 10 && { color: "#d32f2f" }]}>
          ⏱ {timeLeft}s
        </Text>
      </View>

      <Text style={styles.questionText}>{currentQuestion.question}</Text>

      {currentQuestion.options.map((option, index) => {
        const isSelected = selectedOption === option;
        const isCorrect = selectedOption && option === currentQuestion.answer;
        const isWrong = selectedOption === option && !isCorrect;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              isSelected && styles.selectedOption,
              isCorrect && styles.correctOption,
              isWrong && styles.wrongOption,
            ]}
            onPress={() => handleAnswer(option)}
            disabled={!!selectedOption}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: "#f2f6ff",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
    color: "#3a3a3a",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: "#5c5c5c",
  },
  timer: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#43a047",
  },
  questionText: {
    fontSize: 18,
    marginVertical: 20,
    color: "#212121",
    fontWeight: "500",
  },
  optionButton: {
    padding: 14,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    elevation: 1,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOption: {
    backgroundColor: "#e1f5fe",
    borderColor: "#0288d1",
  },
  correctOption: {
    backgroundColor: "#c8e6c9",
    borderColor: "#388e3c",
  },
  wrongOption: {
    backgroundColor: "#ffcdd2",
    borderColor: "#d32f2f",
  },
});
