import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { AttendanceScreenNavigationProp } from "../../type/navigation";
import {
  saveUserAttendanceLocalDb,
  getUserAttendanceRecordsLocalDb,
  saveUserSyncHistoryLocalDb,
  saveSchedulesAPILocalDb,
  saveCallsAPILocalDb,
} from "../../utils/localDbUtils";
import {
  apiTimeIn,
  apiTimeOut,
  doctorRecordsSync,
  getCallsAPI,
  getChartData,
  getDetailersData,
  getDoctors,
  getReschedulesData,
  getSChedulesAPI,
  requestRecordSync,
  syncUser,
} from "../../utils/apiUtility";
import AttendanceTable from "../tables/AttendanceTable";
import { getQuickCalls } from "../../utils/quickCallUtil";
import SignatureCapture from "../../components/SignatureCapture";
import { useImagePicker } from "../../hook/useImagePicker";
import { getLocation } from "../../utils/currentLocation";
import { showConfirmAlert } from "../../utils/commonUtil";
import { AntDesign } from "@expo/vector-icons";
import { getStyleUtil } from "../../utils/styleUtil";
import Loading from "../../components/Loading";
import { customToast } from "../../utils/customToast";
const dynamicStyles = getStyleUtil({ theme: "light" });

const Attendance: React.FC = () => {
  const navigation = useNavigation<AttendanceScreenNavigationProp>();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    sales_portal_id: string;
    territory_id: string;
    territory_name: string;
    district_id: string;
    division: string;
    user_type: string;
    created_at: string;
    updated_at: string;
  } | null>(null);

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [hasTimedIn, setHasTimedIn] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusColor, setStatusColor] = useState<string>("");
  // added 10-5-24
  const [signatureVal, setSignatureVal] = useState<string>("");
  const [signatureLoc, setSignatureLoc] = useState<string>("");
  const [selfieVal, setSelfieVal] = useState<string>("");
  const [selfieLoc, setSelfieLoc] = useState<string>("");

  useEffect(() => {
    if (authState.authenticated && authState.user) {
      const {
        first_name,
        last_name,
        email,
        sales_portal_id,
        territory_id,
        division,
      } = authState.user;
      setUserInfo({
        first_name,
        last_name,
        email,
        sales_portal_id,
        territory_id,
        territory_name: "",
        district_id: "",
        division,
        user_type: "",
        created_at: "",
        updated_at: "",
      });
    }
  }, [authState]);

  const fetchAttendanceData = async () => {
    if (userInfo) {
      try {
        setLoading(true);
        const data = (await getUserAttendanceRecordsLocalDb(
          userInfo
        )) as AttendanceRecord[];
        setAttendanceData(data);

        const today = new Date().toISOString().split("T")[0];
        const recordsToday = data.filter((record) => {
          const recordDate = record.date.split(" ")[0];
          return recordDate === today;
        });

        const hasTimedInToday = recordsToday.some(
          (record) => record.type === "in"
        );
        const hasTimedOutToday = recordsToday.some(
          (record) => record.type === "out"
        );

        setHasTimedIn(hasTimedInToday);
        setHasTimedOut(hasTimedOutToday);

        if (hasTimedInToday && hasTimedOutToday) {
          setStatusMessage("You have already timed out today.");
          setStatusColor("green");
        } else if (hasTimedInToday) {
          setStatusMessage("You have already timed in today.");
          setStatusColor("green");
        } else if (hasTimedOutToday) {
          setStatusMessage("You have already timed out today.");
          setStatusColor("green");
        } else {
          setStatusMessage(null);
          setStatusColor("");
        }
      } catch (error: any) {
        console.log("fetchAttendanceData error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [userInfo]);

  const timeIn = async () => {
    setLoading(true);
    if (!userInfo) {
      Alert.alert("Error", "User information is missing.");
      return;
    }
    // todo : add functionality to insert pre-approved advance calls (for tracking)

    try {
      const timeInIsProceed = await apiTimeIn(userInfo);
      if (timeInIsProceed.isProceed) {
        const checkIfTimedIn = await saveUserAttendanceLocalDb(userInfo, "in");
        if (checkIfTimedIn === 1) {
          Alert.alert("Failed", "Already timed In today");
        } else {
          await getDoctors(userInfo);
          await getReschedulesData(userInfo);
          await getChartData(userInfo);
          await getDetailersData();
          await fetchAttendanceData();
          const callData = await getCallsAPI(userInfo);
          const scheduleData = await getSChedulesAPI(userInfo);
          if (callData && scheduleData) {
            const CallResult = await saveCallsAPILocalDb(callData);
            const scheduleResult = await saveSchedulesAPILocalDb(scheduleData);
            {
              CallResult && scheduleResult == "Success"
                ? Alert.alert("Success", "Successfully synced data from server")
                : Alert.alert("Failed", "Error syncing");
            }
            const res = await saveUserSyncHistoryLocalDb(userInfo, 1);
            console.log(
              "AttendanceScreen > timeIn > saveUserSyncHistoryLocalDb > res : ",
              res
            );
          }
        }
      } else if (!timeInIsProceed.isProceed) {
        customToast("Already timed in, please contact admin to reset");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to time in.");
    } finally {
      setLoading(false);
    }
  };

  const timeOut = async () => {
    setLoading(true);
    let msg = "";
    const checkQC = await getQuickCalls();
    if (checkQC.length > 0) {
      msg = "Error : Please check quick calls.";
      return;
    }
    // todo : check if post call exist

    if (!userInfo) {
      msg = "Error : User information is missing.";
      return;
    }

    try {
      const timeOutIsProceed = await apiTimeOut(userInfo);
      if (timeOutIsProceed.isProceed) {
        const checkIfTimedOut = await saveUserAttendanceLocalDb(
          userInfo,
          "out"
        );
        if (checkIfTimedOut === 1) {
          msg = "Already timed out today";
        } else {
          await doctorRecordsSync(userInfo);
          const reqRecordSync = await requestRecordSync(userInfo);
          await fetchAttendanceData();
          const res = await saveUserSyncHistoryLocalDb(userInfo, 2);
          const syncLocalToAPI = await syncUser(userInfo);
          if (syncLocalToAPI != "No records to sync") {
            msg = "Successfully Sync data to server";
          } else {
            console.log(
              "AttendanceScreen > timeOut > syncUser > res : No records to sync"
            );
          }
        }
      }
    } catch (error) {
      msg = "Failed to time out.";
    } finally {
      Alert.alert(msg);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePhotoCaptured = async (
    base64: string,
    location: { latitude: number; longitude: number }
  ) => {
    try {
      const loc = await getLocation();
      setSelfieVal(base64);
      setSelfieLoc(loc);
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

    if (base64Signature) {
      const loc = await getLocation();
      setSignatureVal(base64Signature);
      setSignatureLoc(loc);
    } else {
      console.error("Signature update failed: No base64 data");
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.content}>
              <Text style={styles.title_stack_settings}>Attendance</Text>
              {statusMessage && (
                <Text style={[styles.statusLabel, { color: statusColor }]}>
                  {statusMessage}
                </Text>
              )}
              <View style={styles.centerItems}>
                {!hasTimedIn && !loading && (
                  <>
                    {signatureVal && selfieVal ? (
                      <TouchableOpacity
                        onPress={() => showConfirmAlert(timeIn, "Time In")}
                        style={styles.buttonContainer}>
                        <Text style={styles.buttonText}>Time In</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => showConfirmAlert(timeIn, "Time In")}
                        style={styles.buttonContainerDisabled}
                        disabled>
                        <Text style={styles.buttonText}>Time In</Text>
                      </TouchableOpacity>
                    )}

                    {signatureVal ? (
                      <></>
                    ) : (
                      <SignatureCapture
                        callId={12340000}
                        onSignatureUpdate={handleSignatureUpdate}
                      />
                    )}
                    {!selfieVal ? (
                      <TouchableOpacity
                        style={styles.buttonContainer1}
                        onPress={handleImagePicker}>
                        <Text style={styles.buttonText1}>Take a photo</Text>
                      </TouchableOpacity>
                    ) : (
                      <></>
                    )}
                  </>
                )}
                {!hasTimedOut && hasTimedIn && !loading && (
                  <TouchableOpacity
                    onPress={() => showConfirmAlert(timeOut, "Time Out")}
                    style={styles.buttonContainer}>
                    <Text style={styles.buttonText}>Time Out</Text>
                  </TouchableOpacity>
                )}
              </View>
              <AttendanceTable data={attendanceData} />
            </View>
          </ScrollView>
          <TouchableOpacity
            onPress={handleBack}
            style={dynamicStyles.floatingButtonContainer}>
            <View style={dynamicStyles.floatingButton}>
              <AntDesign name="back" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollViewContent: {
    flex: 1,
    flexGrow: 1,
    paddingTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginVertical: 10,
    marginStart: 20,
    marginEnd: 20,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  signImage: {
    marginVertical: 15,
    width: "100%",
    height: 200,
    resizeMode: "contain",
  },
  image: {
    width: 400,
    height: 260,
    marginTop: 10,
    resizeMode: "contain",
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
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
  title_stack_settings: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  statusLabel: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "500",
  },
  centerItems: {
    alignItems: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    backgroundColor: "#046E37",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 5,
  },
  buttonContainerDisabled: {
    backgroundColor: "lightgray",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 5,
  },
  buttonContainer1: {
    backgroundColor: "#046E37",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 5,
    minWidth: 165,
  },
  buttonText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "600",
  },
  buttonText1: {
    color: "#FFF",
    fontWeight: "bold",
    alignSelf: "center",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 40,
    right: 50,
    backgroundColor: "#046E37",
    opacity: 0.9,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
});
