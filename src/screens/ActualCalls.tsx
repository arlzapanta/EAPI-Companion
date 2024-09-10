import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { useAuth, getStyleUtil } from "../index";
import { getCallsTestLocalDb } from "../utils/localDbUtils";
import { getCurrentDatePH } from "../utils/dateUtils";
import moment from "moment";
import { Ionicons } from "@expo/vector-icons";

const ActualCalls = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callData, setCallsDate] = useState<any[]>([]);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const [currentDate, getCurrentDate] = useState("");

  const styles = getStyleUtil({});
  const { authState } = useAuth();

  const fetchActualCallsData = async () => {
    if (authState.user) {
      try {
        const getDate = await getCurrentDatePH();
        getCurrentDate(moment(getDate).format("MMMM DD, dddd"));
        const data = await getCallsTestLocalDb();
        setCallsDate(data);
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

  const handleCallClick = (call: any) => {
    setSelectedCall(call);
  };

  const NoScheduleSelected = () => (
    <View style={styles1.containerNoSched}>
      <Ionicons
        name="information-circle"
        size={24}
        color="#007BFF"
        style={styles1.iconNoSched}
      />
      <Text style={styles1.messageNoSched}>Select a call to view details</Text>
    </View>
  );

  const CallDetails = ({ call }: { call: any }) => (
    <View style={styles1.detailsCard}>
      <Text style={styles1.detailsTitle}>Call Details</Text>
      <View style={styles1.detailRow}>
        <Text style={styles1.detailLabel}>Call Start:</Text>
        <Text style={styles1.detailValue}>{call.call_start}</Text>
      </View>
      <View style={styles1.detailRow}>
        <Text style={styles1.detailLabel}>Call End:</Text>
        <Text style={styles1.detailValue}>{call.call_end}</Text>
      </View>
      <View style={styles1.detailRow}>
        <Text style={styles1.detailLabel}>Created Date:</Text>
        <Text style={styles1.detailValue}>
          {moment(call.created_date).format("MMMM DD, YYYY, HH:mm:ss")}
        </Text>
      </View>
      <View style={styles1.detailRow}>
        <Text style={styles1.detailLabel}>Schedules ID:</Text>
        <Text style={styles1.detailValue}>{call.schedules_id}</Text>
      </View>
      <View style={styles1.detailRow}>
        <Text style={styles1.detailLabel}>Signature Attempts:</Text>
        <Text style={styles1.detailValue}>{call.signature_attempts}</Text>
      </View>
      <View style={styles1.detailRow}>
        <Text style={styles1.detailLabel}>Photo:</Text>
        {call.photo && (
          <Image
            source={{ uri: `data:image/jpeg;base64,${call.photo}` }} // Adjust to the correct format if needed
            style={styles1.photo}
          />
        )}
      </View>
      <View style={styles1.detailRow}>
        <Text style={styles1.detailLabel}>Signature:</Text>
        {call.signature && (
          <Image
            source={{ uri: `data:image/jpeg;base64,${call.signature}` }} // Adjust to the correct format if needed
            style={styles1.signature}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles1.container}>
      <View style={styles1.row}>
        <View style={styles1.column1}>
          <View style={styles1.innerCard}>
            <Text style={styles1.columnTitle}>Actual Calls</Text>
            <Text style={styles1.columnSubTitle}>{currentDate}</Text>
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
                    <Text
                      style={
                        styles1.callText
                      }>{`Schedule Id : ${call.schedules_id}`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles1.column2}>
          <View style={styles1.innerCard}>
            {selectedCall ? (
              <CallDetails call={selectedCall} />
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
    paddingVertical: 20,
    paddingEnd: 20,
    backgroundColor: "#F0F0F0",
  },
  row: {
    flexDirection: "row",
    flex: 1,
    marginTop: 10,
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
  callItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginVertical: 4,
  },
  callText: {
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  detailsCard: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 2, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#343a40",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6c757d",
  },
  detailValue: {
    fontSize: 14,
    color: "#343a40",
  },
  photo: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
  signature: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
});

export default ActualCalls;
