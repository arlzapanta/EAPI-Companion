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
import {
  formatDate,
  formatTimeHoursMinutes,
  getCurrentDatePH,
  getFormattedDateToday,
} from "../../utils/dateUtils";
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
  getDoctorsWeekSchedLocalDb,
  saveCallsDoneFromSchedules,
} from "../../utils/localDbUtils";
import { useDataContext } from "../../context/DataContext";
import Loading from "../../components/Loading";
import Octicons from "@expo/vector-icons/Octicons";
import { getStyleUtil } from "../../utils/styleUtil";
import { getLocation } from "../../utils/currentLocation";
import {
  getBase64StringFormat,
  showConfirmAlert,
} from "../../utils/commonUtil";
import { savePostCallNotesLocalDb } from "../../utils/callComponentsUtil";
import LoadingSub from "../../components/LoadingSub";
const dynamicStyles = getStyleUtil({});

const { width, height } = Dimensions.get("window");
const QuickCall = () => {
  const [timeOutLoading, setTimeOutLoading] = useState<boolean>(true);
  const { isQuickLoading, currentDate, quickCallData } = useDataContext();
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeOutLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const [callData, setCallData] = useState<Call[]>([]);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [selectedCallIdValue, setSelectedCallIdValue] = useState<number>(0);
  const [isInternalQuickLoading, setIsInternalQuickLoading] =
    useState<boolean>(false);
  const [cardActiveId, setSelectedCardId] = useState<string>("");
  const [doctorScheduleList, setDoctorScheduleList] = useState<
    ScheduleAPIRecord[]
  >([]);
  const [selectedDoctor, setSelectedDoctor] =
    useState<ScheduleAPIRecord | null>({
      id: "",
      address: "",
      date: "",
      doctors_id: "",
      full_name: "",
      municipality_city: "",
      province: "",
      schedule_id: "",
    });

  const fetchCallsData = async () => {
    try {
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
      const schedules = await getDoctorsWeekSchedLocalDb();
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
      const loc = await getLocation();

      await updateCallPhoto(selectedCallIdValue, base64, loc);
      await fetchCallsData();
    } catch (error) {
      console.log("handlePhotoCaptured error", error);
    }
  };

  const { imageBase64, location, handleImagePicker } = useImagePicker({
    onPhotoCaptured: handlePhotoCaptured,
  });

  const handleCallClick = (call: Call) => {
    setIsInternalQuickLoading(true);
    setSelectedCardId(call.id.toString());
    setSelectedCall(call);
    setSelectedCallIdValue(call.id);
    setTimeout(() => setIsInternalQuickLoading(false), 200);
  };

  const handleAddCall = async () => {
    try {
      const newCall: Call = {
        location: "",
        doctors_id: "",
        photo: "",
        photo_location: "",
        signature: "",
        signature_location: "",
        signature_attempts: 0,
        notes: "",
        id: 0,
        full_name: "",
        call_start: "",
        call_end: "",
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
    setSelectedCardId("");
    Alert.alert(
      "Confirm Removal",
      "Are you sure you want to remove this call?",
      [
        {
          text: "Cancel",
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
        onPress={() => {
          handleCallClick(call);
          setIsInternalQuickLoading(true);
        }}
        style={[
          styles.callItem,
          cardActiveId === call.id.toString() && styles.callItemActive,
        ]}>
        <Text
          style={[
            styles.callText,
            cardActiveId === call.id.toString() && styles.callTextActive,
          ]}>
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
        setNote(call.notes);
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
      if (!selectedDoctor || selectedDoctor.full_name === undefined) {
        customToast("Please select doctor");
        return;
      }

      if (selectedDoctor) {
        const callDetails = {
          schedule_id: selectedDoctor.schedule_id,
          call_start: call.call_start,
          call_end: call.call_end,
          signature: call.signature,
          signature_attempts: call.signature_attempts
            ? call.signature_attempts.toString()
            : "0",
          signature_location: call.signature_location,
          photo: call.photo,
          photo_location: call.photo_location,
          doctors_name: selectedDoctor.full_name,
          created_at: await getFormattedDateToday(),
        };

        await savePostCallNotesLocalDb({
          mood: "",
          feedback: "",
          scheduleId: selectedDoctor.schedule_id,
        });

        const result = await saveCallsDoneFromSchedules(
          selectedDoctor.schedule_id,
          callDetails
        );
        if (result == "Success") {
          await removeCallFromLocalDb(call.id);
          await fetchDoctorSchedules();
          await fetchCallsData();
        }
      } else {
        console.log("No doctor selected");
      }
    };

    return (
      <ScrollView>
        <View style={styles.callDetailsContainer}>
          <View style={[styles.noteContainer, dynamicStyles.centerItems]}>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Enter doctor's name or any note ..."
            />
            <TouchableOpacity
              style={[
                dynamicStyles.buttonSubContainer1,
                dynamicStyles.subBgColor,
              ]}
              onPress={handleUpdateNote}>
              <Text style={styles.updateButtonText}>Save Note</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.dropdownContainer]}>
            <Text style={styles.signatureLabel}>Select doctor</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={[dynamicStyles.picker]}
                selectedValue={selectedDoctor}
                onValueChange={(itemValue: ScheduleAPIRecord | null) => {
                  setSelectedDoctor(itemValue);
                  if (itemValue !== selectedDoctor) {
                    setSelectedDoctor(itemValue);
                    if (itemValue && itemValue.date) {
                    }
                  } else {
                    if (itemValue && itemValue.date) {
                      setSelectedDoctor(itemValue);
                    }
                  }
                }}>
                <Picker.Item
                  label="Select doctor"
                  value="selectdoc"
                  style={styles.pickerInitialLabel}
                />
                {doctorScheduleList
                  .filter((schedule) => schedule.full_name !== null)
                  .map((schedule) => (
                    <Picker.Item
                      key={schedule.id}
                      label={
                        `${schedule.full_name} - ${formatDate(
                          schedule.date
                        )}` || "Unknown Name"
                      }
                      value={schedule}
                    />
                  ))}
              </Picker>
            </View>
          </View>
          <View style={dynamicStyles.centerItems}>
            <TouchableOpacity
              onPress={
                call.signature || call.photo
                  ? () => showConfirmAlert(handleSaveQuickCall, "End Call")
                  : undefined
              }
              disabled={!(call.signature || call.photo)}
              style={[
                dynamicStyles.buttonContainer,
                !(call.signature || call.photo) &&
                  dynamicStyles.buttonContainerDisabled,
              ]}>
              <View style={dynamicStyles.row}>
                <Icon name="exit" size={24} color="#fff" />
                <Text style={dynamicStyles.buttonText}>Save</Text>
              </View>
            </TouchableOpacity>
          </View>
          {!call.photo ? (
            <>
              <TouchableOpacity
                style={[
                  dynamicStyles.buttonContainer,
                  dynamicStyles.mainBgColor,
                  dynamicStyles.rowItem,
                  { justifyContent: "center" },
                ]}
                onPress={handleImagePicker}>
                <Octicons name="device-camera" size={30} color="white" />
                <Text style={[dynamicStyles.buttonText, { marginLeft: 10 }]}>
                  Take a photo
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.imageContainer}>
              <Text style={styles.signatureLabel}>Photo Capture</Text>
              <Image
                source={{ uri: `${getBase64StringFormat()}${call.photo}` }}
                style={dynamicStyles.image}
              />
            </View>
          )}
          {call.signature ? (
            <View style={[styles.imageContainer, { marginTop: 20 }]}>
              <Text style={styles.signatureLabel}>Signature</Text>
              <Image
                source={{ uri: `${getBase64StringFormat()}${call.signature}` }}
                style={[dynamicStyles.signImage]}
              />
            </View>
          ) : (
            <SignatureCapture
              callId={call.id}
              onSignatureUpdate={onSignatureUpdate}
            />
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      {isQuickLoading || timeOutLoading ? (
        <Loading />
      ) : (
        <View style={dynamicStyles.row}>
          <View style={dynamicStyles.column1}>
            <View style={dynamicStyles.card1Col}>
              <Text style={dynamicStyles.columnTitle}>Quick Calls</Text>
              <Text style={dynamicStyles.columnSubTitle}>
                {moment(currentDate).format("MMMM DD, dddd")}
              </Text>
              <TouchableOpacity
                style={[styles.addButton, dynamicStyles.subBgColor]}
                onPress={handleAddCall}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
              <ScrollView
                contentContainerStyle={dynamicStyles.scrollViewQuickContainer}>
                {Array.isArray(callData) && callData.length > 0 ? (
                  callData.map((call) => <CallItem key={call.id} call={call} />)
                ) : (
                  <Text style={{ marginTop: 20 }}>No calls available</Text>
                )}
              </ScrollView>
            </View>
          </View>
          <View style={dynamicStyles.column2}>
            <View style={dynamicStyles.card2Col}>
              {selectedCall && !isInternalQuickLoading ? (
                <CallDetails
                  call={selectedCall}
                  onSignatureUpdate={handleSignatureUpdate}
                />
              ) : isInternalQuickLoading ? (
                <LoadingSub />
              ) : (
                <NoCallSelected />
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
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
  signImage: {
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
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 5,
  },
  callItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 1,
    marginVertical: 5,
    width: "80%",
  },
  callText: {
    fontSize: 14,
    color: "black",
  },
  callItemActive: {
    padding: 12,
    borderWidth: 3,
    borderColor: "green",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 1,
    marginVertical: 5,
    width: "80%",
  },
  callTextActive: {
    fontSize: 14,
    fontWeight: 700,
    color: "green",
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
    color: "#046E37",
    marginTop: 30,
  },
  imageContainer: {
    alignItems: "center",
  },
  image: {
    width: 650,
    height: 300,
    marginTop: 10,
    resizeMode: "cover",
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
    padding: 10,
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#046E37",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  saveButtonQuickCall: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#046E37",
    borderRadius: 5,
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
