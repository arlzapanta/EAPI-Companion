import axios from "axios";
import { API_URL_ENV } from "@env";
import {
  deleteCallsTodayLocalDb,
  getCallsTodayLocalDb,
  saveDoctorListLocalDb,
} from "../utils/localDbUtils";
import { formatDateYMD, getCurrentDatePH } from "./dateUtils";
import { getLocation } from "../utils/currentLocation";

export const apiTimeIn = async (user: User) => {
  try {
    const loc = await getLocation();
    const { first_name, last_name, sales_portal_id, territory_id } = user;

    const userInfo = {
      first_name,
      last_name,
      sales_portal_id,
      territory_id
    };

    const response = await axios.post(
      `${API_URL_ENV}/timeIn`,
      {
        sales_portal_id: userInfo.sales_portal_id,
        location: loc
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
    const loc = await getLocation();
    const { first_name, last_name, sales_portal_id } = user;

    const userInfo = {
      first_name,
      last_name,
      sales_portal_id
    };

    const response = await axios.post(
      `${API_URL_ENV}/timeOut`,
      {
        sales_portal_id: userInfo.sales_portal_id,
        location : loc
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

// sync calls from local to api
export const syncUser = async (user: User): Promise<any> => {
  try {
    const localRecords = await getCallsTodayLocalDb();
    const recordsToSync: ApiPayload[] = localRecords.map(record => ({
      schedule_id: record.schedule_id,
      call_start: record.call_start,
      call_end: record.call_end,
      signature: record.signature,
      signature_attempts: record.signature_attempts,
      signature_location: record.signature_location,
      photo: record.photo,
      photo_location: record.photo_location
    }));

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

    // delete today's calls which is already sync to the server
    if(response.data.isProceed){
      await deleteCallsTodayLocalDb();
    }

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
  export const getSChedulesAPI = async (user: User): Promise<any> => {
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

// get calls from server
export const getCallsAPI = async (user: User): Promise<any> => {
  const now = await getCurrentDatePH();
  try {
    const {sales_portal_id } = user;
    const response = await axios.post(
      `${API_URL_ENV}/checkSchedules`,
        {
          sales_portal_id,
          date: formatDateYMD(now),
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

// get calls from server (weekly)
export const getWeeklyCallsAPI = async (user: User): Promise<any> => {
  const now = await getCurrentDatePH();
  try {
    const {sales_portal_id } = user;
    const response = await axios.post(
      `${API_URL_ENV}/checkSchedules`,
        {
          sales_portal_id,
          date: formatDateYMD(now),
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

export const getDoctors = async (user: User): Promise<any> => {
  try {
    const {territory_id } = user;
    const response = await axios.post(
      `${API_URL_ENV}/getDoctors`,
        {
          territory_id
        },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    await saveDoctorListLocalDb(response.data);
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