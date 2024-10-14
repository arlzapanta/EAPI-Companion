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
      update_date: string;
    }

    export interface RescheduleRecord {
      id:string;
      request_id: string;
      schedule_id: string;
      sales_portal_id: string;
      doctors_id: string;
      date_from: string;
      date_to: string;
      status: string;
      type: string | null;
      full_name : string;
      created_at: string;
    }
    export interface ChartDashboardRecord {
      id: string; 
      daily: {
          plottingCount: string; 
          callsCount: string;    
          targetCount: number;   
      };
      monthly: {
          plottingCount: string; 
          callsCount: string;    
          targetCount: number;   
      };
      yearly: {
          plottingCount: string; 
          callsCount: string;    
          targetCount: number;   
      };
      ytd: {
          plottingCount: number[]; 
          callsCount: number[];    
          targetCount: number[];    
      };
      created_at: string; 
  }
  interface DailyTargetState {
    data: { callsCount: string, plotCount: string }[];
  }
  interface chartData {
    value: number;
    color: string;
  }
  interface chartYtdData {
    value: number[];
  }
    export interface CallComponentsProps {
      scheduleId: string;
      docName: string;
      canStartCall: boolean;
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
      getCurrentDate: () => Promise<string>;
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
      doctors_id: string;
      photo: string;
      photo_location: string;
      signature: string;
      signature_location: string;
      notes: string;
      full_name: string;
    }
    
    export interface AddCall {
      location: string;
      doctors_id: string;
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
      doctors_id: string;
      full_name: string;
      municipality_city: string;
      province: string;
      schedule_id: string;
    }
    export interface CallAPIRecord {
      id?: string; 
      date: string; 
      ts_name: string; 
      schedule_id: string; 
      doctors_name: string; 
      call_start: string; 
      call_end: string; 
      signature: string; 
      signature_attempts: string; 
      signature_location: string; 
      photo: string; 
      photo_location: string; 
      created_at: string; 
    }

    export interface UpdateDoctorsNotes {
      doctors_id: string;
      notes_names: string;
      notes_values: string;
    }
    export interface apiDoctorRecords {
      doctors_id: number;
      territory_id: number;
      division: number;
      notes_names: string;
      notes_values: string;
    }
    export interface apiRescheduleReqRecords {
      schedule_id: string;
      sales_portal_id: string;
      doctors_id: string;
      date_from: string;
      date_to: string;
      status: string;
      type: string | null;
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
    export interface RescheduleTableProps {
      data: RescheduleRecord[];
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
      doctors_name: string | null;
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
      created_at : string | null;
      
    }
    export interface RescheduleDetails {
      id?: string;
      schedule_id: string;
      request_id: string;
      date_to: string | null;
      date_from: string | null;
      doctors_id: string | null;
      full_name: string | null;
      status: number | null;
      type: string | null;
      sales_portal_id: string | null;
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
      doctors_name: string | null;
      created_at: string | null;
    }

    export interface DetailerRecord{
      category: string;
      images: string[];
  };

  export interface UploadImageProps {
    base64Images: string[];
    category: string;
  }

  type ExistingDoctorNotesRow = {
    doctors_id: number;
    notes_names: string | null;
    notes_values: string | null;
  };
  export interface CalendarProps {
    data: CalendarRecord[];
  }

  export interface CalendarRecord {
    plotData: string [];
    advanceData: string [];
    makeupData: string [];
    actualData: string [];
  }
  export interface QuickCallBottomSheetProps {
    closeSheet: () => void;
  }
}
  
  export {};