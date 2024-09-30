import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Home:  undefined;
    Login: undefined;
    Sync : undefined;
    Reschedule : undefined;
    Attendance: undefined;
    OnCall: { scheduleIdValue: string, notesArray: string[], docName: string};
    QuickCall: undefined;
    Doctors: undefined;
};

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type SyncScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sync'>;
export type RescheduleScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reschedule'>;
export type AttendanceScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Attendance'>;
export type OnCallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnCall'>;
export type QuickCallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuickCall'>;
export type DoctorsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Doctors'>;