import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth, getStyleUtil } from "../../index";
import { SyncScreenNavigationProp } from "../../type/navigation";
import Icon from "react-native-vector-icons/Ionicons";
import {
  saveUserSyncHistoryLocalDb,
  getSyncHistoryRecordsLocalDb,
  saveUserSyncUpLocalDb,
  saveUserSyncDownLocalDb,
} from "../../utils/localDbUtils";
import { syncUser, initialSyncUser } from "../../utils/apiUtility";
import { getCurrentTimePH } from "../../utils/dateUtils";
import SyncTable from "../../tables/SyncHistoryTable";

const SyncSettingsScreen: React.FC = () => {
  const navigation = useNavigation<SyncScreenNavigationProp>();
  const styles = getStyleUtil({});
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snycBtnTitle, setSnycBtnTitle] = useState("Sync");
  const [userInfo, setUserInfo] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    sales_portal_id: string;
  } | null>(null);

  const [syncData, setSyncData] = useState<any[]>([]);

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

  const fetchSyncData = useCallback(async () => {
    if (userInfo) {
      try {
        const data = await getSyncHistoryRecordsLocalDb(userInfo);
        setSyncData(data);
      } catch (error: any) {
        console.log("fetchSyncData error", error);
      }
    }
  }, [userInfo]);

  useEffect(() => {
    fetchSyncData();
  }, [fetchSyncData]);

  const syncNow = async () => {
    console.log("test syncNow", "@@@@@@@@@@@@@@@@@@@@@");
    setLoading(true);

    if (!userInfo) {
      Alert.alert("Error", "User information is missing.");
      setLoading(false);
      return;
    }

    try {
      const storedTime = await getCurrentTimePH();
      const [hours, minutes] = storedTime.split(":").map(Number);

      let type = 1;
      let syncBtnTitle = "Sync";
      let syncMethod = syncUser; // Default sync method

      syncMethod = initialSyncUser;

      // if (hours === 8 && hours > 10 && minutes < 59) {
      //   type = 1;
      //   syncBtnTitle = "Sync (1/3)";
      //   syncMethod = initialSyncUser; // Use initialSyncUser for type 1
      // } else if ((hours === 11 && minutes >= 1) || (hours > 11 && hours < 14)) {
      //   type = 2;
      //   syncBtnTitle = "Sync (2/3)";
      // } else if (hours >= 17 && hours < 23 && minutes < 59) {
      //   type = 3;
      //   syncBtnTitle = "Sync (3/3)";
      // } else {
      //   Alert.alert("Failed", "Synchronization is not valid at this hour.");
      //   setLoading(false);
      //   return;
      // }

      setSnycBtnTitle(syncBtnTitle);

      const syncLocalResult = await saveUserSyncHistoryLocalDb(userInfo, type);

      if (syncLocalResult === "Success") {
        const syncRes = await syncMethod(userInfo);
        if (syncRes) {
          const result = await saveUserSyncUpLocalDb(syncRes);
          {
            result == "Success"
              ? Alert.alert("Success", "Successfully synced data")
              : Alert.alert("Failed", "Error syncing");
          }
          setLoading(false);
        }
        await fetchSyncData();
      } else {
        Alert.alert("Failed", syncLocalResult);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to sync.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          <Text style={styles.title_stack_settings}>Sync</Text>
          {/* <Text style={styles.text}>Manage your sync settings</Text> */}
          <Button title={snycBtnTitle} onPress={syncNow} disabled={loading} />
          <SyncTable data={syncData} />
        </View>
      </ScrollView>
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.floatingButton}>
          <Icon name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SyncSettingsScreen;
