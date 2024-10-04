import { ToastAndroid } from 'react-native';

export const customToast = (msg: string) => {
  ToastAndroid.show(msg, ToastAndroid.SHORT);
};