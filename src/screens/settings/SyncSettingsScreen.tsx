import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth, getStyleUtil } from "../../index";
import { SyncScreenNavigationProp } from "../../type/navigation";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { API_URL_ENV } from "@env";

const getCurrentWeekDates = () => {
  const timezoneOffset = 8 * 60; // 8 hours in minutes

  const today = new Date();
  const localTime = today.getTime();
  const utcOffset = today.getTimezoneOffset();

  const phTime = new Date(localTime + (timezoneOffset - utcOffset) * 60000);

  const dayOfWeek = phTime.getDay(); // Sunday - Saturday : 0 - 6
  const startOfWeek = new Date(phTime);
  const endOfWeek = new Date(phTime);

  startOfWeek.setDate(phTime.getDate() - dayOfWeek + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  endOfWeek.setDate(phTime.getDate() - dayOfWeek + 5); // Friday
  endOfWeek.setHours(23, 59, 59, 999);

  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${(
      "0" + date.getDate()
    ).slice(-2)}`;

  return { startDate: formatDate(startOfWeek), endDate: formatDate(endOfWeek) };
};

const SyncSettingsScreen: React.FC = () => {
  const navigation = useNavigation<SyncScreenNavigationProp>();
  const styles = getStyleUtil({});
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);

  const fetchSchedules = async () => {
    if (authState.authenticated && authState.user) {
      const { first_name, sales_portal_id } = authState.user;

      const userInfo = {
        firstName: first_name,
        salesPortalId: sales_portal_id,
      };

      const { startDate, endDate } = getCurrentWeekDates();

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `${API_URL_ENV}/checkSchedules?start=${startDate}&end=${endDate}`,
          { salesPortalId: userInfo.salesPortalId },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(response, "response");

        setSchedules(response.data);
        console.log(response.data);
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          const { response, request, message } = error;
          console.error("Error message:", message);
          console.error("Error response data:", response?.data);
          console.error("Error response status:", response?.status);
          console.error("Error response headers:", response?.headers);
          console.error("Error request:", request);
        } else {
          console.error("An unexpected error occurred:", error);
        }

        setError("Error fetching schedules. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderItem = ({ item }: { item: any }) => (
    <View>
      <Text>{item.field1}</Text>
      <Text>{item.field2}</Text>
      <Text>{item.field3}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity onPress={handleBack}>
          <Icon name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
        <View style={styles.centerItems}>
          <Text style={styles.title_settings}>Sync Settings</Text>
          <Text style={styles.text}>Manage your sync settings</Text>
          <Button
            title="Fetch Schedules"
            onPress={fetchSchedules}
            disabled={loading}
          />
          {loading && <Text>Loading...</Text>}
          {error && <Text style={{ color: "red" }}>{error}</Text>}
          {schedules.length > 0 ? (
            <FlatList
              data={schedules}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              ListHeaderComponent={() => (
                <View>
                  <Text>Field 1</Text>
                  <Text>Field 2</Text>
                  <Text>Field 3</Text>
                </View>
              )}
            />
          ) : (
            !loading && <Text>No schedules available.</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 20,
  },
  centerItems: {
    alignItems: "center",
  },
  title_settings: {
    fontSize: 24,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  cell: {
    flex: 1,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SyncSettingsScreen;
