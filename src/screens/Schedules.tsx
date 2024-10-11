import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { getStyleUtil } from "../utils/styleUtil";
import {
  getSchedulesTodayLocalDb,
  getSchedulesLocalDb,
  getSchedulesWeekLocalDb,
} from "../utils/localDbUtils";
import CallComponents from "./call/CallComponents";
import { getCurrentDatePH, formatDate } from "../utils/dateUtils";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";
import { useRefreshFetchDataContext } from "../context/RefreshFetchDataContext";

const Schedules = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scheduleDataToday, setScheduleDataToday] = useState<any[]>([]);
  const [scheduleWeekData, setScheduleWeekData] = useState<any[]>([]);

  const [selectedScheduleToday, setSelectedScheduleToday] = useState<
    any | null
  >(null);
  const [selectedScheduleWeek, setSelectedScheduleWeek] = useState<any | null>(
    null
  );

  const [accordionTodayExpanded, setAccordionTodayExpanded] = useState(false);
  const [accordionWeekExpanded, setAccordionWeekExpanded] = useState(false);
  const [currentDate, getCurrentDate] = useState("");
  const { authState } = useAuth();
  const { refresh } = useRefreshFetchDataContext();
  const dynamicStyles = getStyleUtil({});
  const fetchScheduleData = async () => {
    if (authState.user) {
      try {
        const getDate = await getCurrentDatePH();
        const formattedDate = formatDate(getDate);
        getCurrentDate(moment(getDate).format("MMMM DD, dddd"));
        const data = await getSchedulesTodayLocalDb();
        setScheduleDataToday(data);

        // week schedules
        const weekData = await getSchedulesWeekLocalDb();
        setScheduleWeekData(weekData);
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
    }
  };

  const toggleAccordionWeek = () => {
    setAccordionWeekExpanded(!accordionWeekExpanded);
    if (!accordionWeekExpanded) {
      setSelectedScheduleWeek(null);
      setSelectedScheduleToday(null);
    }
  };

  const handleScheduleClickToday = (schedule: any) => {
    setSelectedScheduleWeek(null);
    setSelectedScheduleToday(schedule);
  };

  const handleScheduleClickWeek = (schedule: any) => {
    setSelectedScheduleToday(null);
    setSelectedScheduleWeek(schedule);
  };

  useEffect(() => {
    if (refresh) {
      fetchScheduleData();
      setSelectedScheduleToday(null);
      setSelectedScheduleWeek(null);
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
      <View style={styles1.row}>
        <View style={styles1.column1}>
          <View style={dynamicStyles.card1Col}>
            <Text style={styles1.columnTitle}>Schedules</Text>
            <Text style={styles1.columnSubTitle}>{currentDate}</Text>
            <ScrollView>
              <TouchableOpacity
                onPress={toggleAccordionToday}
                style={styles1.accordionButton}>
                <Text style={styles1.accordionTitle}>
                  {accordionTodayExpanded ? "Hide Today" : "View Today"}
                </Text>
                <Ionicons
                  name={accordionTodayExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#007BFF"
                  style={styles1.icon}
                />
              </TouchableOpacity>

              {accordionTodayExpanded && (
                <View style={styles1.accordionContent}>
                  {scheduleDataToday.map((schedule) => (
                    <TouchableOpacity
                      key={schedule.schedule_id}
                      onPress={() => handleScheduleClickToday(schedule)}
                      style={styles1.scheduleItem}>
                      <Text style={styles1.scheduleText}>
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
                style={styles1.accordionButton}>
                <Text style={styles1.accordionTitle}>
                  {accordionWeekExpanded ? "Hide This Week" : "View This Week"}
                </Text>
                <Ionicons
                  name={accordionWeekExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#007BFF"
                  style={styles1.icon}
                />
              </TouchableOpacity>

              {accordionWeekExpanded && (
                <View style={styles1.accordionContent}>
                  {scheduleWeekData.map((schedule) => (
                    <TouchableOpacity
                      key={schedule.schedule_id}
                      onPress={() => handleScheduleClickWeek(schedule)}
                      style={styles1.scheduleItem}>
                      <Text style={styles1.scheduleText}>
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

        <View style={styles1.column2}>
          <View style={dynamicStyles.card2Col}>
            {selectedScheduleToday || selectedScheduleWeek ? (
              <>
                {selectedScheduleToday ? (
                  <>
                    <Text style={styles1.columnTitle}>
                      {String(selectedScheduleToday.full_name)}
                    </Text>
                    <Text style={styles1.columnSubTitle}>
                      {moment(selectedScheduleToday.date).format(
                        "MMMM DD, dddd"
                      )}
                    </Text>
                    <Text style={styles1.columnSubTitle}>
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
                    <Text style={styles1.columnTitle}>
                      {String(selectedScheduleWeek.full_name)}
                    </Text>
                    <Text style={styles1.columnSubTitle}>
                      {moment(selectedScheduleWeek.date).format(
                        "MMMM DD, dddd"
                      )}
                    </Text>
                    <Text style={styles1.columnSubTitle}>
                      {selectedScheduleWeek.municipality_city} {" - "}
                      {selectedScheduleWeek.province}
                    </Text>
                    <CallComponents
                      scheduleId={String(selectedScheduleWeek.schedule_id)}
                      docName={String(selectedScheduleWeek.full_name)}
                      canStartCall={false}
                    />
                  </>
                ) : null}
              </>
            ) : (
              <NoScheduleSelected />
            )}
          </View>
        </View>
      </View>
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
    paddingHorizontal: 30,
    paddingVertical: 40,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 2, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
  accordionContent: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
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
