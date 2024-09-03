import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Button, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth, getStyleUtil } from "../../index";
import { SyncScreenNavigationProp } from "../../type/navigation";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import { API_URL_ENV } from "@env";
import { saveUserAttendanceLocalDb } from "../../utils/localDbUtils";
import { apiTimeIn, apiTimeOut } from "../../utils/apiUtility";

const SyncSettingsScreen: React.FC = () => {
  const navigation = useNavigation<SyncScreenNavigationProp>();
  const styles = getStyleUtil({});
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [userInfo, setUserInfo] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    sales_portal_id: string;
  } | null>(null);

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

  const timeIn = async () => {
    if (!userInfo) {
      setError("User information is missing.");
      return;
    }

    try {
      await apiTimeIn(userInfo);
    } catch (error: any) {
      console.log(error, "after successful login > apiTimeIn");
    }

    try {
      await saveUserAttendanceLocalDb(userInfo, "in");
    } catch (error: any) {
      console.log(error, "after successful login > saveUserAttendanceLocalDb");
    }
  };

  const timeOut = async () => {
    if (!userInfo) {
      setError("User information is missing.");
      return;
    }

    try {
      await apiTimeOut(userInfo);
    } catch (error: any) {
      console.log(error, "after successful login > apiTimeOut");
    }

    try {
      await saveUserAttendanceLocalDb(userInfo, "out");
    } catch (error: any) {
      console.log(error, "after successful login > saveUserAttendanceLocalDb");
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity onPress={handleBack}>
          <Icon name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
        <View style={styles.centerItems}>
          <Text style={styles.title_settings}>Sync Settings</Text>
          <Text style={styles.text}>Manage your sync settings</Text>
          {/* time in */}
          <Button title="Time In" onPress={timeIn} disabled={loading} />
          <Button title="Time Out" onPress={timeOut} disabled={loading} />
        </View>
      </View>
    </View>
  );
};

export default SyncSettingsScreen;
