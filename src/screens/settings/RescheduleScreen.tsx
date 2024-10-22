import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { RescheduleScreenNavigationProp } from "navigation";
import { useAuth } from "../../context/AuthContext";
import {
  cancelRescheduleReqLocalDb,
  deleteRescheduleReqLocalDb,
  getDoctorsWeekSchedLocalDb,
  getDoctorsSchedLocalDb,
  getRescheduleListLocalDb,
  insertRescheduleRequest,
  undoCancelRescheduleReqLocalDb,
} from "../../utils/localDbUtils";
import { Picker } from "@react-native-picker/picker";
import {
  generateFutureDates,
  isWithinWeekOrAdvance,
} from "../../utils/dateUtils";
import { customToast } from "../../utils/customToast";
import RescheduleTable from "../tables/RescheduleTable";
import { AntDesign } from "@expo/vector-icons";
import { getStyleUtil } from "../../utils/styleUtil";
import { lightTheme, darkTheme } from "../../utils/themes";
const dynamicStyles = getStyleUtil({ theme: "light" });

const RescheduleScreen: React.FC = () => {
  const navigation = useNavigation<RescheduleScreenNavigationProp>();
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

  const [rescheduleData, setRescheduleData] = useState<any[]>([]); //for table
  const [selectedDateTo, setSelectedDateTo] = useState<string>("");
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
        await getRescheduleListLocalDb();
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
    if (selectedDateTo == selectedDoctor.date) {
      customToast("Please select valid date");
      return;
    }
    if (selectedDoctor) {
      const type = isWithinWeekOrAdvance(selectedDateTo);
      const reschedDetails = {
        id: "",
        request_id: "",
        created_at: "",
        schedule_id: selectedDoctor.schedule_id,
        date_to: selectedDateTo,
        date_from: selectedDoctor.date,
        doctors_id: selectedDoctor.doctors_id,
        full_name: selectedDoctor.full_name,
        status: "0",
        type,
        sales_portal_id: userInfo.sales_portal_id,
      };

      const result1 = await insertRescheduleRequest(reschedDetails);
      if (result1 == "Success") {
        await fetchDoctorSchedules();
        setSelectedDateTo("selectdate");
        setSelectedDoctor(null);
      } else if (result1 == "Existing") {
        setSelectedDateTo("selectdate");
        setSelectedDoctor(null);
        customToast(
          "Existing request, kindly delete it first if it needs to be changed"
        );
      }
    } else {
      console.log("No doctor selected");
    }
  };

  // todo : filter doctors from reschedule (approved) and from schedules within the week.
  const fetchDoctorSchedules = async () => {
    try {
      const schedules = await getDoctorsSchedLocalDb();
      setDoctorScheduleList(schedules);
      const localFromAPIdata = await getRescheduleListLocalDb();
      setRescheduleData(localFromAPIdata);
      rescheduleData.map((rescheduleItem) => {
        const doctor = doctorScheduleList.find(
          (doctorItem) => doctorItem.doctors_id === rescheduleItem.doctors_id
        );
        return {
          ...rescheduleItem,
          full_name: doctor ? doctor.full_name : "Unknown",
        };
      });
    } catch (error) {
      console.error("Error fetching doctor schedules:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRescheduleReqLocalDb(id);
      setRescheduleData((prevData) =>
        prevData.filter((item) => item.id !== id)
      );
      customToast("Request removed!");
    } catch (error) {
      console.error(`Failed to delete item with request_id: ${id}`, error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelRescheduleReqLocalDb(id);
      setRescheduleData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, status: "4" } : item
        )
      );
      customToast("Request cancelled!");
    } catch (error) {
      console.error(`Failed to delete item with request_id: ${id}`, error);
    }
  };

  const handleCancelUndo = async (id: string, request_id: string) => {
    try {
      const newStatus = await undoCancelRescheduleReqLocalDb(id, request_id);
      const formatStatus = newStatus.toString();
      setRescheduleData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, status: formatStatus } : item
        )
      );
      customToast("Cancellation request undone!");
    } catch (error) {
      console.error(`Failed to delete item with request_id: ${id}`, error);
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
              <Text style={dynamicStyles.mainText}>Select schedule/doctor</Text>
              <Picker
                style={styles.picker}
                selectedValue={selectedDoctor}
                onValueChange={(itemValue: ScheduleAPIRecord | null) => {
                  setSelectedDateTo("selectedate");
                  if (itemValue !== selectedDoctor) {
                    setSelectedDoctor(itemValue);
                    if (itemValue && itemValue.date) {
                      setSelectedDateTo(itemValue.date);
                      const futureDates = generateFutureDates(itemValue.date);
                      setAvailableDates(futureDates);
                    }
                  } else {
                    if (itemValue && itemValue.date) {
                      setSelectedDateTo(itemValue.date);
                      const futureDates = generateFutureDates(itemValue.date);
                      setAvailableDates(futureDates);
                    }
                  }
                }}>
                <Picker.Item
                  label="Select schedule"
                  value="selectschedule"
                  style={styles.pickerInitialLabel}
                />
                {doctorScheduleList
                  .filter((schedule) => schedule.full_name !== null)
                  .map((schedule) => (
                    <Picker.Item
                      key={schedule.id}
                      label={`${schedule.full_name} - ${schedule.date}`}
                      value={schedule}
                    />
                  ))}
              </Picker>

              <Text style={dynamicStyles.mainText}>Date to</Text>
              <Picker
                selectedValue={selectedDateTo}
                onValueChange={(itemValue) => setSelectedDateTo(itemValue)}
                style={styles.picker}
                enabled={!!selectedDoctor}>
                {availableDates.length > 0 && (
                  <Picker.Item
                    label="Select Date"
                    value="selectdate"
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
                style={[styles.saveButton, dynamicStyles.mainBgColor]}
                disabled={!selectedDateTo}
                onPress={handleSaveReschedule}>
                <Text style={styles.buttonText}>Add Request</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.historyContainer}>
            <Text style={styles.title}>Request List</Text>
            <RescheduleTable
              data={rescheduleData}
              onDelete={handleDelete}
              onCancel={handleCancel}
              onCancelUndo={handleCancelUndo}
            />
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={handleBack}
        style={dynamicStyles.floatingButtonContainer}>
        <View style={dynamicStyles.floatingButton}>
          <AntDesign name="back" size={24} color="white" />
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
    width: "100%",
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
    flexDirection: "row",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  requestContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginRight: 10,
  },
  historyContainer: {
    flex: 2,
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
