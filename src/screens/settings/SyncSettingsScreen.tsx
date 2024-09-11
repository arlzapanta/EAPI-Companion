import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth, getStyleUtil } from "../../index";
import { SyncScreenNavigationProp } from "../../type/navigation";
import Icon from "react-native-vector-icons/Ionicons";
import { getSyncHistoryRecordsLocalDb } from "../../utils/localDbUtils";
import SyncTable from "../../tables/SyncHistoryTable";

const SyncSettingsScreen: React.FC = () => {
  const navigation = useNavigation<SyncScreenNavigationProp>();
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
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

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Sync History</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollViewContent: {
    flex: 1,
    flexGrow: 1,
    paddingTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginVertical: 10,
    marginStart: 20,
    marginEnd: 20,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 40,
    right: 50,
    backgroundColor: "#046E37",
    opacity: 0.9,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SyncSettingsScreen;
