import React, { useContext, useEffect, useState } from "react";
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
  dropLocalTable,
  dropLocalTables,
  getDatesAndTypeForCalendarView,
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
import { checkPostCallUnsetExist } from "../../utils/callComponentsUtil";
import { useDataContext } from "../../context/DataContext";
import { useRefreshFetchDataContext } from "../../context/RefreshFetchDataContext";
import LoadingProgressBar from "../../components/LoadingProgressbar";

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
  const [loadingProgressData, setLoadingProgressData] =
    useState<LoadingSubRecords>({
      progress: 0.001,
      text: "Syncing data ... Please wait",
    });
  const [hasTimedIn, setHasTimedIn] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusColor, setStatusColor] = useState<string>("");
  // added 10-5-24
  const [signatureVal, setSignatureVal] = useState<string>("");
  const [signatureLoc, setSignatureLoc] = useState<string>("");
  const [selfieVal, setSelfieVal] = useState<string>("");
  const [selfieLoc, setSelfieLoc] = useState<string>("");

  const { detailersRecord, setDetailersRecord, setCalendarData } =
    useDataContext();
  const { refreshSchedData } = useRefreshFetchDataContext();

  const handleUpdateDetailers = (newDetailersData: DetailersRecord[]) => {
    setDetailersRecord(newDetailersData);
  };

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

    try {
      setLoading(true);
      const timeInIsProceed = await apiTimeIn(userInfo);
      if (timeInIsProceed.isProceed) {
        let hasError = false;
        try {
          setLoading(true);
          setLoadingProgressData({
            progress: 0.1,
            text: "Preparing ...",
          });
          await dropLocalTables([
            "detailers_tbl",
            "quick_call_tbl",
            "reschedule_req_tbl",
            "schedule_API_tbl",
            "doctors_tbl",
            "pre_call_notes_tbl",
            "post_call_notes_tbl",
            "chart_data_tbl",
            "calls_tbl",
            // "reschedule_history_tbl",
            // "user_sync_history_tbl",
            // "user_attendance_tbl",
          ]);

          setLoading(true);
          setLoadingProgressData({
            progress: 0.2,
            text: "Fetching data : reschedule requests",
          });
          await getDoctors(userInfo);
          await getReschedulesData(userInfo);
          setLoadingProgressData({
            progress: 0.3,
            text: "Fetching data : charts and calendar",
          });
          await getChartData(userInfo);

          setLoadingProgressData({
            progress: 0.4,
            text: "Fetching data : detailers",
          });
          // const getDetailersRes = await getDetailersData();
          // handleUpdateDetailers(getDetailersRes);
          await getCallsAPI(userInfo);
          setLoadingProgressData({
            progress: 0.5,
            text: "Fetching data : actual calls",
          });
          await getSChedulesAPI(userInfo);
          setLoadingProgressData({
            progress: 0.7,
            text: "Fetching data : schedules",
          });
        } catch (error) {
          await dropLocalTables([
            "detailers_tbl",
            "quick_call_tbl",
            "reschedule_req_tbl",
            "schedule_API_tbl",
            "calls_tbl",
            "doctors_tbl",
            "pre_call_notes_tbl",
            "post_call_notes_tbl",
            "chart_data_tbl",
            // "reschedule_history_tbl",
            // "user_sync_history_tbl",
            // "user_attendance_tbl",
          ]);
          hasError = true;
        }

        if (!hasError) {
          setLoading(true);
          setLoadingProgressData({
            progress: 0.8,
            text: "Saving : Sync logs",
          });
          await saveUserSyncHistoryLocalDb(
            userInfo,
            1,
            timeInIsProceed.DateTime
          );

          setLoadingProgressData({
            progress: 0.9,
            text: "Saving : Attendace logs",
          });
          await saveUserAttendanceLocalDb(
            userInfo,
            "in",
            timeInIsProceed.DateTime
          );

          setLoadingProgressData({
            progress: 0.9,
            text: "Refreshing data",
          });
          await fetchAttendanceData();
          refreshSchedData();
        }
      } else {
        customToast("Already timed in, please contact admin [time in api]");
      }
    } catch (error) {
      Alert.alert("Server Error", "Failed to time in. Please contact admin");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const timeOut = async () => {
    let msg = "";

    setLoading(true);
    const checkQC = await getQuickCalls();
    const checkPost = await checkPostCallUnsetExist();
    if (checkQC.length > 0) {
      msg = "Existing quick calls, kindly complete or remove any data";
      Alert.alert(msg);
      setLoading(false);
      return;
    }
    if (checkPost) {
      msg = "Existing empty post calls, kindly complete all post calls";
      Alert.alert(msg);
      setLoading(false);
      return;
    }
    if (!userInfo) {
      msg = "Server Error : User information is missing.";
      Alert.alert(msg);
      setLoading(false);
      return;
    }

    try {
      let hasError = false;
      const timeOutIsProceed = await apiTimeOut(userInfo);
      if (timeOutIsProceed.isProceed) {
        try {
          setLoading(true);
          setLoadingProgressData({
            progress: 0.1,
            text: "Syncing data : reschedule requests",
          });
          await doctorRecordsSync(userInfo);
          await requestRecordSync(userInfo);
          setLoadingProgressData({
            progress: 0.3,
            text: "Syncing data : Actual calls",
          });
          await syncUser(userInfo);
        } catch (error) {
          hasError = true;
          msg = "Server Error : Failed to time out please contact admin.";
          Alert.alert(msg);
          throw error;
        }

        if (!hasError) {
          setLoadingProgressData({
            progress: 0.5,
            text: "Saving : Sync logs",
          });
          await saveUserSyncHistoryLocalDb(
            userInfo,
            2,
            timeOutIsProceed.DateTime
          );
          setLoadingProgressData({
            progress: 0.8,
            text: "Saving : Attendance logs",
          });
          await saveUserAttendanceLocalDb(
            userInfo,
            "out",
            timeOutIsProceed.DateTime
          );
          setLoadingProgressData({
            progress: 0.9,
            text: "Saving : Attendance logs",
          });
          await fetchAttendanceData();

          const getDates = await getDatesAndTypeForCalendarView();
          if (getDates && Array.isArray(getDates)) {
            setCalendarData({ data: getDates });
          }
        }
      } else {
        customToast("Already timed out, please contact admin [time out api]");
      }
    } catch (error) {
      msg = "Server Error : Failed to time out please contact admin.";
      Alert.alert(msg);
    } finally {
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
        <LoadingProgressBar data={loadingProgressData} />
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
                {/* <TouchableOpacity
                  onPress={() => showConfirmAlert(timeIn, "Time In")}
                  style={styles.buttonContainer}>
                  <Text style={styles.buttonText}>Time In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => showConfirmAlert(timeOut, "Time Out")}
                  style={styles.buttonContainer}>
                  <Text style={styles.buttonText}>Time Out</Text>
                </TouchableOpacity> */}
                {!hasTimedIn && !loading && (
                  <>
                    <TouchableOpacity
                      onPress={
                        signatureVal && selfieVal
                          ? () => showConfirmAlert(timeIn, "Time In")
                          : undefined
                      }
                      disabled={!(signatureVal && selfieVal)}
                      style={[
                        styles.buttonContainer,
                        !(signatureVal && selfieVal) &&
                          styles.buttonContainerDisabled,
                      ]}>
                      <AntDesign
                        name="clockcircle"
                        size={24}
                        color="white"
                        style={{ alignSelf: "center" }}
                      />
                      <Text style={styles.buttonText}>Time In</Text>
                    </TouchableOpacity>

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
                        style={dynamicStyles.buttonContainer1}
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
                    <AntDesign
                      name="clockcircle"
                      size={24}
                      color="white"
                      style={{ alignSelf: "center" }}
                    />
                    <Text style={styles.buttonText}> Time Out</Text>
                  </TouchableOpacity>
                )}
              </View>
              <AttendanceTable data={attendanceData} />
            </View>
          </ScrollView>
          {/* <TouchableOpacity
            onPress={handleBack}
            style={dynamicStyles.floatingButtonContainer}>
            <View style={dynamicStyles.floatingButton}>
              <AntDesign name="back" size={24} color="white" />
            </View>
          </TouchableOpacity> */}
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
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
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
