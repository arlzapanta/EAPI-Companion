import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Button,
} from "react-native";
import moment from "moment";
import { getCurrentDatePH } from "../../utils/dateUtils";
import {
  addQuickCall,
  addQuickCallBottomSheet,
  getQuickCalls,
  removeCallFromLocalDb,
  updateCallNotes,
  updateCallPhoto,
} from "../../utils/quickCallUtil";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import SignatureCapture from "../../components/SignatureCapture";
import { useImagePicker } from "../../hook/useImagePicker";
import { customToast } from "../../utils/customToast";
import { Picker } from "@react-native-picker/picker";
import { getDoctorsWeekSchedLocalDb } from "../../utils/localDbUtils";
import { useDataContext } from "../../context/DataContext";
import Loading from "../../components/Loading";
import { getStyleUtil } from "../../utils/styleUtil";
import SignatureCaptureDisplay from "../../components/SignatureCaptureDisplay";
import { showConfirmAlert } from "../../utils/commonUtil";
import Octicons from "@expo/vector-icons/Octicons";
import { getLocation } from "../../utils/currentLocation";
const dynamicStyles = getStyleUtil({});

const QuickCallBottomSheet: React.FC<QuickCallBottomSheetProps> = ({
  closeSheet,
}) => {
  const [timeOutLoading, setTimeOutLoading] = useState<boolean>(true);
  const { isQuickLoading } = useDataContext();
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeOutLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleAutoAddCall = async () => {
      try {
        const newCall: Call = {
          location: "",
          doctors_id: "",
          photo: "",
          photo_location: "",
          signature: "",
          signature_location: "",
          notes: "",
          id: 0,
          full_name: "",
        };
        const insert = await addQuickCallBottomSheet(newCall);
        if (insert) setSelectedCallIdValue(Number(insert));
      } catch (error) {
        console.log("Error adding new call:", error);
      }
    };

    handleAutoAddCall();
  }, []);

  const handleAddCall = async () => {
    try {
      const newCall: Call = {
        location: "",
        doctors_id: "",
        photo: "",
        photo_location: "",
        signature: "",
        signature_location: "",
        notes: "",
        id: 0,
        full_name: "",
      };
      const insert = await addQuickCallBottomSheet(newCall);
      if (insert) setSelectedCallIdValue(Number(insert));
    } catch (error) {
      console.log("Error adding new call:", error);
    }
  };

  const [currentDate, setCurrentDate] = useState("");
  const [callData, setCallData] = useState<Call[]>([]);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [selectedCallIdValue, setSelectedCallIdValue] = useState<number>(0);

  const handlePhotoCaptured = async (
    base64: string,
    location: { latitude: number; longitude: number }
  ) => {
    try {
      const loc = await getLocation();

      await updateCallPhoto(selectedCallIdValue, base64, loc);
    } catch (error) {
      console.log("handlePhotoCaptured error", error);
    }
  };

  const { imageBase64, location, handleImagePicker } = useImagePicker({
    onPhotoCaptured: handlePhotoCaptured,
  });

  const handleSignatureUpdate = async () => {
    try {
      customToast("Signature saved!");
      closeSheet();
    } catch (error) {
      console.log("Error in handleSignatureUpdate:", error);
    }
  };

  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (note) {
      setNote(note);
    }
  }, [note]);

  const handleUpdateNote = async () => {
    try {
      await updateCallNotes(selectedCallIdValue, note);
      customToast("Quick call note has been updated!");
    } catch (error) {
      console.log("Error updating note:", error);
    }
  };

  const handleRemoveCall = async () => {
    try {
      await removeCallFromLocalDb(selectedCallIdValue);
      closeSheet();
    } catch (error) {
      console.log("Error removing call:", error);
    }
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={[dynamicStyles.cardBottomSheet, dynamicStyles.centerItems]}>
        {isQuickLoading || timeOutLoading ? (
          <Loading />
        ) : (
          <>
            <SignatureCaptureDisplay
              callId={selectedCallIdValue}
              onSignatureUpdate={handleSignatureUpdate}
            />
            <View
              style={[
                styles.noteContainer,
                dynamicStyles.centerItems,
                { marginBottom: 50 },
              ]}>
              <TouchableOpacity
                style={[styles.takePhotoButton, dynamicStyles.mainBgColor]}
                onPress={handleImagePicker}>
                <Octicons name="device-camera" size={30} color="white" />
                <Text style={styles.buttonText}>Take a photo</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.noteContainer, dynamicStyles.centerItems]}>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Enter doctor's name or any note ..."
              />
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdateNote}>
                <Text style={styles.updateButtonText}>Save Note</Text>
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity
              style={styles.newCallBtn}
              onLongPress={handleAddCall}>
              <Text style={styles.updateButtonText}>New Quick Call</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.cancelCallBtn}
              onPress={() =>
                showConfirmAlert(handleRemoveCall, "cancel quick call")
              }>
              <Text style={styles.updateButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  orText: {
    marginBottom: 30,
  },
  row: {
    flexDirection: "row",
    flex: 1,
    marginVertical: 10,
    marginStart: 20,
    marginEnd: 20,
  },
  column1: {
    width: "30%",
    marginEnd: 10,
  },
  column2: {
    width: "70%",
  },
  pickerInitialLabel: {
    color: "#888",
  },
  innerCard: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  newCallBtn: {
    backgroundColor: "#046E37",
    paddingVertical: 20,
    minWidth: "50%",
    alignItems: "center",
    position: "absolute",
    bottom: 115,
    left: 0,
  },
  cancelCallBtn: {
    backgroundColor: "red",
    paddingVertical: 20,
    minWidth: "50%",
    alignItems: "center",
    position: "absolute",
    bottom: 115,
    right: 0,
  },
  columnTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 8,
  },
  columnSubTitle: {
    fontSize: 16,
    color: "#6c757d",
  },
  callItem: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  signImage: {
    marginVertical: 15,
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
  removeButtonInline: {
    backgroundColor: "transparent",
    padding: 2,
    marginVertical: 5,
  },
  takePhotoButton: {
    padding: 20,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    width: 300,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
  },
  removeButtonText: {
    color: "red",
    fontWeight: "bold",
  },
  callItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 14,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
  },
  callText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  containerNoCallData: {
    flex: 1,
    alignItems: "center",
    padding: 50,
    backgroundColor: "#e9ecef",
    borderRadius: 10,
    borderColor: "#046E37",
    borderWidth: 1,
  },
  messageNoCallData: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#046E37",
    textAlign: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#007bff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 20,
    right: 20,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 25,
    color: "#ffffff",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  iconNoSched: {
    marginBottom: 10,
    color: "#046E37",
  },
  callDetailsContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    margin: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    borderColor: "#046E37",
    borderWidth: 1,
  },
  callDetailText: {
    fontSize: 16,
    color: "#343a40",
    marginBottom: 10,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  image: {
    width: 400,
    height: 260,
    marginTop: 10,
    resizeMode: "contain",
  },
  locationText: {
    marginTop: 10,
    fontSize: 9,
    color: "blue",
  },
  noteContainer: {
    marginTop: 20,
    flexDirection: "row",
  },
  noteInput: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    maxWidth: 700,
    marginStart: 90,
  },
  updateButton: {
    // backgroundColor: "#046E37",
    backgroundColor: "lightgray",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  dropdownContainer: {
    width: 400,
    padding: 20,
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    padding: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default QuickCallBottomSheet;
