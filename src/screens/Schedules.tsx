import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useAuth, getStyleUtil } from "../index";
import {
  getSchedulesTodayLocalDb,
  getSchedulesLocalDb,
} from "../utils/localDbUtils";
import CallComponents from "../components/CallComponents";
import { getCurrentDatePH, formatDate } from "../utils/dateUtils";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the icon

const Schedules = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const [currentDate, getCurrentDate] = useState("");

  const styles = getStyleUtil({});
  const { authState } = useAuth();

  const fetchScheduleData = async () => {
    if (authState.user) {
      try {
        const getDate = await getCurrentDatePH();
        const formattedDate = formatDate(getDate);
        getCurrentDate(moment(getDate).format("MMMM DD, dddd"));
        const data = await getSchedulesTodayLocalDb();
        setScheduleData(data);
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

  const toggleAccordion = () => {
    setAccordionExpanded(!accordionExpanded);
    if (!accordionExpanded) {
      setSelectedSchedule(null);
    }
  };

  const handleScheduleClick = (schedule: any) => {
    setSelectedSchedule(schedule);
  };

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
    <View style={styles1.container}>
      <View style={styles1.row}>
        <View style={styles1.column1}>
          <View style={styles1.innerCard}>
            <Text style={styles1.columnTitle}>Schedules</Text>
            <Text style={styles1.columnSubTitle}>{currentDate}</Text>
            <TouchableOpacity
              onPress={toggleAccordion}
              style={styles1.accordionButton}>
              <Text style={styles1.accordionTitle}>
                {accordionExpanded ? "Hide Today" : "View Today"}
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
                {scheduleData.map((schedule) => (
                  <TouchableOpacity
                    key={schedule.schedule_id}
                    onPress={() => handleScheduleClick(schedule)}
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
          </View>
        </View>

        <View style={styles1.column2}>
          <View style={styles1.innerCard}>
            {/* Add start call here */}
            {selectedSchedule ? (
              <>
                <Text style={styles1.columnTitle}>
                  {String(selectedSchedule.full_name)}
                </Text>
                <Text style={styles1.columnSubTitle}>
                  {moment(selectedSchedule.date).format("MMMM DD, dddd")}
                </Text>
                <Text style={styles1.columnSubTitle}>
                  {selectedSchedule.municipality_city} {" - "}
                  {selectedSchedule.province}
                </Text>
                <CallComponents
                  scheduleId={String(selectedSchedule.schedule_id)}
                />
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
    marginVertical: 10,
    marginStart: 20,
    marginEnd: 20,
  },
  column1: {
    width: "30%",
    marginEnd: 10,
    elevation: 5,
  },
  column2: {
    width: "70%",
    elevation: 5,
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
