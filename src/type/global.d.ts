declare global {
    export interface styleUtilProps {
      theme?: 'dark' | 'light';
    }

    export interface DoctorRecord {
      doctors_id: string;
      first_name: string;
      last_name: string;
      specialization: string;
      classification: string;
      birthday: string;
      address_1: string;
      address_2: string;
      municipality_city: string;
      province: string;
      phone_mobile: string;
      phone_office: string;
      phone_secretary: string;
      notes_names: string;
      notes_values: string;
    }

    export interface CallComponentsProps {
      scheduleId: string;
      docName: string;
    }

    export interface MapProps {
      latitude: number;
      longitude: number;
      containerStyle?: ViewStyle;
      mapStyle?: ViewStyle;
    }

    export interface NavLinkProps {
      iconName: string;
      onPress: () => void;
      active: boolean;
    }

    export interface SignatureCaptureProps {
      callId: number;
      onSignatureUpdate: (base64Signature: string) => void;
    }

    export interface User {
      created_at: string;
      district_id: string;
      division: string;
      email: string;
      first_name: string;
      last_name: string;
      sales_portal_id: string;
      territory_id: string;
      territory_name: string;
      updated_at: string;
      user_type: string;
    }
    
    export interface AuthState {
      token: string | null;
      authenticated: boolean;
      user?: User | null;
    }

    export interface AuthProps {
      authState: AuthState;
      onLogin: (email: string, password: string) => Promise<any>;
      onLogout: () => Promise<void>;
    }

    export interface RefreshFetchDataContextProps {
      refreshSchedData: () => void;
      refresh: number;
    }

    export interface UseImagePickerOptions {
      onPhotoCaptured?: (base64: string, location: { latitude: number; longitude: number }) => void;
    }

    export interface DetailerModalProps {
      isVisible: boolean;
      detailerNumber: number;
      onClose: () => void;
    }

    export interface DetailerModalProps {
      isVisible: boolean;
      onClose: () => void;
    }

    export interface dailyCompletionData {
      value: number;
      color: string;
    }

    export interface Props {
      route: OnCallScreenRouteProp;
      navigation: OnCallScreenNavigationProp;
    }
  
    // export interface DetailerModalProps {
    //   isVisible: boolean;
    //   onClose: () => void;
    // }
    
    // export interface Props {
    //   route: OnCallScreenRouteProp;
    //   navigation: OnCallScreenNavigationProp;
    // }

    export interface Call {
      id: number;
      location: string;
      doctor_id: string;
      photo: string;
      photo_location: string;
      signature: string;
      signature_location: string;
      notes: string;
      full_name: string;
    }
    
    export interface AddCall {
      location: string;
      doctor_id: string;
      photo: string;
      photo_location: string;
      signature: string;
      signature_location: string;
      notes: string;
    }
    
    export interface ScheduleAPIRecord {
      id?: string;
      address: string;
      date: string;
      doctor_id: string;
      full_name: string;
      municipality_city: string;
      province: string;
      schedule_id: string;
    }

    export interface UpdateDoctorsNotes {
      doctors_id: string;
      notes_names: string;
      notes_values: string;
    }

    export interface AttendanceRecord {
      id: number;
      date: string;
      email: string;
      sales_portal_id: string;
      type: string;
    }

    export interface AttendanceRecord {
      id: number;
      date: string;
      email: string;
      sales_portal_id: string;
      type: string;
    }
    
    export interface AttendanceTableProps {
      data: AttendanceRecord[];
    }

    export interface SyncHistoryRecord {
      id: number;
      date: string;
      email: string;
      sales_portal_id: string;
      type: number;
    }
    
    export interface SyncHistoryTableProps {
      data: SyncHistoryRecord[];
    }

    export interface ApiPayload {
      schedule_id: number;
      call_start: string;
      call_end: string;
      signature: string;
      signature_attempts: string;
      signature_location: string;
      photo: string;
      photo_location: string;
    }

    export interface LocationData {
      latitude: number;
      longitude: number;
    }
    
    export interface PostCallNotesParams {
      mood: string;
      feedback: string;
      scheduleId: string;
    }
    
    export interface PreCallNotesParams {
      notesArray: string[];
      scheduleId: string;
    }

    export interface ScheduleRecord {
      id: number;
      schedule_id: number;
      call_start: string;
      call_end: string;
      signature: string;
      signature_attempts: string;
      signature_location: string;
      photo: string;
      photo_location: string;
      created_date: string;
    }

    export interface CallAPIDown {
      id?: string; // id is optional
      schedule_id?: string; // New column
      date: string | null;
      doctor_name: string | null;
      address: string | null;
      municipality_city: string | null;
      province: string | null;
      call_start: string | null;
      call_end: string | null;
      signature: string | null;
      signature_location: string | null;
      photo: string | null;
      photo_location: string | null;
      signature_attempts: string | null;
      
    }
    
    export interface SchedToCall {
      schedule_id: string| null;
      call_start: string | null;
      call_end: string | null;
      signature: string  | null;
      signature_attempts: string  | null;
      signature_location: string  | null;
      photo: string  | null;
      photo_location: string  | null;
      doctor_name: string | null;
    }

    export interface DetailerRecord{
      category: string;
      images: string[];
  };

  export interface UploadImageProps {
    base64Images: string[];
    category: string;
  }
  }
  
  export {};