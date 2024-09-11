import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  ScrollView,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";
import { RootStackParamList } from "../../type/navigation";
import { savePostCallNotesLocalDb } from "../../utils/callComponentsUtil";

type OnCallScreenRouteProp = RouteProp<RootStackParamList, "OnCall">;
type OnCallScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "OnCall"
>;

interface Props {
  route: OnCallScreenRouteProp;
  navigation: OnCallScreenNavigationProp;
}

const OnCallScreen: React.FC<Props> = ({ route, navigation }) => {
  const { startCallTime, scheduleIdValue, notesArray } = route.params;
  const [timer, setTimer] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const startTimer = () => {
    const id = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  const endCall = () => {
    stopTimer();
    // Remove schedule in schedules_api_tbl
    // Add calls_tbl
    // Refresh setScheduleData in schedule screen
    navigation.navigate("Home");
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")} : ${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const savePostCallNotes = async () => {
    await savePostCallNotesLocalDb({
      mood: selectedMood,
      feedback,
      scheduleId: scheduleIdValue,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.timerText}>{formatTime(timer)}</Text>

      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>Notes</Text>
        {notesArray.map((item, index) => (
          <View key={index} style={styles.noteItem}>
            <Text
              style={styles.noteText}
              numberOfLines={2}
              ellipsizeMode="tail">
              {item}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>Post Call</Text>
        <Text>Feedback</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter feedback"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={3}
        />
        <Text style={styles.moodLabel}>Doctor's Mood:</Text>
        <View style={styles.radioGroup}>
          {["cold", "warm", "hot"].map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[
                styles.radioButtonContainer,
                selectedMood === mood && styles.radioButtonSelected,
              ]}
              onPress={() => setSelectedMood(mood)}>
              <Text
                style={[
                  styles.radioButtonText,
                  selectedMood === mood && styles.radioButtonTextSelected,
                ]}>
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={savePostCallNotes}>
          <Text style={styles.saveButtonText}>Save Post-Call Notes</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onLongPress={endCall}
        style={styles.floatingButtonContainer}>
        <View style={styles.floatingButton}>
          <Icon name="exit" size={24} color="#fff" />
          <Text style={styles.buttonText}>End Call</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  timerText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  noteItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  noteText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 20,
  },
  radioButtonContainer: {
    minWidth: 100,
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 10,
  },
  radioButtonSelected: {
    backgroundColor: "#046E37",
    borderColor: "#046E37",
  },
  radioButtonText: {
    color: "#333",
  },
  radioButtonTextSelected: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ff4d4d",
    borderRadius: 30,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
});

export default OnCallScreen;
