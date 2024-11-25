import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Button,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getStyleUtil } from "../utils/styleUtil";
import {
  getSchedulesTodayLocalDb,
  getSchedulesLocalDb,
  getSchedulesWeekLocalDb,
  getSchedulesFilterLocalDb,
  getAllSchedulesFilterLocalDb,
  getSchedulesMakeupLocalDb,
} from "../utils/localDbUtils";
import CallComponents from "./call/CallComponents";
import { getCurrentDatePH, formatDate } from "../utils/dateUtils";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { useRefreshFetchDataContext } from "../context/RefreshFetchDataContext";
import Loading from "../components/Loading";
import { useDataContext } from "../context/DataContext";
import { Picker } from "@react-native-picker/picker";
import LoadingSub from "../components/LoadingSub";

const Schedules = () => {
  const { isScheduleLoading, detailersRecord } = useDataContext();
  // todo : detailersRecord
  const [timeOutLoading, setTimeOutLoading] = useState<boolean>(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeOutLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  const dynamicStyles = getStyleUtil({});
  const [error, setError] = useState<string | null>(null);
  const [scheduleDataToday, setScheduleDataToday] = useState<any[]>([]);
  const [scheduleWeekData, setScheduleWeekData] = useState<any[]>([]);
  const [scheduleFilterData, setScheduleFilterData] = useState<any[]>([]);
  const [scheduleAllFilterData, setScheduleAllFilterData] = useState<any[]>([]);
  const [scheduleMakeupData, setScheduleMakeupData] = useState<any[]>([]);

  const [selectedScheduleToday, setSelectedScheduleToday] = useState<
    any | null
  >(null);
  const [selectedScheduleWeek, setSelectedScheduleWeek] = useState<any | null>(
    null
  );
  const [selectedScheduleFilter, setSelectedScheduleFilter] = useState<
    any | null
  >(null);
  const [selectedScheduleMakeup, setSelectedScheduleMakeup] = useState<
    any | null
  >(null);

  const [accordionTodayExpanded, setAccordionTodayExpanded] = useState(false);
  const [accordionWeekExpanded, setAccordionWeekExpanded] = useState(false);
  const [accordionFilterExpanded, setAccordionFilterExpanded] = useState(false);
  const [accordionMakeupExpanded, setAccordionMakeupExpanded] = useState(false);
  const [currentDate, getCurrentDate] = useState("");
  const { authState } = useAuth();
  const { refresh } = useRefreshFetchDataContext();
  const [isInternalSchedLoading, setIsInternalSchedLoading] =
    useState<boolean>(false);

  const uniqueDates = Array.from(
    new Set(scheduleFilterData.map((item) => formatDate(item.date)))
  );

  const [cardActiveId, setCardActiveId] = useState<string>("");
  const [cardActiveDate, setCardActiveDate] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<string>("");
  const fetchScheduleData = async () => {
    if (authState.user) {
      try {
        // today schedules
        const getDate = await getCurrentDatePH();
        const formattedDate = formatDate(getDate);
        getCurrentDate(moment(getDate).format("MMMM DD, dddd"));
        const data = await getSchedulesTodayLocalDb();
        setScheduleDataToday(data);
        // week schedules
        const weekData = await getSchedulesWeekLocalDb();
        setScheduleWeekData(weekData);
        // filter schedules
        const filterData = await getAllSchedulesFilterLocalDb();
        setScheduleAllFilterData(filterData);
        // for makeup schedules
        const makeUpData = await getSchedulesMakeupLocalDb();
        setScheduleMakeupData(makeUpData);
      } catch (error: any) {
        console.log("fetchScheduleData error", error);
      }
    }
  };

  useEffect(() => {
    if (authState.authenticated && authState.user) {
      fetchScheduleData();
    }
  }, [authState]);

  const toggleAccordionToday = () => {
    setAccordionTodayExpanded(!accordionTodayExpanded);
    if (!accordionTodayExpanded) {
      setSelectedScheduleToday(null);
      setSelectedScheduleWeek(null);
      setSelectedScheduleFilter(null);
      setSelectedScheduleMakeup(null);
    }
  };

  const toggleAccordionWeek = () => {
    setAccordionWeekExpanded(!accordionWeekExpanded);
    if (!accordionWeekExpanded) {
      setSelectedScheduleWeek(null);
      setSelectedScheduleToday(null);
      setSelectedScheduleFilter(null);
      setSelectedScheduleMakeup(null);
    }
  };
  const toggleAccordionMakeup = () => {
    setAccordionMakeupExpanded(!accordionMakeupExpanded);
    if (!accordionMakeupExpanded) {
      setSelectedScheduleWeek(null);
      setSelectedScheduleToday(null);
      setSelectedScheduleFilter(null);
      setSelectedScheduleMakeup(null);
    }
  };

  const toggleAccordionFilter = () => {
    setAccordionFilterExpanded(!accordionFilterExpanded);
    if (!accordionFilterExpanded) {
      setSelectedScheduleWeek(null);
      setSelectedScheduleToday(null);
      setSelectedScheduleFilter(null);
      setSelectedScheduleMakeup(null);
    }
  };

  const handleScheduleClickToday = (schedule: any) => {
    setCardActiveId(schedule.id);
    setCardActiveDate(schedule.date);
    setIsInternalSchedLoading(true);
    try {
      setSelectedScheduleToday(schedule);
      setSelectedScheduleWeek(null);
      setSelectedScheduleFilter(null);
      setSelectedScheduleMakeup(null);
    } catch (error) {
      console.log("error schedule today");
    } finally {
      setTimeout(() => setIsInternalSchedLoading(false), 300);
    }
  };

  const handleScheduleClickWeek = (schedule: any) => {
    setCardActiveId(schedule.id);
    setCardActiveDate(schedule.date);
    setIsInternalSchedLoading(true);
    try {
      setSelectedScheduleToday(null);
      setSelectedScheduleWeek(schedule);
      setSelectedScheduleFilter(null);
      setSelectedScheduleMakeup(null);
    } catch (error) {
      console.log("error schedule week");
    } finally {
      setTimeout(() => setIsInternalSchedLoading(false), 300);
    }
  };

  const handleScheduleClickFilter = (schedule: any) => {
    setCardActiveId(schedule.id);
    setCardActiveDate(schedule.date);
    setIsInternalSchedLoading(true);
    try {
      setSelectedScheduleFilter(schedule);
      setSelectedScheduleToday(null);
      setSelectedScheduleWeek(null);
      setSelectedScheduleMakeup(null);
    } catch (error) {
      console.log("error schedule filter");
    } finally {
      setTimeout(() => setIsInternalSchedLoading(false), 300);
    }
  };
  const handleScheduleClickMakeup = (schedule: any) => {
    setCardActiveId(schedule.id);
    setCardActiveDate(schedule.date);
    setIsInternalSchedLoading(true);
    try {
      setSelectedScheduleMakeup(schedule);
      setSelectedScheduleToday(null);
      setSelectedScheduleWeek(null);
      setSelectedScheduleFilter(null);
    } catch (error) {
      console.log("error schedule make up");
    } finally {
      setTimeout(() => setIsInternalSchedLoading(false), 300);
    }
  };

  const fetchFilterSchedule = async (itemValue: string) => {
    try {
      const date = new Date(itemValue);
      const filterData = await getSchedulesFilterLocalDb(date);
      setScheduleFilterData(filterData);
      setSelectedDate(itemValue);
    } catch (error) {
      console.error("Error fetching filtered schedules:", error);
    }
  };

  useEffect(() => {
    if (refresh) {
      fetchScheduleData();
      setSelectedScheduleToday(null);
      setSelectedScheduleWeek(null);
      setSelectedScheduleFilter(null);
      setSelectedScheduleMakeup(null);
    }
  }, [refresh]);

  const NoScheduleSelected = () => {
    return (
      <View style={styles1.containerNoSched}>
        <Ionicons
          name="information-circle"
          size={24}
          color="#007BFF"
          style={styles1.iconNoSched}
        />
        <Text style={styles1.messageNoSched}>
          Select a schedule to view details
        </Text>
      </View>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      {isScheduleLoading || timeOutLoading ? (
        <Loading />
      ) : (
        <View style={dynamicStyles.row}>
          <View style={dynamicStyles.column1}>
            <View style={dynamicStyles.card1Col}>
              <Text style={dynamicStyles.columnTitle}>Schedules</Text>
              <Text style={dynamicStyles.columnSubTitle}>{currentDate}</Text>
              <ScrollView>
                <View style={dynamicStyles.filterMainContainer}>
                  <TouchableOpacity
                    onPress={toggleAccordionFilter}
                    style={dynamicStyles.accordionButton}>
                    <Text style={dynamicStyles.accordionTitle}>
                      {accordionFilterExpanded ? "Hide Filter" : "View Filter"}
                    </Text>
                    <Ionicons
                      name={
                        accordionFilterExpanded ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color="#007BFF"
                      style={dynamicStyles.icon}
                    />
                  </TouchableOpacity>
                  {accordionFilterExpanded && (
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
                              scheduleAllFilterData.map((item) => [
                                moment(item.date).format("YYYY-MM-DD"),
                                item,
                              ])
                            ).values(),
                          ].map((item) => (
                            <Picker.Item
                              label={moment(item.date).format("MMMM DD, dddd")}
                              value={item.date}
                              key={item.id}
                              style={dynamicStyles.pickerLabel}
                            />
                          ))}
                        </Picker>
                      </View>
                      <View style={dynamicStyles.accordionContent}>
                        {scheduleFilterData.length === 0 ? (
                          <Text>No schedules found or select date first.</Text>
                        ) : (
                          scheduleFilterData.map((scheduleFilter) => (
                            <TouchableOpacity
                              key={scheduleFilter.schedule_id}
                              onPress={() =>
                                handleScheduleClickFilter(scheduleFilter)
                              }
                              style={{
                                ...(scheduleFilter.done !== "1" &&
                                  dynamicStyles.cardItems),
                                ...(cardActiveId === scheduleFilter.id &&
                                  cardActiveDate === scheduleFilter.date &&
                                  dynamicStyles.activeCardItems),
                              }}>
                              <Text
                                style={{
                                  ...(cardActiveId === scheduleFilter.id &&
                                    cardActiveDate === scheduleFilter.date &&
                                    dynamicStyles.activeCardItemsText),
                                }}>
                                {`${moment(scheduleFilter.date).format(
                                  "MMMM DD, dddd"
                                )}, `}
                                {`\n${scheduleFilter.full_name}, ${
                                  scheduleFilter.municipality_city
                                    ? `${scheduleFilter.municipality_city}`
                                    : ""
                                }`}
                              </Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  onPress={toggleAccordionToday}
                  style={dynamicStyles.accordionButton}>
                  <Text style={dynamicStyles.accordionTitle}>
                    {accordionTodayExpanded ? "Hide Today" : "View Today"}
                  </Text>
                  <Ionicons
                    name={
                      accordionTodayExpanded ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color="#007BFF"
                    style={dynamicStyles.icon}
                  />
                </TouchableOpacity>

                {accordionTodayExpanded && (
                  <View style={dynamicStyles.accordionContent}>
                    {scheduleDataToday.map((schedule) => (
                      <TouchableOpacity
                        key={schedule.schedule_id}
                        onPress={() => handleScheduleClickToday(schedule)}
                        style={{
                          ...(schedule.done !== "1" && dynamicStyles.cardItems),
                          ...(cardActiveId === schedule.id &&
                            cardActiveDate === schedule.date &&
                            dynamicStyles.activeCardItems),
                        }}>
                        <Text
                          style={{
                            ...(cardActiveId === schedule.id &&
                              cardActiveDate === schedule.date &&
                              dynamicStyles.activeCardItemsText),
                          }}>
                          {schedule.full_name}
                          {`${
                            schedule.municipality_city
                              ? ` - ${schedule.municipality_city} - ${schedule.province}`
                              : ""
                          }`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  onPress={toggleAccordionWeek}
                  style={dynamicStyles.accordionButton}>
                  <Text style={dynamicStyles.accordionTitle}>
                    {accordionWeekExpanded
                      ? "Hide This Week"
                      : "View This Week"}
                  </Text>
                  <Ionicons
                    name={accordionWeekExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#007BFF"
                    style={dynamicStyles.icon}
                  />
                </TouchableOpacity>

                {accordionWeekExpanded && (
                  <View style={dynamicStyles.accordionContent}>
                    {scheduleWeekData.map((schedule) => (
                      <TouchableOpacity
                        key={schedule.schedule_id}
                        onPress={() => handleScheduleClickWeek(schedule)}
                        style={{
                          ...(schedule.done !== "1" && dynamicStyles.cardItems),
                          ...(cardActiveId === schedule.id &&
                            cardActiveDate === schedule.date &&
                            dynamicStyles.activeCardItems),
                        }}>
                        <Text
                          style={{
                            ...(cardActiveId === schedule.id &&
                              cardActiveDate === schedule.date &&
                              dynamicStyles.activeCardItemsText),
                          }}>
                          {`${moment(schedule.date).format("MMMM DD, dddd")}, `}
                          {`\n${schedule.full_name}, ${
                            schedule.municipality_city
                              ? `${schedule.municipality_city}`
                              : ""
                          }`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {/* make up data */}
                <TouchableOpacity
                  onPress={toggleAccordionMakeup}
                  style={dynamicStyles.accordionButton}>
                  <Text style={dynamicStyles.accordionTitle}>
                    {accordionMakeupExpanded
                      ? "Hide Make up schedule"
                      : "View Make up schedule"}
                  </Text>
                  <Ionicons
                    name={
                      accordionMakeupExpanded ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color="#007BFF"
                    style={dynamicStyles.icon}
                  />
                </TouchableOpacity>

                {accordionMakeupExpanded && (
                  <View style={dynamicStyles.accordionContent}>
                    {scheduleMakeupData.map((schedule) => (
                      <TouchableOpacity
                        key={schedule.schedule_id}
                        onPress={() => handleScheduleClickMakeup(schedule)}
                        style={{
                          ...(schedule.done !== "1" && dynamicStyles.cardItems),
                          ...(cardActiveId === schedule.id &&
                            cardActiveDate === schedule.date &&
                            dynamicStyles.activeCardItems),
                        }}>
                        <Text
                          style={{
                            ...(cardActiveId === schedule.id &&
                              cardActiveDate === schedule.date &&
                              dynamicStyles.activeCardItemsText),
                          }}>
                          {`${moment(schedule.date).format("MMMM DD, dddd")}, `}
                          {`\n${schedule.full_name}, ${
                            schedule.municipality_city
                              ? `${schedule.municipality_city}`
                              : ""
                          }`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>

          <View style={dynamicStyles.column2}>
            <View style={dynamicStyles.card2Col}>
              {(selectedScheduleToday ||
                selectedScheduleWeek ||
                selectedScheduleFilter ||
                selectedScheduleMakeup) &&
              !isInternalSchedLoading ? (
                <>
                  {selectedScheduleToday ? (
                    <>
                      <Text style={dynamicStyles.columnTitle}>
                        {String(selectedScheduleToday.full_name)}
                      </Text>
                      <Text style={dynamicStyles.columnSubTitle}>
                        {moment(selectedScheduleToday.date).format(
                          "MMMM DD, dddd"
                        )}
                      </Text>
                      <Text style={dynamicStyles.columnSubTitle}>
                        {selectedScheduleToday.municipality_city} {" - "}
                        {selectedScheduleToday.province}
                      </Text>
                      <CallComponents
                        scheduleId={String(selectedScheduleToday.schedule_id)}
                        docName={String(selectedScheduleToday.full_name)}
                        canStartCall={true}
                      />
                    </>
                  ) : null}

                  {selectedScheduleWeek ? (
                    <>
                      <Text style={dynamicStyles.columnTitle}>
                        {String(selectedScheduleWeek.full_name)}
                      </Text>
                      <Text style={dynamicStyles.columnSubTitle}>
                        {moment(selectedScheduleWeek.date).format(
                          "MMMM DD, dddd"
                        )}
                      </Text>
                      <Text style={dynamicStyles.columnSubTitle}>
                        {selectedScheduleWeek.municipality_city} {" - "}
                        {selectedScheduleWeek.province}
                      </Text>
                      <CallComponents
                        scheduleId={String(selectedScheduleWeek.schedule_id)}
                        docName={String(selectedScheduleWeek.full_name)}
                        canStartCall={true}
                      />
                    </>
                  ) : null}

                  {selectedScheduleFilter ? (
                    <>
                      <Text style={dynamicStyles.columnTitle}>
                        {String(selectedScheduleFilter.full_name)}
                      </Text>
                      <Text style={dynamicStyles.columnSubTitle}>
                        {moment(selectedScheduleFilter.date).format(
                          "MMMM DD, dddd"
                        )}
                      </Text>
                      <Text style={dynamicStyles.columnSubTitle}>
                        {selectedScheduleFilter.municipality_city} {" - "}
                        {selectedScheduleFilter.province}
                      </Text>
                      <CallComponents
                        scheduleId={String(selectedScheduleFilter.schedule_id)}
                        docName={String(selectedScheduleFilter.full_name)}
                        canStartCall={false}
                      />
                    </>
                  ) : null}

                  {selectedScheduleMakeup ? (
                    <>
                      <Text style={dynamicStyles.columnTitle}>
                        {String(selectedScheduleMakeup.full_name)}
                      </Text>
                      <Text style={dynamicStyles.columnSubTitle}>
                        {moment(selectedScheduleMakeup.date).format(
                          "MMMM DD, dddd"
                        )}
                      </Text>
                      <Text style={dynamicStyles.columnSubTitle}>
                        {selectedScheduleMakeup.municipality_city} {" - "}
                        {selectedScheduleMakeup.province}
                      </Text>
                      <CallComponents
                        scheduleId={String(selectedScheduleMakeup.schedule_id)}
                        docName={String(selectedScheduleMakeup.full_name)}
                        canStartCall={true}
                      />
                    </>
                  ) : null}
                </>
              ) : isInternalSchedLoading ? (
                <LoadingSub />
              ) : (
                <NoScheduleSelected />
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles1 = StyleSheet.create({
  scheduleItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginVertical: 4,
  },
  scheduleText: {
    fontSize: 16,
    color: "#343a40",
  },
  containerNoSched: {
    flex: 1,
    alignItems: "center",
    padding: 50,
    backgroundColor: "#e9ecef",
    borderRadius: 10,
    borderColor: "#046E37",
    borderWidth: 1,
  },
  iconNoSched: {
    marginBottom: 10,
    color: "#046E37",
  },
  messageNoSched: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#046E37",
    textAlign: "center",
  },
});

export default Schedules;
