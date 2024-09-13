import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { getCurrentDatePH } from "../../utils/dateUtils";
import { getCallsTestLocalDb } from "../../utils/localDbUtils";
import moment from "moment";
import { addQuickCall, getQuickCalls } from "../../utils/quickCallUtil";

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
  const [selectedCall, setSelectedCall] = useState<any | null>(null);

  useEffect(() => {
    const fetchCallsData = async () => {
      try {
        const getDate = await getCurrentDatePH();
        setCurrentDate(moment(getDate).format("MMMM DD, dddd"));
        const data = [await getQuickCalls()];

        console.log("Fetched data:", data);

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

    fetchCallsData();
  }, []);

  const handleCallClick = (call: any) => {
    setSelectedCall(call);
  };

  const CallItem = ({ call }: { call: Call }) => (
    <TouchableOpacity
      key={call.id}
      onPress={() => handleCallClick(call)}
      style={styles.callItem}>
      <Text style={styles.callText}>{`quick call Id: ${call.id}`}</Text>
    </TouchableOpacity>
  );

  const NoCallSelected = () => (
    <View style={styles.containerNoCallData}>
      <Text style={styles.messageNoCallData}>
        Select a quick call to view details
      </Text>
    </View>
  );

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

      await addQuickCall(newCall);

      const updatedCallData = await getQuickCalls();
      console.log("New call added successfully:", updatedCallData);
      setCallData(updatedCallData);
    } catch (error) {
      console.log("Error adding new call:", error);
    }
  };

  const CallDetails = ({ call }: { call: any }) => <Text>{call.id}</Text>;

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
            {Array.isArray(callData) && callData.length > 0 ? (
              callData.map((call) => <CallItem key={call.id} call={call} />)
            ) : (
              <Text>No calls available</Text>
            )}
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
    height: "100%",
    paddingHorizontal: 30,
    paddingVertical: 40,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  callText: {
    fontSize: 16,
    color: "#495057",
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
    elevation: 2,
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
  photo: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  },
  signature: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  },
  containerNoCallData: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    width: 50,
    height: 50,
    backgroundColor: "#007bff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 24,
    color: "#ffffff",
  },
});

export default QuickCall;

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   SafeAreaView,
//   ScrollView,
// } from "react-native";
// import { getCurrentDatePH } from "../../utils/dateUtils";
// import {
//   getQuickCalls,
//   removeCallFromLocalDb,
//   addQuickCall,
// } from "../../utils/quickCallUtil";
// import moment from "moment";

// interface Call {
//   id: number;
//   location: string;
//   doctor_id: string;
//   photo: string;
//   photo_location: string;
//   signature: string;
//   signature_location: string;
// }

// const QuickCall: React.FC = () => {
//   const [currentDate, setCurrentDate] = useState<string>("");
//   const [callData, setCallData] = useState<Call[]>([]);
//   const [selectedCall, setSelectedCall] = useState<Call | null>(null);

//   const fetchCallsData = async () => {
//     try {
//       const getDate = await getCurrentDatePH();
//       setCurrentDate(moment(getDate).format("MMMM DD, dddd"));
//       const data = await getQuickCalls();
//       setCallData(data || []);
//     } catch (error) {
//       console.log("fetchCallsData error", error);
//     }
//   };

//   useEffect(() => {
//     fetchCallsData();
//   }, []);

//   const handleCallClick = (call: Call) => {
//     setSelectedCall(call);
//   };

//   const handleRemoveCall = async (callId: number) => {
//     try {
//       await removeCallFromLocalDb(callId);
//       setCallData((prevCallData) =>
//         prevCallData.filter((call) => call.id !== callId)
//       );
//     } catch (error) {
//       console.log("Error removing call:", error);
//     }
//   };

//   const handleAddCall = async () => {
//     try {
//       const newCall: Call = {
//         id: 0,
//         location: "",
//         doctor_id: "",
//         photo: "",
//         photo_location: "",
//         signature: "",
//         signature_location: "",
//       };

//       await addQuickCall(newCall);
//     } catch (error) {
//       console.log("Error adding new call:", error);
//     }
//   };

//   const CallItem = ({ call }: { call: Call }) => (
//     <View style={styles.callItemContainer}>
//       <TouchableOpacity
//         onPress={() => handleCallClick(call)}
//         style={styles.callItem}>
//         <Text style={styles.callText}>{`quick call id: ${call.id}`}</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const NoCallSelected = () => (
//     <View style={styles.containerNoCallData}>
//       <Text style={styles.messageNoCallData}>
//         Select a quick call to view details
//       </Text>
//     </View>
//   );

//   const CallDetails = ({ call }: { call: Call }) => <Text>{call.id}</Text>;

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.row}>
//         <View style={styles.column1}>
//           <View style={styles.innerCard}>
//             <Text style={styles.columnTitle}>Quick Calls</Text>
//             <Text style={styles.columnSubTitle}>{currentDate}</Text>
//             <TouchableOpacity style={styles.addButton} onPress={handleAddCall}>
//               <Text style={styles.addButtonText}>+</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.column2}>
//           <View style={styles.innerCard}>
//             {selectedCall ? (
//               <>
//                 <CallDetails call={selectedCall} />
//                 <TouchableOpacity
//                   onPress={() =>
//                     selectedCall.id && handleRemoveCall(selectedCall.id)
//                   }
//                   style={styles.removeButton}>
//                   <Text style={styles.removeButtonText}>Remove</Text>
//                 </TouchableOpacity>
//               </>
//             ) : (
//               <NoCallSelected />
//             )}
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F0F0F0",
//   },
//   row: {
//     flexDirection: "row",
//     flex: 1,
//     marginVertical: 10,
//     marginHorizontal: 20,
//   },
//   column1: {
//     width: "30%",
//     marginEnd: 10,
//   },
//   column2: {
//     width: "70%",
//   },
//   innerCard: {
//     flex: 1,
//     paddingHorizontal: 30,
//     paddingVertical: 40,
//     backgroundColor: "#ffffff",
//     borderRadius: 10,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//   },
//   columnTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#343a40",
//     marginBottom: 8,
//   },
//   columnSubTitle: {
//     fontSize: 16,
//     color: "#6c757d",
//   },
//   callItemContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#dee2e6",
//   },
//   callItem: {
//     flex: 1,
//   },
//   callText: {
//     fontSize: 16,
//     color: "#495057",
//   },
//   removeButton: {
//     backgroundColor: "#dc3545",
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   removeButtonText: {
//     color: "#ffffff",
//     fontSize: 14,
//   },
//   containerNoCallData: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#e9ecef",
//     borderRadius: 10,
//     borderColor: "#046E37",
//     borderWidth: 1,
//   },
//   messageNoCallData: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#046E37",
//     textAlign: "center",
//   },
//   addButton: {
//     width: 50,
//     height: 50,
//     backgroundColor: "#007bff",
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "absolute",
//     bottom: 20,
//     right: 20,
//     elevation: 5,
//   },
//   addButtonText: {
//     fontSize: 24,
//     color: "#ffffff",
//   },
// });

// export default QuickCall;
