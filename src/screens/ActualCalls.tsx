import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getStyleUtil } from "../utils/styleUtil";
import { customToast } from "../utils/customToast";

import {
  getActualFilterLocalDb,
  getAllActualDatesFilter,
  getCallsLocalDb,
  getCallsTodayLocalDb,
} from "../utils/localDbUtils";
import {
  getPostCallNotesLocalDb,
  savePostCallNotesLocalDb,
} from "../utils/callComponentsUtil";
import { formatDatev1, getCurrentDatePH } from "../utils/dateUtils";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import MapComponent from "../components/MapView";
import Icon from "react-native-vector-icons/Ionicons";
import Loading from "../components/Loading";
import { useDataContext } from "../context/DataContext";
import { Picker } from "@react-native-picker/picker";
import { getBase64StringFormat } from "../utils/commonUtil";
const dynamicStyles = getStyleUtil({});
// todo : add date filter to view actual details (whole month)
// todo : fix design
const ActualCalls = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callData, setCallsDate] = useState<any[]>([]);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const [accordionExpandedFilter, setAccordionExpandedFilter] = useState(false);
  const [currentDate, getCurrentDate] = useState("");
  const [feedback, setFeedback] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [scheduleIdValue, setScheduleIdValue] = useState<string>("");
  const [timeOutLoading, setTimeOutLoading] = useState<boolean>(true);
  const { isActualLoading } = useDataContext();
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeOutLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const styles = getStyleUtil({});
  const { authState } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [actualFilterData, setActualFilterData] = useState<any[]>([]);
  const [actualDatesFilterData, setActualDatesFilterData] = useState<any[]>([]);

  const fetchFilterSchedule = async (itemValue: string) => {
    try {
      const date = new Date(itemValue);
      const filterData = await getActualFilterLocalDb(date);
      setActualFilterData(filterData);
      setSelectedDate(itemValue);
    } catch (error) {
      console.error("Error fetching filtered Actuals:", error);
    }
  };

  const fetchActualCallsData = async () => {
    if (authState.user) {
      try {
        const getDate = await getCurrentDatePH();
        getCurrentDate(moment(getDate).format("MMMM DD, dddd"));
        const data = await getCallsLocalDb();
        setCallsDate(data);
        // filter
        const filterData = await getAllActualDatesFilter();
        setActualDatesFilterData(filterData);
      } catch (error: any) {
        console.log("fetchActualCallsData error", error);
      }
    }
  };

  useEffect(() => {
    if (authState.authenticated && authState.user) {
      fetchActualCallsData();
    }
  }, [authState]);

  const toggleAccordion = () => {
    setAccordionExpanded(!accordionExpanded);
    if (!accordionExpanded) {
      setSelectedCall(null);
    }
  };

  const toggleAccordionFilter = () => {
    setAccordionExpandedFilter(!accordionExpandedFilter);
    if (!accordionExpandedFilter) {
      setSelectedCall(null);
    }
  };

  const handleCallClick = async (call: any) => {
    setScheduleIdValue(call.schedule_id);
    const postCallData = await getPostCallNotesLocalDb(call.schedule_id);
    if (postCallData) {
      setFeedback(postCallData.feedback || "");
      setSelectedMood(postCallData.mood || "");
    } else {
      setFeedback("");
      setSelectedMood("");
    }
    setSelectedCall(call);
  };

  const savePostCallData = async () => {
    await savePostCallNotesLocalDb({
      mood: selectedMood,
      feedback,
      scheduleId: scheduleIdValue,
    });
    customToast("Post call updated");
  };

  const NoActualCallSelected = () => {
    return (
      <View style={styles1.containerNoCallData}>
        <Ionicons
          name="information-circle"
          size={24}
          color="#007BFF"
          style={styles1.iconNoCallData}
        />
        <Text style={styles1.messageNoCallData}>
          Select a call to view details
        </Text>
      </View>
    );
  };

  const CallDetails = ({ call }: { call: any }) => (
    <ScrollView>
      <View style={dynamicStyles.filterMainContainer}>
        <Text style={styles1.detailsTitle}>Call Details</Text>
        <View style={styles1.detailRow}>
          <Text style={styles1.detailLabel}>Scheduled date: </Text>
          <Text style={styles1.columnSubTitle}>
            {formatDatev1(call.created_at)}
          </Text>
        </View>
        <View style={styles1.detailRow}>
          <Text style={styles1.detailLabel}>Photo:</Text>
          {call.photo && (
            <Image
              source={{ uri: `${getBase64StringFormat()}${call.photo}` }}
              style={styles1.photo}
            />
          )}
        </View>
        <View style={styles1.detailRow}>
          <Text style={styles1.detailLabel}>Signature:</Text>
          {call.signature && (
            <>
              <Image
                source={{
                  uri: `${getBase64StringFormat()}${call.signature}`,
                }}
                style={styles1.signature}
              />
            </>
          )}
        </View>
      </View>
      <View style={dynamicStyles.filterMainContainer}>
        <View style={styles1.headerRow}>
          <Text style={styles1.sectionTitle}>Edit Post Call</Text>
          <TouchableOpacity
            onPress={savePostCallData}
            style={styles1.buttonPostCallSave}>
            <Text style={styles1.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <Text>Feedback</Text>
        <TextInput
          style={styles1.input}
          placeholder="Enter feedback"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={3}
        />
        <Text style={styles1.moodLabel}>Doctor's Mood:</Text>
        <View style={styles1.radioGroup}>
          {["cold", "warm", "hot"].map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[
                styles1.radioButtonContainer,
                selectedMood === mood && styles1.radioButtonSelected,
              ]}
              onPress={() => setSelectedMood(mood)}>
              <Text
                style={[
                  styles1.radioButtonText,
                  selectedMood === mood && styles1.radioButtonTextSelected,
                ]}>
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={dynamicStyles.container}>
      {isActualLoading || timeOutLoading ? (
        <Loading />
      ) : (
        <View style={styles1.row}>
          <View style={styles1.column1}>
            <View style={dynamicStyles.card1Col}>
              <Text style={styles1.columnTitle}>Actual Calls</Text>
              <Text style={styles1.columnSubTitle}>{currentDate}</Text>
              <ScrollView>
                <View style={dynamicStyles.filterMainContainer}>
                  <View style={dynamicStyles.filterContainer}>
                    <Picker
                      selectedValue={selectedDate}
                      onValueChange={(itemValue: string) =>
                        fetchFilterSchedule(itemValue)
                      }
                      style={dynamicStyles.picker1col}>
                      <Picker.Item
                        label="Select Date"
                        value=""
                        style={dynamicStyles.pickerInitialLabel}
                      />

                      {[
                        ...new Map(
                          actualDatesFilterData.map((item) => [
                            moment(item.created_at).format("YYYY-MM-DD"),
                            item,
                          ])
                        ).values(),
                      ].map((item) => (
                        <Picker.Item
                          label={moment(item.created_at).format(
                            "MMMM DD, dddd"
                          )}
                          value={item.created_at}
                          key={item.id}
                          style={dynamicStyles.pickerLabel}
                        />
                      ))}
                    </Picker>
                  </View>
                  <TouchableOpacity
                    onPress={toggleAccordionFilter}
                    style={styles1.accordionButton}>
                    <Text style={styles1.accordionTitle}>
                      {accordionExpandedFilter ? "Hide Filter" : "View Filter"}
                    </Text>
                    <Ionicons
                      name={
                        accordionExpandedFilter ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color="#007BFF"
                      style={styles1.icon}
                    />
                  </TouchableOpacity>
                  {accordionExpandedFilter && (
                    <View style={styles1.accordionContent}>
                      {actualFilterData.length === 0 ? (
                        <Text>No calls found or select date first.</Text>
                      ) : (
                        actualFilterData.map((actual) => (
                          <TouchableOpacity
                            key={actual.id}
                            onPress={() => handleCallClick(actual)}
                            style={styles1.callItem}>
                            <Text style={styles1.callText}>{`${
                              actual.doctors_name
                            } \n${moment(actual.created_at).format(
                              "MMMM DD YYYY"
                            )}`}</Text>
                          </TouchableOpacity>
                        ))
                      )}
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={toggleAccordion}
                  style={styles1.accordionButton}>
                  <Text style={styles1.accordionTitle}>
                    {accordionExpanded
                      ? "Hide Calls ( Today )"
                      : "View Calls ( Today )"}
                  </Text>
                  <Ionicons
                    name={accordionExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#007BFF"
                    style={styles1.icon}
                  />
                </TouchableOpacity>

                {accordionExpanded && (
                  <View style={styles1.accordionContent}>
                    {callData.map((call) => (
                      <TouchableOpacity
                        key={call.id}
                        onPress={() => handleCallClick(call)}
                        style={styles1.callItem}>
                        <Text style={styles1.callText}>{`${
                          call.doctors_name
                        } \n${moment(call.created_date).format(
                          "MMMM DD YYYY"
                        )}`}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>

          <View style={styles1.column2}>
            <View style={dynamicStyles.card2Col}>
              <View style={styles1.callDetailsContainer}>
                {selectedCall ? (
                  <CallDetails call={selectedCall} />
                ) : (
                  <NoActualCallSelected />
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles1 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  column1: {
    width: "30%",
  },
  column2: {
    width: "70%",
  },
  innerCard: {
    height: "100%",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    textAlignVertical: "top",
  },
  columnTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 8,
  },
  columnSubTitle: {
    fontSize: 16,
    color: "#6c757d",
  },
  accordionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e9ecef",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 10,
  },
  accordionTitle: {
    fontSize: 16,
    color: "#046E37",
  },
  icon: {
    marginLeft: 10,
    color: "#046E37",
  },

  callDetailsContainer: {
    flex: 1,
    borderRadius: 10,
  },
  accordionContent: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  callItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  callText: {
    fontSize: 16,
    color: "#495057",
  },
  detailsCard: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#343a40",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#343a40",
  },
  detailValue: {
    marginStart: 8,
    color: "#495057",
  },
  mapContainer: {
    marginTop: 20,
    height: 200, // Adjust the height as needed
    borderRadius: 10,
    overflow: "hidden",
  },
  mapWrapper: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  photo: {
    borderRadius: 10,
    width: 600,
    height: 300,
    marginTop: 10,
    marginHorizontal: 20,
    resizeMode: "cover",
  },
  signature: {
    marginTop: -50,
    marginBottom: -50,
    width: 600,
    height: 300,
    resizeMode: "contain",
  },
  containerNoCallData: {
    flex: 1,
    alignItems: "center",
    padding: 50,
    backgroundColor: "#e9ecef",
    borderRadius: 10,
    borderColor: "#046E37",
    borderWidth: 1,
  },
  iconNoCallData: {
    marginBottom: 10,
    color: "#046E37",
  },
  messageNoCallData: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#046E37",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cardContainer: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 20,
  },
  radioButtonContainer: {
    minWidth: 100,
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 10,
  },
  radioButtonSelected: {
    backgroundColor: "#046E37",
    borderColor: "#046E37",
  },
  radioButtonText: {
    color: "#333",
  },
  radioButtonTextSelected: {
    color: "#fff",
  },
  buttonPostCallSave: {
    backgroundColor: "#046E37",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  buttonContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
});

export default ActualCalls;
