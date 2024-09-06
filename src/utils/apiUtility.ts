import axios from "axios";
import { API_URL_ENV } from "@env";
import {
  getScheduleAPIRecordsLocalDb,
} from "../utils/localDbUtils";

interface User {
  first_name: string;
  last_name: string;
  sales_portal_id: string;
}
interface ApiPayload {
  schedules_id: number;
  call_start: string;
  call_end: string;
  signature: string;
  signature_attempts: string;
  signature_location: string;
  photo: string;
  photo_location: string;
}

export const apiTimeIn = async (user: User) => {
  try {
    const { first_name, last_name, sales_portal_id } = user;

    const userInfo = {
      first_name,
      last_name,
      sales_portal_id
    };

    const response = await axios.post(
      `${API_URL_ENV}/timeIn`,
      {
        salesPortalId: userInfo.sales_portal_id,
        // add location and image here (required)
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Time-In Error message:", message);
      console.error("API Time-In Error response data:", response?.data);
      console.error("API Time-In Error response status:", response?.status);
      console.error("API Time-In Error response headers:", response?.headers);
      console.error("API Time-In Error request:", request);
    } else {
      console.error("An unexpected error occurred:", error);
    }
    throw error;
  }
};

export const apiTimeOut = async (user: User) => {
  try {
    const { first_name, last_name, sales_portal_id } = user;

    const userInfo = {
      first_name,
      last_name,
      sales_portal_id
    };

    const response = await axios.post(
      `${API_URL_ENV}/timeOut`,
      {
        salesPortalId: userInfo.sales_portal_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Time-Out Error message:", message);
      console.error("API Time-Out Error response data:", response?.data);
      console.error("API Time-Out Error response status:", response?.status);
      console.error("API Time-Out Error response headers:", response?.headers);
      console.error("API Time-Out Error request:", request);
    } else {
      console.error("An unexpected error occurred:", error);
    }
    throw error;
  }
};

export const syncUser = async (user: User): Promise<any> => {
  try {
    const localRecords = await getScheduleAPIRecordsLocalDb();
    const recordsToSync: ApiPayload[] = localRecords.map(record => ({
      schedules_id: record.schedules_id,
      call_start: record.call_start,
      call_end: record.call_end,
      signature: record.signature,
      signature_attempts: record.signature_attempts,
      signature_location: record.signature_location,
      photo: record.photo,
      photo_location: record.photo_location
    }));

    console.log(recordsToSync);
    if (recordsToSync.length === 0) {
      console.log('No records to sync.');
      return 'No records to sync';
    }

    const response = await axios.post(
      `${API_URL_ENV}/sync`,
      recordsToSync,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Error message:", message);
      console.error("API Error response data:", response?.data);
      console.error("API Error response status:", response?.status);
      console.error("API Error response headers:", response?.headers);
      console.error("API Error request:", request);
    } else {
      console.error("An unexpected error occurred:", error);
    }
    throw error;
  }
};

// get schedules 
export const initialSyncUser = async (user: User): Promise<any> => {
  try {
    const {sales_portal_id } = user;
    const response = await axios.post(
      `${API_URL_ENV}/getSchedules`,
        {
          sales_portal_id
        },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Error message:", message);
      console.error("API Error response data:", response?.data);
      console.error("API Error response status:", response?.status);
      console.error("API Error response headers:", response?.headers);
      console.error("API Error request:", request);
    } else {
      console.error("An unexpected error occurred:", error);
    }
    throw error;
  }
};

