import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import moment from "moment";
import { getCurrentDatePH } from "../../utils/dateUtils";
import {
  addQuickCall,
  getQuickCalls,
  removeCallFromLocalDb,
} from "../../utils/quickCallUtil";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import { getLocation } from "../../utils/currentLocation";
import SignatureCapture from "../../components/SignatureCapture";

const { width, height } = Dimensions.get("window");

interface Call {
  id: number;
  location: string;
  doctor_id: string;
  photo: string;
  photo_location: string;
  signature: string;
  signature_location: string;
}

interface AddCall {
  location: string;
  doctor_id: string;
  photo: string;
  photo_location: string;
  signature: string;
  signature_location: string;
}

const QuickCall = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [callData, setCallData] = useState<Call[]>([]);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const fetchCallsData = async () => {
    try {
      const getDate = await getCurrentDatePH();
      setCurrentDate(moment(getDate).format("MMMM DD, dddd"));
      const data = await getQuickCalls();

      if (Array.isArray(data)) {
        setCallData(data);
      } else {
        console.warn("Fetched data is not an array:", data);
        setCallData([]);
      }
    } catch (error) {
      console.log("fetchCallsData error", error);
    }
  };

  useEffect(() => {
    fetchCallsData();
  }, []);

  const handleCallClick = (call: Call) => {
    setSelectedCall(call);
  };

  const handleAddCall = async () => {
    try {
      const newCall: AddCall = {
        location: "",
        doctor_id: "",
        photo: "",
        photo_location: "",
        signature: "",
        signature_location: "",
      };

      const addedCall = await addQuickCall(newCall);
      if (addedCall === "Success") {
        fetchCallsData();
      }
    } catch (error) {
      console.log("Error adding new call:", error);
    }
  };

  const handleRemoveCall = async (callId: number) => {
    try {
      await removeCallFromLocalDb(callId);
      setCallData((prevCallData) =>
        prevCallData.filter((call) => call.id !== callId)
      );
      setSelectedCall(null);
    } catch (error) {
      console.log("Error removing call:", error);
    }
  };

  const CallItem = ({ call }: { call: Call }) => (
    <View style={styles.callItemContainer}>
      <TouchableOpacity
        onPress={() => handleCallClick(call)}
        style={styles.callItem}>
        <Text style={styles.callText}>{`Quick call Id: ${call.id}`}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleRemoveCall(call.id)}
        style={styles.removeButtonInline}>
        <Icon name="remove-circle" size={18} color="red" />
      </TouchableOpacity>
    </View>
  );

  const NoCallSelected = () => (
    <View style={styles.containerNoCallData}>
      <Ionicons
        name="information-circle"
        size={24}
        color="#007BFF"
        style={styles.iconNoSched}
      />
      <Text style={styles.messageNoCallData}>
        Select a quick call to view details
      </Text>
    </View>
  );

  const CallDetails = ({ call }: { call: Call }) => (
    <View style={styles.callDetailsContainer}>
      <Text>{`Call ID: ${call.id}`}</Text>
      <Text style={styles.signatureLabel}>Signature Capture</Text>
      <SignatureCapture />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.column1}>
          <View style={styles.innerCard}>
            <Text style={styles.columnTitle}>Quick Calls</Text>
            <Text style={styles.columnSubTitle}>{currentDate}</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCall}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              {Array.isArray(callData) && callData.length > 0 ? (
                callData.map((call) => <CallItem key={call.id} call={call} />)
              ) : (
                <Text>No calls available</Text>
              )}
            </ScrollView>
          </View>
        </View>

        <View style={styles.column2}>
          <View style={styles.innerCard}>
            {selectedCall ? (
              <CallDetails call={selectedCall} />
            ) : (
              <NoCallSelected />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  column2: {
    width: "70%",
  },
  innerCard: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
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
  callItem: {
    paddingVertical: 4,
  },
  removeButtonInline: {
    backgroundColor: "transparent",
    padding: 2,
    marginVertical: 5,
  },
  removeButtonText: {
    color: "red",
    fontWeight: "bold",
  },
  callItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
    paddingHorizontal: 14,
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
  },
  callText: {
    fontSize: 16,
    color: "#495057",
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
  messageNoCallData: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#046E37",
    textAlign: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: "#007bff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 20,
    right: 20,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 25,
    color: "#ffffff",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  iconNoSched: {
    marginBottom: 10,
    color: "#046E37",
  },
  callDetailsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    margin: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  callDetailText: {
    fontSize: 16,
    color: "#343a40",
    marginBottom: 10,
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
});

export default QuickCall;
