import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { customToast } from "../utils/customToast";
import { useAuth } from "../context/AuthContext";
import { getStyleUtil } from "../utils/styleUtil";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../type/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  dropLocalTable,
  dropLocalTablesDb,
  getCallsTodayLocalDb,
  insertDummyRecords,
  saveUserSyncHistoryLocalDb,
} from "../utils/localDbUtils";
import {
  doctorRecordsSync,
  getDetailersData,
  syncUser,
} from "../utils/apiUtility";
import { getCurrentTimePH, isTimeBetween12and1PM } from "../utils/dateUtils";
import Loading from "../components/Loading";
import { getLocation } from "../utils/currentLocation";
import { showConfirmAlert } from "../utils/commonUtil";
import { getQuickCalls } from "../utils/quickCallUtil";
import {
  checkPostCallUnsetExist,
  getPostCallNotesLocalDb,
  getPreCallNotesLocalDb,
} from "../utils/callComponentsUtil";

type SettingsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const Settings = () => {
  const { onLogout } = useAuth();
  const [loading, setLoading] = useState(false);
  const { authState } = useAuth();
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
  const dynamicStyle = getStyleUtil({});
  const navigation = useNavigation<SettingsScreenNavigationProp>();

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await onLogout();
            } catch (error) {
              Alert.alert(
                "Logout failed",
                "There was an error while logging out."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSyncSettingsOnPress = () => {
    navigation.navigate("Sync");
  };

  const handleRequestreschedOnPress = () => {
    navigation.navigate("Reschedule");
  };

  const handleAttendanceOnPress = () => {
    navigation.navigate("Attendance");
  };

  const MidSync_old = async () => {
    if (!userInfo) {
      Alert.alert("Server Error", "User information is missing.");
      return;
    }
    if (isTimeBetween12and1PM()) {
      try {
        setLoading(true);
        const syncLocalToAPI = await syncUser(userInfo);
        if (syncLocalToAPI !== "No records to sync") {
          customToast("Successfully Sync data to server");
          await saveUserSyncHistoryLocalDb(userInfo, 2);
        } else {
          customToast("No records [actual calls] to sync");
          console.log(
            "SettingScreen > MidSync > syncUser > res : No records to sync"
          );
        }
      } catch (error) {
        Alert.alert("Server Error", "Failed to Mid Sync.");
      } finally {
        setLoading(false);
      }
    } else {
      customToast("Mid sync is available between 12pm and 1pm");
    }
  };

  const MidSync = async () => {
    const localRecords = await getCallsTodayLocalDb();
    localRecords.forEach(async (record) => {
      const scheduleId = record.schedule_id.toString();
      const postCallsPerScheduleId = await getPostCallNotesLocalDb(scheduleId);
      const preCallsPerScheduleId = await getPreCallNotesLocalDb(scheduleId);

      console.log("scheduleId", scheduleId);
      console.log("postCallsPerScheduleId", postCallsPerScheduleId);
      console.log("preCallsPerScheduleId", preCallsPerScheduleId);
    });
    // let msg = "";
    // if (isTimeBetween12and1PM()) {
    //   try {
    //     setLoading(true);
    //     const checkQC = await getQuickCalls();
    //     const checkPost = await checkPostCallUnsetExist();
    //     if (checkQC.length > 0) {
    //       msg = "Existing quick calls, kindly complete or remove any data";
    //       Alert.alert(msg);
    //       setLoading(false);
    //       return;
    //     }
    //     if (checkPost) {
    //       msg = "Existing empty post calls, kindly complete all post calls";
    //       Alert.alert(msg);
    //       setLoading(false);
    //       return;
    //     }
    //     if (!userInfo) {
    //       msg = "Server Error : User information is missing.";
    //       Alert.alert(msg);
    //       setLoading(false);
    //       return;
    //     }

    //     try {
    //       let hasError = false;
    //       try {
    //         await syncUser(userInfo);
    //       } catch (error) {
    //         hasError = true;
    //         msg = "Server Error : Failed to mid sync please contact admin.";
    //         Alert.alert(msg);
    //         throw error;
    //       }

    //       if (!hasError) {
    //         await saveUserSyncHistoryLocalDb(userInfo, 3);
    //       }
    //     } catch (error) {
    //       msg = "Server Error : Failed to mid sync please contact admin.";
    //       Alert.alert(msg);
    //     }
    //   } catch (error) {
    //     Alert.alert(
    //       "Server Error",
    //       " Failed to mid sync please contact admin."
    //     );
    //   } finally {
    //     setLoading(false);
    //   }
    // } else {
    //   customToast("Mid sync is available between 12pm and 1pm");
    // }
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

  // temporary drop for testing only
  const dropLocalTables = async () => {
    // await insertDummyRecords();
    await dropLocalTablesDb();
  };

  const [timeOutLoading, setTimeOutLoading] = useState<boolean>(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeOutLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={dynamicStyle.container}>
      {timeOutLoading ? (
        <Loading />
      ) : (
        <>
          <View style={dynamicStyle.card}>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.centerItems}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleAttendanceOnPress}>
                <Text style={styles.buttonText}>Attendance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSyncSettingsOnPress}>
                <Text style={styles.buttonText}>Sync History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => showConfirmAlert(MidSync, "Mid Sync")}
                style={styles.button}>
                <Text style={styles.buttonText}>Mid Sync</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleRequestreschedOnPress}>
                <Text style={styles.buttonText}>Request Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonLogout}
                onPress={handleLogout}>
                <Text style={styles.buttonTextLogout}>Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonTest}
                onPress={dropLocalTables}>
                <Text style={styles.buttonTextTest}>
                  DROP ALL LOCAL DB TABLES (FOR TESTING ONLY)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centerItems: {
    alignContent: "center",
    alignItems: "center",
  },
  card: {
    height: 740,
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginStart: 20,
    marginEnd: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#046E37",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 300,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonLogout: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 300,
  },
  buttonTextLogout: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTest: {
    backgroundColor: "#ffc107",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    width: 600,
  },
  buttonTextTest: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Settings;
