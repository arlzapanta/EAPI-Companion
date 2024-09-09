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
} from "../../utils/localDbUtils";
import { syncUser } from "../../utils/apiUtility";
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
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          <Text style={styles.title_stack_settings}>Sync History</Text>
          {/* <View style={styles.centerItems}>
            <TouchableOpacity
              onPress={syncNow}
              disabled={loading}
              style={[
                styles.buttonContainer,
                loading && styles.buttonDisabled,
              ]}>
              <Text style={styles.buttonText}>Sync</Text>
            </TouchableOpacity>
          </View> */}
          <SyncTable data={syncData} />
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.floatingButtonContainer}>
        <View style={styles.floatingButton}>
          <Icon name="arrow-back" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SyncSettingsScreen;
