import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import { RadioButton } from "react-native-paper";
import * as SQLite from "expo-sqlite";

const savePreCallNotesLocalDb = async ({
  notesArray,
  scheduleId,
}: PreCallNotesParams): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("cmms", {
      useNewConnection: true,
    });

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS pre_call_notes_tbl (
        id INTEGER PRIMARY KEY NOT NULL, 
        notes TEXT NOT NULL, 
        schedule_id TEXT NOT NULL, 
        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const notesJson = JSON.stringify(notesArray);

    await db.runAsync(
      `INSERT INTO pre_call_notes_tbl (notes, schedule_id) VALUES (?,?)`,
      notesJson,
      scheduleId
    );

    const testRecords = await db.getAllAsync(
      "SELECT * FROM pre_call_notes_tbl "
    );
    console.log("All records:", testRecords);

    db.closeSync();
  } catch (error) {
    console.error("Error saving pre-call notes:", error);
  }
};

// Function to save post call notes
const savePostCallNotesLocalDb = async ({
  mood,
  feedback,
  scheduleId,
}: PostCallNotesParams): Promise<void> => {
  try {
    const db = await SQLite.openDatabaseAsync("cmms", {
      useNewConnection: true,
    });

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS post_call_notes_tbl (
        id INTEGER PRIMARY KEY NOT NULL, 
        mood TEXT NOT NULL, 
        feedback TEXT NOT NULL, 
        schedule_id TEXT NOT NULL, 
        date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.runAsync(
      `INSERT INTO post_call_notes_tbl (mood, feedback, schedule_id) VALUES (?,?,?)`,
      mood,
      feedback,
      scheduleId
    );

    const testRecords = await db.getAllAsync(
      "SELECT * FROM post_call_notes_tbl "
    );
    console.log("All post-call records:", testRecords);

    db.closeSync();
  } catch (error) {
    console.error("Error saving post-call notes:", error);
  }
};

// Define the interface for pre-call notes params
interface PreCallNotesParams {
  notesArray: string[];
  scheduleId: string;
}

// Define the interface for post-call notes params
interface PostCallNotesParams {
  mood: string;
  feedback: string;
  scheduleId: string;
}

// Define a type for the detail types
type DetailType = "MAIN DETAIL" | "SECONDARY DETAIL" | "SPECIALTY DETAIL";

// Update the state and images to use the DetailType type
const Test = () => {
  // State for pre-call notes
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const scheduleId = "schedule-id-123"; // Hardcoded schedule ID for this example

  // State for post-call notes
  const [selectedMood, setSelectedMood] = useState<string>("cold");
  const [feedback, setFeedback] = useState("");

  // State for view details and modals
  const [selectedDetail, setSelectedDetail] = useState<DetailType | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Sample base64 images
  const images: Record<DetailType, string[]> = {
    "MAIN DETAIL": [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/BRfPl8AAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/BRfPl8AAAAASUVORK5CYII=",
    ],
    "SECONDARY DETAIL": [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/BRfPl8AAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/BRfPl8AAAAASUVORK5CYII=",
    ],
    "SPECIALTY DETAIL": [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/BRfPl8AAAAASUVORK5CYII=",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/BRfPl8AAAAASUVORK5CYII=",
    ],
  };

  // Add note to pre-call notes
  const addNote = () => {
    if (note.trim()) {
      setNotes([...notes, note]);
      setNote(""); // Clear the input field
    }
  };

  // Remove note from pre-call notes
  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  // Save pre-call notes
  const savePreCallNotes = async () => {
    await savePreCallNotesLocalDb({ notesArray: notes, scheduleId });
  };

  // Save post-call notes
  const savePostCallNotes = async () => {
    await savePostCallNotesLocalDb({
      mood: selectedMood,
      feedback,
      scheduleId,
    });
  };

  // Function to handle button press and show modal
  const showDetailModal = (detailType: DetailType) => {
    setSelectedDetail(detailType);
    setModalVisible(true);
  };

  // Function to render images in modal
  const renderImages = () => {
    if (selectedDetail && images[selectedDetail]) {
      return images[selectedDetail].map((imageUri, index) => (
        <Image key={index} source={{ uri: imageUri }} style={styles.image} />
      ));
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Pre-call Notes Section */}
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="Enter note"
      />
      <Button title="Add Note" onPress={addNote} />
      <FlatList
        data={notes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.noteItem}>
            <Text>{item}</Text>
            <TouchableOpacity onPress={() => removeNote(index)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Button title="Save Pre-Call Notes" onPress={savePreCallNotes} />

      {/* Post-call Notes Section */}
      <Text style={styles.sectionTitle}>Post Call Notes</Text>
      <Text>Mood:</Text>
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
      <Button title="Save Post-Call Notes" onPress={savePostCallNotes} />

      {/* View Detailers Section */}
      <Text style={styles.sectionTitle}>VIEW DETAILERS</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="MAIN DETAIL"
          onPress={() => showDetailModal("MAIN DETAIL")}
        />
        <Button
          title="SECONDARY DETAIL"
          onPress={() => showDetailModal("SECONDARY DETAIL")}
        />
        <Button
          title="SPECIALTY DETAIL"
          onPress={() => showDetailModal("SPECIALTY DETAIL")}
        />
      </View>
      {selectedDetail && (
        <Text style={styles.selectedDetail}>
          Selected Detail: {selectedDetail}
        </Text>
      )}

      {/* Modal for displaying images */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {renderImages()}
          </ScrollView>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  noteItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  removeText: {
    color: "red",
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
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
  buttonContainer: {
    marginVertical: 20,
  },
  selectedDetail: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
});

export default Test;
