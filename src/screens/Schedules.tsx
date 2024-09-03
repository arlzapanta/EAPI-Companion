import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Button, FlatList } from "react-native";
import { useAuth, getStyleUtil } from "../index";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { API_URL_ENV } from "@env";
import { saveUserAttendanceLocalDb } from "../utils/localDbUtils";

const Schedules = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    sales_portal_id: string;
  } | null>(null);

  const styles = getStyleUtil({});
  const { authState } = useAuth();

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

    return {
      startDate: formatDate(startOfWeek),
      endDate: formatDate(endOfWeek),
    };
  };

  const fetchSchedules = async () => {
    const { startDate, endDate } = getCurrentWeekDates();

    if (!userInfo) {
      setError("User information is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL_ENV}/getSchedules`,
        // { salesPortalId: userInfo.sales_portal_id },
        { sales_portal_id: "829" },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data, "response");

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
  };

  useEffect(() => {
    if (authState.authenticated && authState.user) {
      const { first_name, last_name, email, sales_portal_id } = authState.user;
      setUserInfo({
        first_name,
        last_name,
        email,
        sales_portal_id,
      });
    }
  }, [authState]);

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
        <View style={styles.centerItems}>
          <Text style={styles.title_settings}>Sync Settings</Text>
          <Text style={styles.text}>Manage your sync settings</Text>

          {/* fetch schedules test */}
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
export default Schedules;
