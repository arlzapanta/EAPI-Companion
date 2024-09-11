import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { RadioButton } from "react-native-paper";
import Icon from "react-native-vector-icons/Ionicons";
import DetailerModal from "../modals/DetailerModal";
import * as ImagePicker from "expo-image-picker";

import {
  savePreCallNotesLocalDb,
  savePostCallNotesLocalDb,
  getPreCallNotesLocalDb,
  getPostCallNotesLocalDb,
} from "../utils/callComponentsUtil";

import { fetchDetailerImages } from "../utils/localDbUtils";
import { customToast } from "../utils/customToast";
import { uploadImage } from "../utils/uploadImages";
import * as ImageManipulator from "expo-image-manipulator";

interface CallComponentsProps {
  scheduleId: string;
}

const CallComponents: React.FC<CallComponentsProps> = ({ scheduleId }) => {
  const [note, setNote] = useState<string>("");
  const [notes, setNotes] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>("cold");
  const [feedback, setFeedback] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedDetailer, setSelectedDetailer] = useState<number | null>(null);

  useEffect(() => {
    const fetchPreCallNotes = async () => {
      const fetchedNotes = await getPreCallNotesLocalDb(scheduleId);
      setNotes(fetchedNotes.map((note) => note.notesArray).flat());
    };

    fetchPreCallNotes();
  }, [scheduleId]);

  const addNote = () => {
    if (note.trim()) {
      setNotes([...notes, note]);
      setNote("");
    }
  };

  const removeNote = (index: number) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to remove this note?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            const updatedNotes = notes.filter((_, i) => i !== index);
            setNotes(updatedNotes);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const savePreCallNotes = async () => {
    await savePreCallNotesLocalDb({ notesArray: notes, scheduleId });
    customToast("Notes saved");
  };

  const savePostCallNotes = async () => {
    await savePostCallNotesLocalDb({
      mood: selectedMood,
      feedback,
      scheduleId,
    });
  };

  const openModal = (detailerNumber: number) => {
    setSelectedDetailer(detailerNumber);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDetailer(null);
  };

  const [base64Image, setBase64Image] = useState<string[]>([]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // This allows multiple selections
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      // Process each selected image
      const imageUris = result.assets.map((asset) => asset.uri);
      const base64Images = await Promise.all(
        imageUris.map(async (uri) => {
          const manipulatedImage = await processImage(uri);
          return handleImageSelection(manipulatedImage.uri);
        })
      );
      setBase64Image(base64Images);
    }
  };

  const processImage = async (uri: string) => {
    const { uri: manipulatedUri } = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    return { uri: manipulatedUri };
  };

  const handleImageSelection = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  const handleUploadImages = async () => {
    if (base64Image.length > 0) {
      await uploadImage({
        base64Images: base64Image,
        category: "category1",
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Notes</Text>
        </View>

        <View style={styles.noteInputContainer}>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Enter note"
            placeholderTextColor={styles.placeholder.color}
          />

          <TouchableOpacity onPress={addNote}>
            <Icon style={styles.addNotesBtn} name="add" />
          </TouchableOpacity>
        </View>

        {notes.map((item, index) => (
          <View key={index} style={styles.noteItem}>
            <Text
              style={styles.noteText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item}
            </Text>
            <TouchableOpacity onPress={() => removeNote(index)}>
              <Icon style={styles.removeText} name="close-circle-outline" />
            </TouchableOpacity>
          </View>
        ))}

        {notes.length > 0 && (
          <TouchableOpacity
            style={styles.buttonSave}
            onPress={savePreCallNotes}>
            <Icon
              name="bookmark-outline"
              size={20}
              color="#fff"
              style={styles.iconSave}
            />
            <Text style={styles.buttonTextSave}>Save</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>View Detailers</Text>
        </View>
        <View style={styles.detailerButtonsContainer}>
          <TouchableOpacity
            style={styles.detailerButton}
            onPress={() => openModal(1)}>
            <Text style={styles.detailerButtonText}>Detailer 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailerButton}
            onPress={() => openModal(2)}>
            <Text style={styles.detailerButtonText}>Detailer 2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.detailerButton}
            onPress={() => openModal(3)}>
            <Text style={styles.detailerButtonText}>Detailer 3</Text>
          </TouchableOpacity>
        </View>
        {selectedDetailer !== null && (
          <DetailerModal
            isVisible={modalVisible}
            onClose={closeModal}
            detailerNumber={selectedDetailer}
          />
        )}
      </View>

      <Button title="Select Images (FOR TESTING ONLY) " onPress={pickImages} />
      <Button
        title="Upload Image (FOR TESTING ONLY) "
        onPress={handleUploadImages}
      />
      {/* <Button
        title="Upload (for testing only)"
        color="#FFA500" // Orange color for warning
        onPress={handleUploadImages}
      /> */}
      {/* Uncomment and use this section for post-call notes */}
      {/* <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>Post Call Notes</Text>
          <Button
            title="Save Post-Call Notes"
            onPress={savePostCallNotes}
            color="#007bff"
          />
        </View>
        <Text style={styles.label}>Mood:</Text>
        <View style={styles.radioGroup}>
          {["cold", "warm", "hot"].map((mood) => (
            <View key={mood} style={styles.radioButtonContainer}>
              <RadioButton
                value={mood}
                status={selectedMood === mood ? "checked" : "unchecked"}
                onPress={() => setSelectedMood(mood)}
              />
              <Text>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
            </View>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={feedback}
          onChangeText={setFeedback}
          placeholder="Enter feedback"
        />
        <Button
          title="Save Post-Call Notes"
          onPress={savePostCallNotes}
          color="#007bff"
        />
      </View> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  cardContainer: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  headerContainer: {
    marginBottom: 15,
  },
  noteInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginRight: 10,
  },
  placeholder: {
    color: "#aaa",
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "center",
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
    flex: 1,
    fontSize: 16,
    color: "#333",
    flexShrink: 1,
    marginRight: 10,
  },
  removeText: {
    color: "#d9534f",
    fontSize: 20,
  },
  addNotesBtn: {
    backgroundColor: "#046E37",
    color: "#fff",
    fontSize: 24,
    padding: 10,
    borderRadius: 25,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  radioGroup: {
    flexDirection: "row",
    marginVertical: 10,
  },
  radioButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  buttonSave: {
    marginTop: 10,
    backgroundColor: "#046E37",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextSave: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  iconSave: {
    marginRight: 10,
  },
  detailerButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailerButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  detailerButtonText: {
    fontSize: 16,
    color: "#046E37",
  },
});

export default CallComponents;
