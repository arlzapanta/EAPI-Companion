import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  Alert,
  ScrollView,
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

  const [attendanceData, setAttendanceData] = useState<any[]>([]);

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

  const fetchAttendanceData = async () => {
    if (userInfo) {
      try {
        const data = await getUserAttendanceRecordsLocalDb(userInfo);
        setAttendanceData(data);
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
          {/* <Text style={styles.text}>Manage your attendance</Text> */}
          {/* Time In */}
          <Button title="Time In" onPress={timeIn} disabled={loading} />
          {/* Time Out */}
          <Button title="Time Out" onPress={timeOut} disabled={loading} />
          <AttendanceTable data={attendanceData} />
        </View>
      </ScrollView>
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.floatingButton}>
          <Icon name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Attendance;
