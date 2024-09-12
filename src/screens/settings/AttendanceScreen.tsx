import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth, getStyleUtil } from "../../index";
import { AttendanceScreenNavigationProp } from "../../type/navigation";
import Icon from "react-native-vector-icons/Ionicons";
import {
  saveUserAttendanceLocalDb,
  getUserAttendanceRecordsLocalDb,
  saveUserSyncHistoryLocalDb,
  saveSchedulesAPILocalDb,
  getCallsTodayLocalDb,
} from "../../utils/localDbUtils";
import {
  apiTimeIn,
  apiTimeOut,
  getSChedulesAPI,
  syncUser,
} from "../../utils/apiUtility";
import AttendanceTable from "../../tables/AttendanceTable";

const Attendance: React.FC = () => {
  const navigation = useNavigation<AttendanceScreenNavigationProp>();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    sales_portal_id: string;
  } | null>(null);

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [hasTimedIn, setHasTimedIn] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusColor, setStatusColor] = useState<string>("");

  useEffect(() => {
    if (authState.authenticated && authState.user) {
      const { first_name, last_name, email, sales_portal_id } = authState.user;
      setUserInfo({
        first_name,
        last_name,
        email,
        sales_portal_id,
      });
    }
  }, [authState]);

  interface AttendanceRecord {
    id: number;
    date: string;
    email: string;
    sales_portal_id: string;
    type: string;
  }

  const fetchAttendanceData = async () => {
    if (userInfo) {
      try {
        setLoading(true);
        const data = (await getUserAttendanceRecordsLocalDb(
          userInfo
        )) as AttendanceRecord[];
        setAttendanceData(data);

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const recordsToday = data.filter((record) => {
          const recordDate = record.date.split(" ")[0]; // Extract 'YYYY-MM-DD' from 'YYYY-MM-DD HH:MM:SS'
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
    if (!userInfo) {
      Alert.alert("Error", "User information is missing.");
      return;
    }
    setLoading(true);
    try {
      const timeInIsProceed = await apiTimeIn(userInfo);

      if (timeInIsProceed.isProceed) {
        const checkIfTimedIn = await saveUserAttendanceLocalDb(userInfo, "in");
        if (checkIfTimedIn === 1) {
          Alert.alert("Failed", "Already timed In today");
        } else {
          await fetchAttendanceData();
          const scheduleData = await getSChedulesAPI(userInfo);
          if (scheduleData) {
            const result = await saveSchedulesAPILocalDb(scheduleData);
            // add fetch actual calls of users from API with date range
            {
              result == "Success"
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
      }
    } catch (error) {
      Alert.alert("Error", "Failed to time in.");
    } finally {
      setLoading(false);
    }
  };

  const timeOut = async () => {
    if (!userInfo) {
      Alert.alert("Error", "User information is missing.");
      return;
    }
    setLoading(true);

    const timeOutIsProceed = await apiTimeOut(userInfo);
    if (timeOutIsProceed.isProceed) {
      const checkIfTimedOut = await saveUserAttendanceLocalDb(userInfo, "out");
      if (checkIfTimedOut === 1) {
        Alert.alert("Failed", "Already timed out today");
      } else {
        await fetchAttendanceData();
        const res = await saveUserSyncHistoryLocalDb(userInfo, 2);
        console.log(
          "AttendanceScreen > timeOut > saveUserSyncHistoryLocalDb > res : ",
          res
        );
        const syncLocalToAPI = await syncUser(userInfo);
        if (syncLocalToAPI != "No records to sync") {
          Alert.alert("Success", "Successfully Sync data to server");
        } else {
          console.log(
            "AttendanceScreen > timeOut > syncUser > res : No records to sync"
          );
        }
      }
    }
  };

  const showConfirmAlert = (action: () => void, actionName: string) => {
    Alert.alert(
      `Confirm ${actionName}`,
      `Are you sure you want to ${actionName.toLowerCase()}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: action,
        },
      ],
      { cancelable: false }
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
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
              <TouchableOpacity
                onPress={() => showConfirmAlert(timeIn, "Time In")}
                style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Time In</Text>
              </TouchableOpacity>
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
        style={styles.floatingButtonContainer}>
        <View style={styles.floatingButton}>
          <Icon name="arrow-back" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
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
  buttonText: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "600",
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
    elevation: 3,
  },
  floatingButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});
