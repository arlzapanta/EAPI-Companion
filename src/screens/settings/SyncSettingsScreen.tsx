import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Button, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth, getStyleUtil } from "../../index";
import { SyncScreenNavigationProp } from "../../type/navigation";
import Icon from "react-native-vector-icons/Ionicons";

const SyncSettingsScreen: React.FC = () => {
  const navigation = useNavigation<SyncScreenNavigationProp>();
  const styles = getStyleUtil({});
  const { authState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customError, setError] = useState<string | null>(null);
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
        </View>
      </View>
    </View>
  );
};

export default SyncSettingsScreen;
