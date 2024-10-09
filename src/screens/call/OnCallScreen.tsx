import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Button,
  ScrollView,
  Image,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";
import { RootStackParamList } from "../../type/navigation";
import { savePostCallNotesLocalDb } from "../../utils/callComponentsUtil";
import { saveCallsDoneFromSchedules } from "../../utils/localDbUtils";
import Detailers from "../modals/DetailersOnCallModal";
import { formatTimeHoursMinutes } from "../../utils/dateUtils";
import SignatureCapture from "../../components/SignatureCapture";
import { useImagePicker } from "../../hook/useImagePicker";
import { getLocation } from "../../utils/currentLocation";
import { useRefreshFetchDataContext } from "../../context/RefreshFetchDataContext";

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
  const { refreshSchedData } = useRefreshFetchDataContext();
  const { scheduleIdValue, notesArray, docName } = route.params;
  const [timer, setTimer] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [isModalVisible, setModalVisible] = useState(false);
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const [callStartTime, setCallStartTime] = useState<string>("");
  const [callEndTime, setCallEndTime] = useState<string>("");
  const [signatureValue, setSignatureValue] = useState<string>("");
  const [signatureAttempts, setSignatureAttempts] = useState<number>(0);
  const [signatureLocation, setSignatureLocation] = useState<string>("");
  const [photoValue, setPhotoValue] = useState<string>("");
  const [photoLocation, setPhotoLocation] = useState<string>("");

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const startTimer = () => {
    setCallStartTime(formatTimeHoursMinutes(new Date()));
    const id = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  const [callsData, setCallsData] = useState({});

  const endCall = async () => {
    setCallEndTime(formatTimeHoursMinutes(new Date()));
    stopTimer();
    try {
      await savePostCallNotes();

      const callDetails = {
        schedule_id: scheduleIdValue,
        call_start: callStartTime,
        call_end: formatTimeHoursMinutes(new Date()),
        signature: signatureValue,
        signature_attempts: signatureAttempts.toString(),
        signature_location: signatureLocation,
        photo: photoValue,
        photo_location: photoLocation,
        doctor_name: docName,
      };

      setCallsData(callDetails); // This sets the callDetails to your state

      const result = await saveCallsDoneFromSchedules(
        scheduleIdValue,
        callDetails
      );

      if (result === "Success") {
        navigation.navigate("Home");
        if (refreshSchedData) {
          refreshSchedData();
        }
      }
    } catch (error: any) {
      console.log("ERROR > endCall > OnCallScreen:", error);
    }
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

  const handlePhotoCaptured = async (
    base64: string,
    location: { latitude: number; longitude: number }
  ) => {
    try {
      setPhotoValue(base64);
      setPhotoLocation(JSON.stringify(location));
    } catch (error) {
      console.log("handlePhotoCaptured error", error);
    }
  };

  const { imageBase64, location, handleImagePicker } = useImagePicker({
    onPhotoCaptured: handlePhotoCaptured,
  });

  const handleSignatureUpdate = async (base64Signature: string) => {
    setSignatureValue(base64Signature);
    const loc = await getLocation();
    setSignatureLocation(JSON.stringify(loc));
  };

  const handleSignatureClear = () => {
    setSignatureAttempts((prevAttempts) => prevAttempts + 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
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
        <TouchableOpacity onPress={openModal} style={styles.openModalButton}>
          <Text style={styles.buttonText}>START DETAILERS</Text>
        </TouchableOpacity>

        {/* Render DetailerModal and pass isVisible and onClose */}
        <Detailers isVisible={isModalVisible} onClose={closeModal} />
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.centerItems}>
          <Text style={styles.signatureLabel}>Signature Capture</Text>
          {signatureValue ? (
            <Image
              source={{ uri: `${signatureValue}` }}
              style={styles.signImage}
            />
          ) : (
            <SignatureCapture
              callId={12340000}
              onSignatureUpdate={handleSignatureUpdate}
            />
          )}
          {!imageBase64 ? (
            <TouchableOpacity
              style={styles.takePhotoButton}
              onPress={handleImagePicker}>
              <Text style={styles.buttonText}>Take a photo</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageContainer}>
              <Text style={styles.signatureLabel}>Photo Capture</Text>
              <Image
                source={{ uri: `data:image/png;base64,${imageBase64}` }}
                style={styles.image}
              />
            </View>
          )}
        </View>
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
  scrollViewContentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    padding: 20,
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  centerItems: {
    alignItems: "center",
    justifyContent: "center",
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
    position: "static",
    // position: "absolute",
    // bottom: 20,
    // right: 20,
    backgroundColor: "#ff4d4d",
    borderRadius: 30,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 9999,
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
  openModalButton: {
    backgroundColor: "red",
    color: "white",
    padding: 30,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  takePhotoButton: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    width: 200,
    alignItems: "center",
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  image: {
    width: 400,
    height: 260,
    marginTop: 10,
    resizeMode: "contain",
  },
  signImage: {
    marginVertical: 15,
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
});

export default OnCallScreen;
