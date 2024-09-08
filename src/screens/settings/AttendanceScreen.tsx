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
} from "../../utils/localDbUtils";
import { apiTimeIn, apiTimeOut } from "../../utils/apiUtility";
import AttendanceTable from "../../tables/AttendanceTable";

const Attendance: React.FC = () => {
  const navigation = useNavigation<AttendanceScreenNavigationProp>();
  const styles = getStyleUtil({});
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
        const data = (await getUserAttendanceRecordsLocalDb(
          userInfo
        )) as AttendanceRecord[];
        setAttendanceData(data);
        console.log(data);

        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // Convert the date field to match the 'YYYY-MM-DD' format
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

        // Set status message and color
        if (hasTimedInToday && hasTimedOutToday) {
          setStatusMessage("You have already timed in and out today.");
          setStatusColor("red");
        } else if (hasTimedInToday) {
          setStatusMessage("You have already timed in today.");
          setStatusColor("red");
        } else if (hasTimedOutToday) {
          setStatusMessage("You have already timed out today.");
          setStatusColor("red");
        } else {
          setStatusMessage(null);
          setStatusColor("");
        }
      } catch (error: any) {
        console.log("fetchAttendanceData error", error);
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
      const checkIfTimedIn = await saveUserAttendanceLocalDb(userInfo, "in");
      if (checkIfTimedIn === 1) {
        Alert.alert("Failed", "Already timed In today");
      } else {
        await apiTimeIn(userInfo);
        await fetchAttendanceData();
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
    try {
      const checkIfTimedOut = await saveUserAttendanceLocalDb(userInfo, "out");
      if (checkIfTimedOut === 1) {
        Alert.alert("Failed", "Already timed Out today");
      } else {
        await apiTimeOut(userInfo);
        await fetchAttendanceData();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to time out.");
    } finally {
      setLoading(false);
    }
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
              <TouchableOpacity onPress={timeIn} style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Time In</Text>
              </TouchableOpacity>
            )}
            {!hasTimedOut && hasTimedIn && !loading && (
              <TouchableOpacity
                onPress={timeOut}
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
          <Icon name="arrow-back" size={20} color="#000" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Attendance;
