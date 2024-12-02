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
import Entypo from "@expo/vector-icons/Entypo";

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
import { calculateDuration, getBase64StringFormat } from "../utils/commonUtil";
import LoadingSub from "../components/LoadingSub";
const dynamicStyles = getStyleUtil({});
// todo : add date filter to view actual details (whole month)
// todo : fix design
const ActualCalls = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callData, setCallsData] = useState<any[]>([]);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const [accordionExpandedFilter, setAccordionExpandedFilter] = useState(false);
  const [currentDate, getCurrentDate] = useState("");
  const [feedback, setFeedback] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [scheduleIdValue, setScheduleIdValue] = useState<string>("");
  const [cardActiveId, setCardActiveId] = useState<string>("");
  const [cardActiveDate, setCardActiveDate] = useState<string>("");
  const [timeOutLoading, setTimeOutLoading] = useState<boolean>(true);
  const { isActualLoading } = useDataContext();
  const [isInternalActualLoading, setIsInternalActualLoading] =
    useState<boolean>(false);

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
  const getDate = getCurrentDatePH();

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
        getCurrentDate(moment(await getDate).format("MMMM DD, dddd"));
        const actualData = await getCallsTodayLocalDb();
        setCallsData(actualData);
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
    setCardActiveId(call.id);
    setCardActiveDate(call.date);
    setIsInternalActualLoading(true);
    try {
      const postCallData = await getPostCallNotesLocalDb(call.schedule_id);
      if (postCallData) {
        setFeedback(postCallData.feedback || "");
        setSelectedMood(postCallData.mood || "");
      } else {
        setFeedback("");
        setSelectedMood("");
      }
      setSelectedCall(call);
      setScheduleIdValue(call.schedule_id);
    } catch (error) {
      console.error("Error fetching call data:", error);
    } finally {
      setIsInternalActualLoading(false);
    }
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

  const moodToIconMap = {
    hot: "emoji-happy",
    warm: "emoji-neutral",
    cold: "emoji-sad",
  };

  const moodOptions = [{ mood: "hot" }, { mood: "warm" }, { mood: "cold" }];
  return (
    <View style={dynamicStyles.container}>
      {isActualLoading || timeOutLoading ? (
        <Loading />
      ) : (
        <View style={dynamicStyles.row}>
          <View style={dynamicStyles.column1}>
            <View style={dynamicStyles.card1Col}>
              <Text style={dynamicStyles.columnTitle}>Actual Calls</Text>
              <Text style={dynamicStyles.columnSubTitle}>{currentDate}</Text>
              <ScrollView>
                <View style={dynamicStyles.filterMainContainer}>
                  <TouchableOpacity
                    onPress={toggleAccordionFilter}
                    style={dynamicStyles.accordionButton}>
                    <Text style={dynamicStyles.accordionTitle}>
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
                    <>
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
                      <View style={dynamicStyles.accordionContent}>
                        {actualFilterData.length === 0 ? (
                          <Text>No calls found or select date first.</Text>
                        ) : (
                          actualFilterData.map((actual) => (
                            <TouchableOpacity
                              key={actual.id}
                              onPress={() => {
                                handleCallClick(actual);
                              }}
                              style={{
                                ...(actual.done == "1" &&
                                  dynamicStyles.cardDoneItems),
                                ...(actual.done != "1" &&
                                  dynamicStyles.cardItems),
                                ...(cardActiveId === actual.id &&
                                  cardActiveDate === actual.date &&
                                  dynamicStyles.activeCardItems),
                              }}>
                              <Text
                                style={{
                                  ...(actual.done == "1" &&
                                    dynamicStyles.cardDoneItemText),
                                  ...(actual.done != "1" &&
                                    dynamicStyles.cardItemText),
                                  ...(cardActiveId === actual.id &&
                                    cardActiveDate === actual.date &&
                                    dynamicStyles.activeCardItemsText),
                                }}>
                                {`${actual.doctors_name} \n${moment(
                                  actual.created_at
                                ).format("MMMM DD YYYY")} `}{" "}
                                {cardActiveId === actual.id &&
                                  cardActiveDate === actual.date &&
                                  actual.done == "1" && (
                                    <Ionicons
                                      name="cloud-done"
                                      style={{
                                        alignSelf: "center",
                                      }}
                                      size={20}
                                      color="green"
                                    />
                                  )}
                                {actual.done == "1" && (
                                  <Ionicons
                                    name="cloud-done"
                                    style={{
                                      alignSelf: "center",
                                      marginLeft: 10,
                                    }}
                                    size={20}
                                    color="white"
                                  />
                                )}
                              </Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    </>
                  )}
                </View>

                <TouchableOpacity
                  onPress={toggleAccordion}
                  style={dynamicStyles.accordionButton}>
                  <Text style={dynamicStyles.accordionTitle}>
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
                  <View style={dynamicStyles.accordionContent}>
                    {callData.map((call) => (
                      <TouchableOpacity
                        key={call.id}
                        onPress={() => handleCallClick(call)}
                        style={{
                          ...(call.done == "1" && dynamicStyles.cardDoneItems),
                          ...(call.done != "1" && dynamicStyles.cardItems),
                          ...(cardActiveId === call.id &&
                            dynamicStyles.activeCardItems),
                        }}>
                        <View style={dynamicStyles.row}>
                          <Text
                            style={{
                              ...(call.done == "1" &&
                                dynamicStyles.cardDoneItemText),
                              ...(call.done != "1" &&
                                dynamicStyles.cardItemText),
                              ...(cardActiveId === call.id &&
                                cardActiveDate === call.date &&
                                dynamicStyles.activeCardItemsText),
                            }}>
                            {`${call.doctors_name} \n${moment(
                              call.created_date
                            ).format("MMMM DD YYYY")}  `}

                            {cardActiveId === call.id &&
                              cardActiveDate === call.date &&
                              call.done == "1" && (
                                <Ionicons
                                  name="cloud-done"
                                  style={{
                                    alignSelf: "center",
                                    marginLeft: 10,
                                  }}
                                  size={20}
                                  color="green"
                                />
                              )}

                            {call.done == "1" && (
                              <Ionicons
                                name="cloud-done"
                                style={{
                                  alignSelf: "center",
                                  marginLeft: 10,
                                }}
                                size={20}
                                color="white"
                              />
                            )}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>

          <View style={dynamicStyles.column2}>
            <View style={dynamicStyles.card2Col}>
              {selectedCall && !isInternalActualLoading ? (
                <>
                  {/* <CallDetails call={selectedCall} /> */}
                  <View style={dynamicStyles.inner2ActualContainer}>
                    <ScrollView>
                      <View>
                        <Text style={styles1.detailsTitle}>Call Details</Text>
                        <View style={styles1.detailRow}>
                          <Text style={styles1.detailLabel}>
                            Scheduled date:{" "}
                          </Text>
                          <Text style={dynamicStyles.columnSubTitle}>
                            {formatDatev1(selectedCall.date)}
                          </Text>
                        </View>
                        <View style={styles1.detailRow}>
                          <Text style={styles1.detailLabel}>
                            Call duration:{" "}
                          </Text>
                          <Text style={dynamicStyles.columnSubTitle}>
                            {calculateDuration(
                              selectedCall.call_start,
                              selectedCall.call_end
                            )}
                          </Text>
                        </View>
                        <View style={styles1.detailRow}>
                          <Text style={styles1.detailLabel}>
                            Doctors name:{" "}
                          </Text>
                          <Text style={dynamicStyles.columnSubTitle}>
                            {selectedCall.doctors_name}
                          </Text>
                        </View>
                        <View style={styles1.detailRow}>
                          <Text style={styles1.detailLabel}>Photo:</Text>
                          {selectedCall.photo && (
                            <Image
                              source={{
                                uri: `${getBase64StringFormat()}${
                                  selectedCall.photo
                                }`,
                              }}
                              style={[dynamicStyles.image, { margin: 20 }]}
                            />
                          )}
                        </View>
                        <View style={styles1.detailRow}>
                          <Text style={styles1.detailLabel}>Signature:</Text>
                          {selectedCall.signature && (
                            <>
                              <Image
                                source={{
                                  uri: `${getBase64StringFormat()}${
                                    selectedCall.signature
                                  }`,
                                }}
                                style={[
                                  dynamicStyles.signImageActual,
                                  { marginTop: 25 },
                                ]}
                              />
                            </>
                          )}
                        </View>
                      </View>
                      <View style={styles1.headerRow}>
                        <Text style={styles1.sectionTitle}>Edit Post Call</Text>
                        <TouchableOpacity
                          onPress={savePostCallData}
                          style={[
                            styles1.buttonPostCallSave,
                            dynamicStyles.subBgColor,
                            { marginEnd: 5 },
                          ]}>
                          <Text style={dynamicStyles.buttonText}>Save</Text>
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
                        {moodOptions.map((option) => (
                          <TouchableOpacity
                            key={option.mood}
                            style={[
                              styles1.radioButtonContainer,
                              selectedMood === option.mood &&
                                styles1.radioButtonSelected,
                            ]}
                            onPress={() => setSelectedMood(option.mood)}>
                            <Entypo
                              name={(moodToIconMap as any)[option.mood]}
                              size={20}
                              style={[
                                styles1.radioButtonText,
                                selectedMood === option.mood &&
                                  styles1.radioButtonTextSelected,
                              ]}
                            />
                            <Text
                              style={[
                                styles1.radioButtonText,
                                selectedMood === option.mood &&
                                  styles1.radioButtonTextSelected,
                              ]}>
                              {option.mood.charAt(0).toUpperCase() +
                                option.mood.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                </>
              ) : isInternalActualLoading ? (
                <LoadingSub />
              ) : (
                <NoActualCallSelected />
              )}
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
    height: 60,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 15,
    textAlignVertical: "top",
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
    resizeMode: "stretch",
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
