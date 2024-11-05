import { Alert } from "react-native";

export const getBase64StringFormat = () => {
  return "data:image/png;base64,";
};

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

export function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  const durationMs = end.getTime() - start.getTime();
  const durationSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  let durationString = "";

  if (minutes === 0) {
    durationString = `${seconds} seconds`;
  } else if (minutes === 1) {
    durationString = `${minutes} minute and ${seconds
      .toString()
      .padStart(2, "0")} seconds`;
  } else {
    durationString = `${minutes} minutes :${seconds
      .toString()
      .padStart(2, "0")} seconds`;
  }

  return durationString;
}
