import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { RescheduleScreenNavigationProp } from "navigation";
import { useAuth } from "../context/AuthContext";
import {
  getDoctorsWeekSchedLocalDb,
  getRescheduleHistoryRecordsLocalDb,
  saveRescheduleHistoryLocalDb,
} from "../utils/localDbUtils";
import { Picker } from "@react-native-picker/picker";
import {
  isWithinCurrentMonthAndAvailable,
  isWithinWeekOrAdvance,
} from "../utils/dateUtils";
import { customToast } from "../utils/customToast";
import RescheduleTable from "../screens/tables/RescheduleTable";

const RescheduleScreen: React.FC = () => {
  const navigation = useNavigation<RescheduleScreenNavigationProp>();
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

  const [rescheduleData, setRescheduleData] = useState<any[]>([]); //for table
  const [selectedDateTo, setSelectedDateTo] = useState<string>("");
  const dateToDates = ["2024-09-25", "2024-09-26", "2024-09-27"];

  const [doctorScheduleList, setDoctorScheduleList] = useState<
    ScheduleAPIRecord[]
  >([]);

  const [selectedDoctor, setSelectedDoctor] =
    useState<ScheduleAPIRecord | null>(null);

  const [availableDates, setAvailableDates] = useState<string[]>([]);

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

  const fetchRescheduleData = useCallback(async () => {
    if (userInfo) {
      try {
        const data = await getRescheduleHistoryRecordsLocalDb(userInfo);
        setRescheduleData(data);
      } catch (error: any) {
        console.log("fetchRescheduleData error", error);
      }
    }
  }, [userInfo]);

  const handleSaveReschedule = async () => {
    if (!selectedDoctor) {
      customToast("Please select doctor");
      return;
    }
    if (!userInfo) {
      return;
    }
    if (selectedDateTo == "") {
      customToast("Please select valid date");
      return;
    }
    if (selectedDoctor) {
      const type = isWithinWeekOrAdvance(selectedDateTo);
      const status = type == "Makeup" ? 3 : 2;
      const reschedDetails = {
        schedule_id: selectedDoctor.schedule_id,
        date_to: selectedDateTo,
        date_from: selectedDoctor.date,
        doctors_id: selectedDoctor.doctor_id,
        full_name: selectedDoctor.full_name,
        status,
        type,
        sales_portal_id: userInfo.sales_portal_id,
      };
      const result = await saveRescheduleHistoryLocalDb(reschedDetails);
      if (result == "Success") {
        await fetchRescheduleData();
      }
    } else {
      console.log("No doctor selected");
    }
  };

  const fetchDoctorSchedules = async () => {
    try {
      const schedules = await getDoctorsWeekSchedLocalDb();
      setDoctorScheduleList(schedules);
      console.log(schedules.map((schedule) => schedule.date));
      // logic for date to here
      const filteredDates = schedules
        .map((schedule) => schedule.date)
        .filter(isWithinCurrentMonthAndAvailable);

      console.log(
        filteredDates.map((test) => test),
        "filteredDates"
      );
      setAvailableDates(filteredDates);
    } catch (error) {
      console.error("Error fetching doctor schedules:", error);
    }
  };

  useEffect(() => {
    fetchRescheduleData();
    fetchDoctorSchedules();
  }, [fetchRescheduleData]);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          <View style={styles.requestContainer}>
            <Text style={styles.title}>Reschedule Request</Text>
            <View style={styles.dropdownContainer}>
              <Text style={styles.signatureLabel}>Select schedule/doctor</Text>
              <Picker
                style={styles.picker}
                selectedValue={selectedDoctor}
                onValueChange={(itemValue) => setSelectedDoctor(itemValue)}>
                <Picker.Item
                  label="Select Doctor"
                  value=""
                  style={styles.pickerInitialLabel}
                />
                {doctorScheduleList
                  .filter((schedule) => schedule.full_name !== null)
                  .map((schedule) => (
                    <Picker.Item
                      key={schedule.id}
                      label={
                        `${schedule.full_name} - ${schedule.date}` ||
                        "Unknown Name"
                      }
                      value={schedule}
                    />
                  ))}
              </Picker>

              <Text style={styles.signatureLabel}>Date to</Text>
              <Picker
                selectedValue={selectedDateTo}
                onValueChange={(itemValue) => setSelectedDateTo(itemValue)}
                style={styles.picker}>
                {availableDates.length > 0 && (
                  <Picker.Item
                    label="Select Date"
                    value=""
                    style={styles.pickerInitialLabel}
                  />
                )}

                {availableDates.length <= 0 && (
                  <Picker.Item
                    label="No dates available"
                    value=""
                    style={styles.pickerInitialLabel}
                  />
                )}

                {availableDates.map((date) => (
                  <Picker.Item
                    label={date}
                    value={date}
                    key={date}
                    style={styles.pickerLabel}
                  />
                ))}
              </Picker>

              <TouchableOpacity
                style={styles.saveButton}
                onLongPress={handleSaveReschedule}>
                <Text style={styles.buttonText}>Request</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.historyContainer}>
            <Text style={styles.title}>History</Text>
            <RescheduleTable data={rescheduleData} />
          </View>
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

const styles = StyleSheet.create({
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  dropdownContainer: {
    width: "100%", // Set to 100% to utilize full width
    padding: 20,
  },
  picker: {
    height: 50,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginVertical: 10,
  },
  pickerInitialLabel: {
    color: "#888",
  },
  pickerLabel: {
    color: "#000",
  },
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
    flexDirection: "row", // Set flex direction to row for side-by-side layout
  },
  content: {
    flex: 1,
    flexDirection: "row", // Use row for horizontal layout
  },
  requestContainer: {
    flex: 1, // Take up half of the screen
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginRight: 10, // Add space between the two sections
  },
  historyContainer: {
    flex: 1, // Take up the other half of the screen
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "normal",
    marginBottom: 15,
    color: "#333",
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

export default RescheduleScreen;
