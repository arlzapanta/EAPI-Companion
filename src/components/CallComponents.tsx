import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { RadioButton } from "react-native-paper";

import {
  savePreCallNotesLocalDb,
  savePostCallNotesLocalDb,
} from "../utils/callComponentsUtil";

interface CallComponentsProps {
  scheduleId: string;
}

const CallComponents: React.FC<CallComponentsProps> = ({ scheduleId }) => {
  const [note, setNote] = useState<string>("");
  const [notes, setNotes] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>("cold");
  const [feedback, setFeedback] = useState<string>("");

  const addNote = () => {
    if (note.trim()) {
      setNotes([...notes, note]);
      setNote("");
    }
  };

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  const savePreCallNotes = async () => {
    await savePreCallNotesLocalDb({ notesArray: notes, scheduleId });
  };

  const savePostCallNotes = async () => {
    await savePostCallNotesLocalDb({
      mood: selectedMood,
      feedback,
      scheduleId,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Pre-Call Notes</Text>
        <Button
          title="Save Pre-Call Notes"
          onPress={savePreCallNotes}
          color="#007bff"
        />
      </View>

      <View style={styles.noteInputContainer}>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Enter note"
        />
        <Button title="Add Note" onPress={addNote} color="#007bff" />
      </View>

      {notes.map((item, index) => (
        <View key={index} style={styles.noteItem}>
          <Text>{item}</Text>
          <TouchableOpacity onPress={() => removeNote(index)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* <Text style={styles.sectionTitle}>Post Call Notes</Text>
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
      <Button
        title="Save Post-Call Notes"
        onPress={savePostCallNotes}
        color="#007bff"
      /> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  noteInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginRight: 10,
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
});

export default CallComponents;
