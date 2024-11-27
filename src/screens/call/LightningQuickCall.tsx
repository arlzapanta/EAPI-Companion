import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { formatTimeHoursMinutes } from "../../utils/dateUtils";
import {
  addQuickCallBottomSheet,
  removeCallFromLocalDb,
  updateCallNotes,
  updateCallPhoto,
  updateCallSignature,
} from "../../utils/quickCallUtil";
import { useImagePicker } from "../../hook/useImagePicker";
import { customToast } from "../../utils/customToast";
import { useDataContext } from "../../context/DataContext";
import Loading from "../../components/Loading";
import { getStyleUtil } from "../../utils/styleUtil";
import SignatureCaptureLightning from "../../components/SignatureCaptureLightning";
import {
  getBase64StringFormat,
  showConfirmAlert,
} from "../../utils/commonUtil";
import { getLocation } from "../../utils/currentLocation";
import Octicons from "@expo/vector-icons/Octicons";
import LoadingSub from "../../components/LoadingSub";
const dynamicStyles = getStyleUtil({});

const QuickCallLightning: React.FC<QuickCallBottomSheetProps> = ({
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
          signature_attempts: 0,
          notes: "",
          id: 0,
          full_name: "",
          call_start: "",
          call_end: "",
        };
        const insert = await addQuickCallBottomSheet(newCall);
        if (insert) setSelectedCallIdValue(Number(insert));
      } catch (error) {
        console.log("Error adding new call:", error);
      }
    };

    handleAutoAddCall();
  }, []);

  const [currentDate, setCurrentDate] = useState("");
  const [callData, setCallData] = useState<Call[]>([]);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [selectedCallIdValue, setSelectedCallIdValue] = useState<number>(0);
  const [photoVal, setPhotoVal] = useState<string>("");

  const handlePhotoCaptured = async (
    base64: string,
    location: { latitude: number; longitude: number }
  ) => {
    try {
      const loc = await getLocation();
      setPhotoVal(base64);
      await updateCallPhoto(selectedCallIdValue, base64, loc);
      closeSheet();
    } catch (error) {
      console.log("handlePhotoCaptured error", error);
    }
  };

  const { imageBase64, location, handleImagePicker } = useImagePicker({
    onPhotoCaptured: handlePhotoCaptured,
  });

  const handleSignatureUpdate = async (
    base64Signature: string,
    location: string,
    attempts: string | number
  ): Promise<void> => {
    const attemptCount =
      typeof attempts === "string" ? parseInt(attempts, 10) : attempts;

    if (isNaN(attemptCount)) {
      console.error(
        "Invalid attempt count : handleSignatureUpdate > onCallScreen"
      );
      return;
    }
    const loc = await getLocation();

    try {
      stopTimer();
      customToast("Quick call added");
      closeSheet();
      if (selectedCallIdValue !== 12340000) {
        await updateCallSignature(
          selectedCallIdValue,
          base64Signature,
          loc,
          attemptCount,
          callStartTime,
          callEndTime ? callEndTime : formatTimeHoursMinutes(new Date())
        );
      } else {
        updateCallSignature(
          selectedCallIdValue,
          base64Signature,
          loc,
          attemptCount,
          callStartTime,
          formatTimeHoursMinutes(new Date())
        );
      }
    } catch (error) {
      console.log(
        "Error in handleSignatureUpdate quickCallButtomSheet:",
        error
      );
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

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [callStartTime, setCallStartTime] = useState<string>("");
  const [callEndTime, setCallEndTime] = useState<string>("");

  const startTimer = () => {
    setCallStartTime(formatTimeHoursMinutes(new Date()));
    const id = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    setCallEndTime(formatTimeHoursMinutes(new Date()));
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const SpacerH = ({ size }: { size: number }) => (
    <View style={{ height: size }} />
  );

  return (
    <View style={dynamicStyles.containerQuickCall}>
      <View style={[dynamicStyles.cardBottomSheet, dynamicStyles.centerItems]}>
        {isQuickLoading || timeOutLoading ? (
          <LoadingSub />
        ) : (
          <>
            <SignatureCaptureLightning
              callId={selectedCallIdValue}
              onSignatureUpdate={handleSignatureUpdate}
            />
            <View style={dynamicStyles.centerItems}>
              <View
                style={[
                  styles.noteContainer,
                  dynamicStyles.centerItems,
                  { marginBottom: 10 },
                  { marginTop: 5 },
                ]}>
                {!photoVal ? (
                  <TouchableOpacity
                    style={[
                      dynamicStyles.takePhotoButton,
                      dynamicStyles.mainBgColor,
                      dynamicStyles.rowItem,
                      { justifyContent: "center" },
                    ]}
                    onPress={() =>
                      showConfirmAlert(handleImagePicker, "Capture photo")
                    }>
                    <Octicons name="device-camera" size={30} color="white" />
                    <Text
                      style={[dynamicStyles.buttonText, { marginLeft: 10 }]}>
                      Take a photo
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={dynamicStyles.imageContainer}>
                    <Text style={dynamicStyles.mainText}>Photo Capture</Text>
                    <Image
                      source={{ uri: `${getBase64StringFormat()}${photoVal}` }}
                      style={dynamicStyles.image}
                    />
                  </View>
                )}
              </View>
            </View>
            <View
              style={[
                dynamicStyles.rowItem,
                { position: "absolute", bottom: 120, left: 0 },
              ]}>
              <TouchableOpacity
                style={dynamicStyles.buttonCancelContainer}
                onPress={() =>
                  showConfirmAlert(handleRemoveCall, "cancel quick call")
                }>
                <Text style={dynamicStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  takePhotoButton: {
    backgroundColor: "#007BFF",
    borderRadius: 5,
    width: 300,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
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
    maxWidth: 500,
    marginStart: 90,
  },
  updateButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default QuickCallLightning;
