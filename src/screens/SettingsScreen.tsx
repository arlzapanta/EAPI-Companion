import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { customToast } from "../utils/customToast";
import { useAuth } from "../context/AuthContext";
import { getStyleUtil } from "../utils/styleUtil";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../type/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  dropLocalTable,
  dropLocalTablesDb,
  getCallsTodayLocalDb,
  getDailyChartsData,
  getDatesAndTypeForCalendarView,
  getDoctorsSchedLocalDb,
  getProductRecordsLocalDb,
  insertDummyRecords,
  saveProductsLocalDb,
  saveUserSyncHistoryLocalDb,
} from "../utils/localDbUtils";
import {
  doctorRecordsSync,
  getDetailersData,
  syncProducts,
  syncUser,
  syncUserMid,
} from "../utils/apiUtility";
import {
  getCurrentDatePH,
  getCurrentTimePH,
  isTimeBetween12and1PM,
} from "../utils/dateUtils";
import Loading from "../components/Loading";
import { getLocation } from "../utils/currentLocation";
import { showConfirmAlert } from "../utils/commonUtil";
import { getQuickCalls } from "../utils/quickCallUtil";
import {
  checkPostCallUnsetExist,
  getPostCallNotesLocalDb,
  getPreCallNotesLocalDb,
} from "../utils/callComponentsUtil";
import LoadingProgressBar from "../components/LoadingProgressbar";
import { useDataContext } from "../context/DataContext";
import axios from "axios";
import { API_KEY } from "@env";

export const useStyles = (theme: string) => {
  const { configData } = useDataContext();
  return getStyleUtil(configData);
};
const dynamicStyle = getStyleUtil([]);

type SettingsScreenNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

const Settings = () => {
  const { onLogout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncProdLoading, setSyncProdLoading] = useState(false);
  const { authState } = useAuth();
  const [userInfo, setUserInfo] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    sales_portal_id: string;
    territory_id: string;
    territory_name: string;
    district_id: string;
    division: string;
    user_type: string;
    created_at: string;
    updated_at: string;
  } | null>(null);
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { setProductRecord, setIsLoading, setLoadingGlobal, configData } =
    useDataContext();

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              await onLogout();
            } catch (error) {
              Alert.alert(
                "Logout failed",
                "There was an error while logging out."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSyncSettingsOnPress = () => {
    navigation.navigate("Sync");
  };

  const handleRequestreschedOnPress = () => {
    navigation.navigate("Reschedule");
  };

  const handleAttendanceOnPress = () => {
    navigation.navigate("Attendance");
  };

  const [loadingProgressData, setLoadingProgressData] =
    useState<LoadingSubRecords>({
      progress: 0.001,
      text: "Syncing data ... Please wait",
    });

  const [prodProgressText, setProdProgressText] = useState<LoadingSubRecords>({
    progress: 0.001,
    text: "Fetching products ... Please wait",
  });

  // const MidSync = async () => {
  //   // this is for testing
  //   const getDetailersRes = await getProductRecordsLocalDb();
  //   const detailersString = JSON.stringify(getDetailersRes);
  //   console.log(
  //     detailersString,
  //     "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"
  //   );
  //   customToast(`${getDetailersRes}, asdsadsad`);
  // };

  const MidSync = async () => {
    let msg = "";
    // if (isTimeBetween12and1PM()) {
    // const check = await getDatesAndTypeForCalendarView();
    // console.log(check);
    try {
      setLoading(true);
      const checkQC = await getQuickCalls();
      const checkPost = await checkPostCallUnsetExist();
      if (checkQC.length > 0) {
        msg = "Existing quick calls, kindly complete or remove any data";
        Alert.alert(msg);
        return;
      }
      if (checkPost) {
        msg = "Existing empty post calls, kindly complete all post calls";
        Alert.alert(msg);
        return;
      }
      if (!userInfo) {
        msg = "Server Error : User information is missing.";
        Alert.alert(msg);
        return;
      }

      try {
        setLoading(true);
        setLoadingProgressData({
          progress: 0.2,
          text: "Syncing data : preparing ...",
        });
        let hasError = false;
        try {
          setLoading(true);
          setLoadingProgressData({
            progress: 0.5,
            text: "Syncing data : checking actual calls ...",
          });
          await syncUserMid(userInfo);
        } catch (error) {
          hasError = true;
          msg = "Server Error : Failed to mid sync please contact admin.";
          Alert.alert(msg);
          throw error;
        } finally {
          setLoading(false);
        }

        if (!hasError) {
          setLoading(true);
          setLoadingProgressData({
            progress: 0.7,
            text: "Syncing data : saving sync logs ...",
          });
          await saveUserSyncHistoryLocalDb(userInfo, 3, {
            Date: await getCurrentDatePH(),
            Time: await getCurrentTimePH(),
          });
          setLoadingProgressData({
            progress: 0.9,
            text: "Almost there ...",
          });
        }
      } catch (error) {
        msg = "Server Error : Failed to mid sync please contact admin.";
        Alert.alert(msg);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      Alert.alert("Server Error", " Failed to mid sync please contact admin.");
    } finally {
      setLoadingProgressData({
        progress: 1,
        text: "DONE!",
      });
      setLoading(false);
    }

    // } else {
    //   customToast("Mid sync is available between 12pm and 1pm");
    // }
  };

  const handleSyncProducts = async () => {
    setSyncProdLoading(true);
    let msg = "";
    try {
      try {
        setSyncProdLoading(true);
        setProdProgressText({
          progress: 0.5,
          text: "fetching products: please wait...",
        });
        let totalProd = 110;
        if (configData && configData.length > 0) {
          totalProd = Number(configData[0].productCount);
        }
        await syncProducts(totalProd);
      } catch (error) {
        msg = "Server Error : Failed to sync products please contact admin.";
        Alert.alert(msg);
      } finally {
        setSyncProdLoading(false);
      }
    } catch (error) {
      Alert.alert(
        "Server Error",
        "Failed to sync products please contact admin."
      );
    } finally {
      const productData =
        (await getProductRecordsLocalDb()) as ProductWoDetailsRecord[];
      setProductRecord(productData);
      setSyncProdLoading(false);
    }
  };

  const syncProducts = async (totalProd: number) => {
    console.log(totalProd, "totalProd");
    try {
      // TODO: this is static for now but need to make it dynamically depends on the # of products from API config table
      setIsLoading(true);
      setLoadingGlobal({
        progress: 0.01,
        text: `Preparing products... Please dont close the app`,
      });
      await dropLocalTable("products_tbl");
      const totalProd = configData[0].productCount
        ? Number(configData[0].productCount)
        : 110;
      for (let index = 0; index < totalProd; index += 5) {
        setLoadingGlobal({
          progress: index / totalProd,
          text: `Fetching ${index} out of ${totalProd} products`,
        });
        const responseDoc = await axios.post(
          `${API_KEY}/getAllProductDetailers`,
          {
            offset: index,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (responseDoc.data.isProceed) {
          await saveProductsLocalDb(responseDoc.data.data);
        } else {
          setIsLoading(false);
          setLoadingGlobal({
            progress: 0,
            text: "",
          });
        }
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const { response, request, message } = error;
        console.error("API syncProducts Error message:", message);
        console.error("API syncProducts Error response data:", response?.data);
        console.error(
          "API syncProducts Error response status:",
          response?.status
        );
        console.error(
          "API syncProducts Error response headers:",
          response?.headers
        );
        console.error("API syncProducts Error request:", request);
      } else {
        console.error("An unexpected error occurred syncProducts:", error);
      }
      throw error;
    }
  };

  useEffect(() => {
    if (authState.authenticated && authState.user) {
      const {
        first_name,
        last_name,
        email,
        sales_portal_id,
        territory_id,
        division,
      } = authState.user;
      setUserInfo({
        first_name,
        last_name,
        email,
        sales_portal_id,
        territory_id,
        territory_name: "",
        district_id: "",
        division,
        user_type: "",
        created_at: "",
        updated_at: "",
      });
    }
  }, [authState]);

  // temporary drop for testing only
  const dropLocalTables = async () => {
    // await insertDummyRecords();
    await dropLocalTablesDb();
  };

  const [timeOutLoading, setTimeOutLoading] = useState<boolean>(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeOutLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={dynamicStyle.container}>
      {timeOutLoading ? (
        <Loading />
      ) : (
        <>
          {loading ? (
            <LoadingProgressBar data={loadingProgressData} />
          ) : (
            <View style={dynamicStyle.card}>
              <Text style={styles.title}>Settings</Text>
              <View style={styles.centerItems}>
                <TouchableOpacity
                  style={dynamicStyle.buttonContainer}
                  onPress={handleAttendanceOnPress}>
                  <Text style={styles.buttonText}>Attendance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={dynamicStyle.buttonContainer}
                  onPress={handleSyncSettingsOnPress}>
                  <Text style={styles.buttonText}>Sync History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={dynamicStyle.buttonContainer}
                  onPress={handleRequestreschedOnPress}>
                  <Text style={styles.buttonText}>Request Reschedule</Text>
                </TouchableOpacity>
                {/* 
                  <TouchableOpacity
                    onPress={() => showConfirmAlert(MidSync, "Mid Sync")}
                    style={styles.button}>
                    <Text style={styles.buttonText}>Mid Sync</Text>
                  </TouchableOpacity> */}

                <TouchableOpacity
                  disabled={loading}
                  style={[
                    dynamicStyle.buttonContainer,
                    loading && dynamicStyle.isLoadingButtonContainer,
                  ]}
                  onPress={() => showConfirmAlert(MidSync, "Mid Sync calls")}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={dynamicStyle.buttonText}>Mid Sync Calls</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={dynamicStyle.buttonContainer}
                  disabled={syncProdLoading}
                  onPress={() =>
                    showConfirmAlert(handleSyncProducts, "Sync Products")
                  }>
                  {syncProdLoading ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />

                      <Text style={{ color: "#fff", marginEnd: 20 }}>
                        {prodProgressText.text}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.buttonText}>
                      Sync Product Detailers
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buttonLogout, dynamicStyle.buttonLogout]}
                  onPress={handleLogout}>
                  <Text style={styles.buttonTextLogout}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.buttonTest}
                  onPress={() =>
                    showConfirmAlert(
                      dropLocalTables,
                      "DROP ALL TABLES (THIS IS FOR DEV ONLY PLEASE DONT CONFIRM)"
                    )
                  }>
                  <Text style={styles.buttonTextTest}>
                    DROP ALL LOCAL DB TABLES (FOR TESTING ONLY)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  centerItems: {
    alignContent: "center",
    alignItems: "center",
  },
  card: {
    height: 740,
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginStart: 20,
    marginEnd: 10,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#046E37",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 300,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonLogout: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextLogout: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTest: {
    backgroundColor: "#ffc107",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    width: 600,
  },
  buttonTextTest: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Settings;
