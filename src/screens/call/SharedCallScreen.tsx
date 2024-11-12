import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../type/navigation";
import { getStyleUtil } from "../../utils/styleUtil";
import {
  getBase64StringFormat,
  showConfirmAlert,
} from "../../utils/commonUtil";
import Icon from "react-native-vector-icons/Ionicons";
import { getLocation } from "../../utils/currentLocation";
import { useAuth } from "../../context/AuthContext";
import { getCurrentDatePH } from "../../utils/dateUtils";
import {
  getCallsLocalDb,
  getScheduleByIDLocalDb,
  saveCallsDoneFromSchedules,
} from "../../utils/localDbUtils";
import { getAllActualDatesFilter } from "../../utils/localDbUtils";
import moment from "moment";
const dynamicStyles = getStyleUtil({ theme: "light" });

type SharedCallScreenRouteProp = RouteProp<RootStackParamList, "SharedCall">;
type SharedCallScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SharedCall"
>;
interface Props {
  route: SharedCallScreenRouteProp;
  navigation: SharedCallScreenNavigationProp;
}

const SharedCallScreen: React.FC<Props> = ({ route, navigation }) => {
  const { scheduleIdValue } = route.params;
  const [photoValue, setPhotoValue] = useState<string>("");
  const [photoLocation, setPhotoLocation] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const { authState } = useAuth();
  const [callData, setCallsDate] = useState<any[]>([]);
  const [actualDatesFilterData, setActualDatesFilterData] = useState<any[]>([]);

  const handleSelectCall = async (call: any) => {
    try {
      console.log(scheduleIdValue, "callcallcallcall");
      const callDetails = {
        schedule_id: call.schedule_id,
        call_start: call.call_start,
        call_end: call.call_end,
        signature: "",
        signature_attempts: "",
        signature_location: "",
        // photo: call.photo,
        photo: "call.photo",
        photo_location: call.photo_location,
        doctors_name: call.doctors_name,
        created_at: await getCurrentDatePH(),
      };

      const result = await saveCallsDoneFromSchedules(
        scheduleIdValue,
        callDetails
      );

      if (result === "Success") {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Error fetching call data:", error);
    }
  };

  const fetchSharedCallData = async () => {
    try {
      setLoading(true);
      if (authState.user) {
        try {
          // get schedule details
          const schedData: ScheduleAPIRecord = await getScheduleByIDLocalDb({
            scheduleId: scheduleIdValue,
          });
          console.log(schedData, "askdjaslkdjaks wkwikwikwiikwkiwki");

          // all actual calls
          const data = await getCallsLocalDb();
          setCallsDate(data);
          // filter
          const filterData = await getAllActualDatesFilter();
          setActualDatesFilterData(filterData);
        } catch (error: any) {
          console.log("fetchActualCallsData error", error);
        }
      }
    } catch (error: any) {
      console.log("fetchSharedCallData error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedCallData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
      <View style={styles.cardContainer}>
        <Text style={dynamicStyles.mainTextBig}>Select shared call</Text>
        {callData.map((call) => (
          <>
            {call.photo && (
              <TouchableOpacity
                key={call.id}
                onPress={() =>
                  showConfirmAlert(
                    () => handleSelectCall(call),
                    "select this recent call?"
                  )
                }
                style={dynamicStyles.cardItems}>
                <Text style={dynamicStyles.cardItemText}>{`${
                  call.doctors_name
                } \n${moment(call.created_date).format("MMMM DD YYYY")}`}</Text>

                <Image
                  source={{
                    uri: `${getBase64StringFormat()}${call.photo}`,
                  }}
                  style={styles.photo}
                />
              </TouchableOpacity>
            )}
          </>
        ))}
      </View>
    </ScrollView>
  );
};

export default SharedCallScreen;

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    backgroundColor: "#f5f5f5",
    position: "relative",
  },
  floatingButtonContainer: {
    position: "static",
    // position: "absolute",
    // bottom: 20,
    // right: 20,
    backgroundColor: "#ff4d4d",
    borderRadius: 30,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 9999,
  },
  floatingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
  cardContainer: {
    height: "100%",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
  },
  imageContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  image: {
    width: 400,
    height: 260,
    marginTop: 10,
    resizeMode: "contain",
  },
  photo: {
    borderRadius: 10,
    width: 600,
    height: 300,
    marginTop: 10,
    marginHorizontal: 20,
    resizeMode: "cover",
  },
});
