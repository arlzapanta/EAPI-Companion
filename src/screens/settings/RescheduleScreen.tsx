import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
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
  getDoctorsSchedGTtodayLocalDb,
  getSchedDatesByDocId,
} from "../../utils/localDbUtils";
import { Picker } from "@react-native-picker/picker";
import {
  formatDatev1,
  formatDateYMD,
  generateFutureDates,
  getDateRangeGTToday,
  getMonthRangeExGTToday,
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
  const [isReschedLoading, setIsReschedLoading] = useState<boolean>(false);
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

    try {
      setIsReschedLoading(true);
      if (selectedDoctor) {
        const type = isWithinWeekOrAdvance(selectedDateTo, selectedDoctor.date);
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
          fromServer: false,
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
    } catch (error) {
    } finally {
      setIsReschedLoading(false);
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

  function mergeAndFilterDates(
    similarDates: string[],
    availableDates: string[]
  ): string[] {
    // console.log(similarDates, "inside");
    // console.log(availableDates, "inside1");

    const expandedDates = [];
    for (const dateStr of similarDates) {
      const [year, month, day] = dateStr.split("-").map(Number);

      const previousDay = new Date(year, month - 1, day - 1);
      const nextDay = new Date(year, month - 1, day + 1);

      expandedDates.push(
        previousDay.getFullYear() +
          "-" +
          (previousDay.getMonth() + 1).toString().padStart(2, "0") +
          "-" +
          previousDay.getDate().toString().padStart(2, "0"),
        dateStr,
        nextDay.getFullYear() +
          "-" +
          (nextDay.getMonth() + 1).toString().padStart(2, "0") +
          "-" +
          nextDay.getDate().toString().padStart(2, "0")
      );
    }

    similarDates = expandedDates;

    const filteredAvailableDates = availableDates.filter(
      (date) => !similarDates.includes(date)
    );

    // console.log(filteredAvailableDates, "result");
    return filteredAvailableDates;
  }

  return (
    <View style={dynamicStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          <View style={styles.requestContainer}>
            <Text style={styles.title}>Reschedule Request</Text>
            <View style={styles.dropdownContainer}>
              <Text style={dynamicStyles.mainText}>Select schedule/doctor</Text>
              <Picker
                style={styles.picker}
                selectedValue={selectedDoctor}
                onValueChange={async (itemValue: ScheduleAPIRecord | null) => {
                  setSelectedDateTo("selectedate");
                  if (itemValue !== selectedDoctor) {
                    setSelectedDoctor(itemValue);

                    if (itemValue && itemValue.date) {
                      let doctors_id = itemValue.doctors_id;
                      setSelectedDateTo(itemValue.date);
                      const dateToAvail = getDateRangeGTToday(itemValue.date);
                      const similarDocSchedDates = await getSchedDatesByDocId({
                        doctors_id,
                      });

                      const similarDocSchedDatesStrings: string[] =
                        Array.isArray(similarDocSchedDates)
                          ? similarDocSchedDates
                              .filter(
                                (item): item is { date: string } =>
                                  typeof item === "object" &&
                                  item !== null &&
                                  "date" in item
                              )
                              .map((item) => item.date)
                          : [];

                      console.log(
                        similarDocSchedDatesStrings,
                        "asdlkjaskjdsimilarDocSchedDatesStrings"
                      );

                      // console.log(similarDocSchedDatesStrings, "asdasd");
                      // console.log(dateToAvail, "dateToAvail");

                      const test = mergeAndFilterDates(
                        similarDocSchedDatesStrings,
                        dateToAvail
                      );

                      // console.log(test, "asdlkjaslkdjas");

                      setAvailableDates(test);
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
                      label={`${schedule.full_name} - ${formatDatev1(
                        schedule.date
                      )}`}
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

                {availableDates
                  .filter((date) => {
                    const selectedDate = new Date(date);
                    const today = new Date();
                    const dateToday = new Date(
                      today.getTime() + 0 * 24 * 60 * 60 * 1000
                      // today.getTime()
                    );
                    today.setHours(0, 0, 0, 0);
                    return selectedDate > dateToday;
                  })
                  .map((date) => (
                    <Picker.Item
                      label={formatDatev1(date)}
                      value={date}
                      key={date}
                      style={styles.pickerLabel}
                    />
                  ))}
              </Picker>

              {/* <TouchableOpacity
                style={[styles.saveButton, dynamicStyles.mainBgColor]}
                disabled={!selectedDateTo}
                onPress={handleSaveReschedule}>
                <Text style={styles.buttonText}>Add Request</Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                disabled={isReschedLoading || !selectedDateTo}
                style={[
                  dynamicStyles.buttonContainer,
                  isReschedLoading && dynamicStyles.isLoadingButtonContainer,
                ]}
                onPress={handleSaveReschedule}>
                {isReschedLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={dynamicStyles.buttonText}>Add Request</Text>
                )}
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
      {/* <TouchableOpacity
        onPress={handleBack}
        style={dynamicStyles.floatingButtonContainer}>
        <View style={dynamicStyles.floatingButton}>
          <AntDesign name="back" size={24} color="white" />
        </View>
      </TouchableOpacity> */}
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
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginVertical: 10,
    marginHorizontal: 10,
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
