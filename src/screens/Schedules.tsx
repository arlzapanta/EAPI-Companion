import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth, getStyleUtil } from "../index";
import { getScheduleAPIRecordsLocalDb } from "../utils/localDbUtils";
import CallComponents from "../components/CallComponents";
import { getCurrentDatePH, formatDate } from "../utils/dateUtils";
import moment from "moment";

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
        getCurrentDate(getDate);
        const data = await getScheduleAPIRecordsLocalDb();
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
    console.log("Toggling accordion:", accordionExpanded);
    setAccordionExpanded(!accordionExpanded);
  };

  const handleScheduleClick = (schedule: any) => {
    setSelectedSchedule(schedule);
  };

  return (
    <View style={styles.container}>
      <View style={styles1.row}>
        <View style={styles1.column1}>
          <View style={styles1.innerCard}>
            <Text style={styles1.columnTitle}>Schedules</Text>

            <TouchableOpacity onPress={toggleAccordion}>
              <Text style={styles1.accordionTitle}>
                {accordionExpanded ? "Hide Today" : "View Today"}
              </Text>
            </TouchableOpacity>

            {accordionExpanded && (
              <View style={styles1.accordionContent}>
                {scheduleData.map((schedule) => (
                  <TouchableOpacity
                    key={schedule.schedule_id}
                    onPress={() => handleScheduleClick(schedule)}
                    style={styles1.scheduleItem}>
                    <Text>
                      {schedule.full_name}
                      {`${
                        schedule.municipality_city
                          ? ` - ${schedule.municipality_city} / ${schedule.province}`
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
            {/* add start call here */}
            {selectedSchedule ? (
              <>
                <Text style={styles1.columnTitle}>
                  {String(selectedSchedule.full_name)} {currentDate}
                </Text>
                <CallComponents
                  scheduleId={String(selectedSchedule.schedule_id)}
                />
              </>
            ) : (
              <Text>Select a schedule to view details</Text>
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
    padding: 20,
  },
  row: {
    flexDirection: "row",
    flex: 1,
  },
  column1: {
    width: "30%",
    padding: 8,
  },
  column2: {
    width: "70%",
    padding: 8,
  },
  innerCard: {
    height: "100%",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  accordionTitle: {
    fontSize: 16,
    color: "#007BFF",
    marginBottom: 10,
  },
  scheduleItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  accordionContent: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  startCallButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  startDetailerButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  preCallSection: {
    marginTop: 20,
  },
  preCallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  preCallTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  preCallInput: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  noteItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  removeNote: {
    color: "red",
    marginLeft: 10,
  },
});

export default Schedules;
