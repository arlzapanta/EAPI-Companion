import { Alert } from "react-native";

export const showConfirmAlert = (action: () => void, actionName: string) => {
    Alert.alert(
      `Confirm ${actionName}`,
      `Are you sure you want to ${actionName.toLowerCase()}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: action,
        },
      ],
      { cancelable: false }
    );
  };