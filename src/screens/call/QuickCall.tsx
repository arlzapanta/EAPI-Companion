import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  Alert,
} from "react-native";
import moment from "moment";
import { getCurrentDatePH } from "../../utils/dateUtils";
import {
  addQuickCall,
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
import {
  getDoctorsTodaySchedLocalDb,
  saveCallsDoneFromSchedules,
} from "../../utils/localDbUtils";

const { width, height } = Dimensions.get("window");

const QuickCall = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [callData, setCallData] = useState<Call[]>([]);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [selectedCallIdValue, setSelectedCallIdValue] = useState<number>(0);
  const [doctorScheduleList, setDoctorScheduleList] = useState<
    ScheduleAPIRecord[]
  >([]);
  const [selectedDoctor, setSelectedDoctor] =
    useState<ScheduleAPIRecord | null>(null);

  const fetchCallsData = async () => {
    try {
      const getDate = await getCurrentDatePH();
      setCurrentDate(moment(getDate).format("MMMM DD, dddd"));
      const data = await getQuickCalls();
      if (Array.isArray(data)) {
        setCallData(data);
        if (selectedCallIdValue) {
          const updatedCall = data.find(
            (call) => call.id === selectedCallIdValue
          );
          setSelectedCall(updatedCall || null);
        }
      } else {
        console.warn("Fetched data is not an array:", data);
        setCallData([]);
      }
    } catch (error) {
      console.log("fetchCallsData error", error);
    }
  };

  const fetchDoctorSchedules = async () => {
    try {
      const schedules = await getDoctorsTodaySchedLocalDb();
      setDoctorScheduleList(schedules);
    } catch (error) {
      console.error("Error fetching doctor schedules:", error);
    }
  };

  useEffect(() => {
    fetchCallsData();
    fetchDoctorSchedules();
  }, []);

  const handlePhotoCaptured = async (
    base64: string,
    location: { latitude: number; longitude: number }
  ) => {
    try {
      await updateCallPhoto(
        selectedCallIdValue,
        base64,
        `${location.latitude},${location.longitude}`
      );
      await fetchCallsData();
    } catch (error) {
      console.log("handlePhotoCaptured error", error);
    }
  };

  const { imageBase64, location, handleImagePicker } = useImagePicker({
    onPhotoCaptured: handlePhotoCaptured,
  });

  const handleCallClick = (call: Call) => {
    setSelectedCall(call);
    setSelectedCallIdValue(call.id);
  };

  const handleAddCall = async () => {
    try {
      const newCall: Call = {
        location: "",
        doctor_id: "",
        photo: "",
        photo_location: "",
        signature: "",
        signature_location: "",
        notes: "",
        id: 0,
        full_name: "",
      };
      const addedCall = await addQuickCall(newCall);
      if (addedCall === "Success") {
        fetchCallsData();
      }
    } catch (error) {
      console.log("Error adding new call:", error);
    }
  };

  const handleRemoveCall = async (callId: number) => {
    Alert.alert(
      "Confirm Removal",
      "Are you sure you want to remove this call?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Removal cancelled"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              await removeCallFromLocalDb(callId);
              setCallData((prevCallData) =>
                prevCallData.filter((call) => call.id !== callId)
              );
              setSelectedCall(null);
            } catch (error) {
              console.log("Error removing call:", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSignatureUpdate = async () => {
    try {
      await fetchCallsData();
    } catch (error) {
      console.log("Error in handleSignatureUpdate:", error);
    }
  };

  const CallItem = ({ call }: { call: Call }) => (
    <View style={styles.callItemContainer}>
      <TouchableOpacity
        onPress={() => handleCallClick(call)}
        style={styles.callItem}>
        <Text style={styles.callText}>
          {!call.notes ? `QuickID ${call.id}` : call.notes}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleRemoveCall(call.id)}
        style={styles.removeButtonInline}>
        <Icon name="remove-circle" size={18} color="red" />
      </TouchableOpacity>
    </View>
  );

  const NoCallSelected = () => (
    <View style={styles.containerNoCallData}>
      <Ionicons
        name="information-circle"
        size={24}
        color="#007BFF"
        style={styles.iconNoSched}
      />
      <Text style={styles.messageNoCallData}>
        Select a quick call to view details
      </Text>
    </View>
  );

  const CallDetails = ({
    call,
    onSignatureUpdate,
  }: {
    call: Call;
    onSignatureUpdate: () => void;
  }) => {
    const [note, setNote] = useState<string>("");

    useEffect(() => {
      if (call) {
        setNote(call.notes); // Set the initial value of note based on the selected call
      }
    }, [call]);

    const handleUpdateNote = async () => {
      try {
        await updateCallNotes(call.id, note);
        await fetchCallsData();
        customToast("Quick call note has been updated!");
      } catch (error) {
        console.log("Error updating note:", error);
      }
    };

    const handleSaveQuickCall = async () => {
      if (selectedDoctor) {
        const callDetails = {
          schedule_id: selectedDoctor.schedule_id,
          call_start: "test",
          call_end: "test",
          signature: call.signature,
          signature_attempts: "0",
          signature_location: call.signature_location,
          photo: call.photo,
          photo_location: call.photo_location,
          doctor_name: call.full_name,
        };

        const result = await saveCallsDoneFromSchedules(
          selectedDoctor.schedule_id,
          callDetails
        );
        if (result == "Success") {
          await removeCallFromLocalDb(call.id);
          await fetchCallsData();
        }
      } else {
        console.log("No doctor selected");
      }
    };

    return (
      <View style={styles.callDetailsContainer}>
        <Text>{`Call ID: ${call.id}`}</Text>
        <View style={styles.noteContainer}>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Enter a note..."
          />
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdateNote}>
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.signatureLabel}>Signature Capture</Text>
        {call.signature ? (
          <Image
            source={{ uri: `data:image/png;base64,${call.signature}` }}
            style={styles.signImage}
          />
        ) : (
          <SignatureCapture
            callId={call.id}
            onSignatureUpdate={onSignatureUpdate}
          />
        )}
        {!call.photo ? (
          <TouchableOpacity
            style={styles.takePhotoButton}
            onPress={handleImagePicker}>
            <Text style={styles.buttonText}>Take a photo</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.imageContainer}>
            <Text style={styles.signatureLabel}>Photo Capture</Text>
            <Image
              source={{ uri: `data:image/png;base64,${call.photo}` }}
              style={styles.image}
            />
          </View>
        )}

        <View style={styles.dropdownContainer}>
          <Text style={styles.signatureLabel}>Select doctor</Text>
          <View style={styles.pickerContainer}>
            <Picker
              style={styles.picker}
              selectedValue={selectedDoctor}
              onValueChange={(itemValue) => setSelectedDoctor(itemValue)}>
              {doctorScheduleList
                .filter((schedule) => schedule.full_name !== null) // Filter out null names
                .map((schedule) => (
                  <Picker.Item
                    key={schedule.id}
                    label={schedule.full_name || "Unknown Name"} // Provide a default value
                    value={schedule}
                  />
                ))}
            </Picker>
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onLongPress={handleSaveQuickCall}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.column1}>
          <View style={styles.innerCard}>
            <Text style={styles.columnTitle}>Quick Calls</Text>
            <Text style={styles.columnSubTitle}>{currentDate}</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCall}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              {Array.isArray(callData) && callData.length > 0 ? (
                callData.map((call) => <CallItem key={call.id} call={call} />)
              ) : (
                <Text>No calls available</Text>
              )}
            </ScrollView>
          </View>
        </View>

        <View style={styles.column2}>
          <View style={styles.innerCard}>
            {selectedCall ? (
              <CallDetails
                call={selectedCall}
                onSignatureUpdate={handleSignatureUpdate}
              />
            ) : (
              <NoCallSelected />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
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
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    width: 200,
    alignItems: "center",
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
    // color: "#495057",
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
    width: "100%",
    alignItems: "center",
  },
  noteInput: {
    flex: 1,
    borderColor: "#ddd",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  updateButton: {
    backgroundColor: "#007BFF",
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

export default QuickCall;
