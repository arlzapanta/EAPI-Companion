import { Alert } from "react-native";

export const getBase64StringFormat = () => {
  return 'data:image/png;base64,';
}

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

  export const getStatusText = (status: string) => {
    switch (status) {
      case "0":
        return "Pending";
      case "1":
        return "Approved";
      case "2":
        return "Declined";
      case "3":
        return "Cancelled";
      case "4":
        return "Cancel Req";
      default:
        return "Unknown";
    }
  };