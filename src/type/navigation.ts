import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Home:  undefined;
    Login: undefined;
    Sync : undefined;
    Attendance: undefined;
    OnCall: { scheduleIdValue: string, notesArray: string[]};
    QuickCall: undefined;
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type SyncScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sync'>;
export type AttendanceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Attendance'>;
export type OnCallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnCall'>;
export type QuickCallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuickCall'>;