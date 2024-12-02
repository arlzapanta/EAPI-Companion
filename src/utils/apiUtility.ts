import axios from "axios";
import { API_URL_ENV } from "@env";
import {
  deleteDoctorsTodayLocalDb,
  dropLocalTable,
  dropLocalTables,
  getCallsTodayLocalDb,
  getCallsTodayNotSyncedLocalDb,
  getProductRecordsLocalDb,
  getRescheduleRequestRecordsLocalDb,
  getUpdatedDoctorRecordsLocalDb,
  saveAppConfigLocalDb,
  saveCallsAPILocalDb,
  saveChartDataLocalDb,
  saveDetailersDataLocalDb,
  saveDoctorListLocalDb,
  saveProductsLocalDb,
  saveRescheduleHistoryLocalDb,
  saveRescheduleListLocalDb,
  saveSchedulesAPILocalDb,
  updateActualCallsToDone,
} from "../utils/localDbUtils";
import { formatDateYMD, getCurrentDatePH } from "./dateUtils";
import { getLocationAttendance } from "../utils/currentLocation";
import * as SQLite from "expo-sqlite";
import {
  getPostCallNotesLocalDb,
  getPreCallNotesLocalDb,
} from "./callComponentsUtil";
import { customToast } from "./customToast";

export const apiTimeIn = async (user: User, req: any) => {
  try {
    const loc = await getLocationAttendance();
    const { first_name, last_name, sales_portal_id, territory_id } = user;

    const userInfo = {
      first_name,
      last_name,
      sales_portal_id,
      territory_id,
    };

    const response = await axios.post(
      `${API_URL_ENV}/timeIn`,
      {
        sales_portal_id: userInfo.sales_portal_id,
        location: loc,
        signature: req[0].signatureVal,
        signature_location: req[0].signatureLoc,
        photo: req[0].selfieVal,
        photo_location: req[0].selfieLoc,
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
      customToast(` Server is down,Please contact admin or DSM : ${message}`);
      // console.error("API Time-In Error message:", message);
      // console.error("API Time-In Error response data:", response?.data);
      // console.error("API Time-In Error response status:", response?.status);
      // console.error("API Time-In Error response headers:", response?.headers);
      // console.error("API Time-In Error request:", request);
    } else {
      console.error(
        "An unexpected error occurred apiTimeIn: Please contact admin or DSM",
        error
      );
    }
    throw error;
  }
};

export const apiTimeOut = async (user: User) => {
  try {
    const loc = await getLocationAttendance();
    const { first_name, last_name, sales_portal_id } = user;

    const userInfo = {
      first_name,
      last_name,
      sales_portal_id,
    };

    const response = await axios.post(
      `${API_URL_ENV}/timeOut`,
      {
        sales_portal_id: userInfo.sales_portal_id,
        location: loc,
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
      console.error("An unexpected error occurred apiTimeOut:", error);
    }
    throw error;
  }
};

export const syncUser = async (user: User): Promise<any> => {
  try {
    let recordsToSync: ApiPayload[] = [];
    const localRecords = await getCallsTodayNotSyncedLocalDb();

    for (const record of localRecords) {
      const scheduleId = record.schedule_id.toString();
      const postCallsPerScheduleId = await getPostCallNotesLocalDb(scheduleId);
      const preCallsPerScheduleId = await getPreCallNotesLocalDb(scheduleId);

      let postCallNotes = "";
      if (postCallsPerScheduleId) {
        postCallNotes = `${postCallsPerScheduleId.feedback},${postCallsPerScheduleId.mood}`;
      }

      let preCallNotes = "";
      if (preCallsPerScheduleId && preCallsPerScheduleId.length > 0) {
        preCallNotes = preCallsPerScheduleId[0].notesArray.join(",");
      }

      recordsToSync.push({
        schedule_id: record.schedule_id,
        call_start: record.call_start,
        call_end: record.call_end,
        signature: record.signature,
        signature_attempts: record.signature_attempts,
        signature_location: record.signature_location,
        photo: record.photo,
        photo_location: record.photo_location,
        post_call: postCallNotes,
        pre_call: preCallNotes,
      });
    }

    if (recordsToSync.length === 0) {
      console.log("No records to sync.");
      return "No records to sync";
    }

    let allResponses = [];
    for (const record of recordsToSync) {
      const response = await axios.post(`${API_URL_ENV}/sync`, [record], {
        headers: {
          "Content-Type": "application/json",
        },
      });
      allResponses.push(response.data);
    }

    const allSuccessful = allResponses.every((response) => response.isProceed);
    if (allSuccessful) {
      await updateActualCallsToDone();
      await dropLocalTables([
        "detailers_tbl",
        "quick_call_tbl",
        "reschedule_req_tbl",
        "schedule_API_tbl",
        "doctors_tbl",
        "pre_call_notes_tbl",
        "post_call_notes_tbl",
        "chart_data_tbl",
      ]);
    }

    return allResponses;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Error message:", message);
      console.error("API Error response data:", response?.data);
      console.error("API Error response status:", response?.status);
      console.error("API Error response headers:", response?.headers);
      console.error("API Error request:", request);
    } else {
      console.error("An unexpected error occurred syncUser:", error);
    }
    throw error;
  }
};

export const syncUserMid = async (user: User): Promise<any> => {
  try {
    let recordsToSync: ApiPayload[] = [];
    const localRecords = await getCallsTodayNotSyncedLocalDb();

    for (const record of localRecords) {
      const scheduleId = record.schedule_id.toString();
      const postCallsPerScheduleId = await getPostCallNotesLocalDb(scheduleId);
      const preCallsPerScheduleId = await getPreCallNotesLocalDb(scheduleId);

      let postCallNotes = "";
      if (postCallsPerScheduleId) {
        postCallNotes = `${postCallsPerScheduleId.feedback},${postCallsPerScheduleId.mood}`;
      }

      let preCallNotes = "";
      if (preCallsPerScheduleId && preCallsPerScheduleId.length > 0) {
        preCallNotes = preCallsPerScheduleId[0].notesArray.join(",");
      }

      recordsToSync.push({
        schedule_id: record.schedule_id,
        call_start: record.call_start,
        call_end: record.call_end,
        signature: record.signature,
        signature_attempts: record.signature_attempts,
        signature_location: record.signature_location.toString(),
        photo: record.photo,
        photo_location: record.photo_location.toString(),
        post_call: postCallNotes,
        pre_call: preCallNotes,
      });
    }

    if (recordsToSync.length === 0) {
      console.log("No records to sync.");
      return "No records to sync";
    }

    const response = await axios.post(`${API_URL_ENV}/sync`, recordsToSync, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.data.isProceed) {
      await updateActualCallsToDone();
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
      console.error("An unexpected error occurred syncUserMid:", error);
    }
    throw error;
  }
};

export const doctorRecordsSync = async (user: User): Promise<any> => {
  try {
    const localDoctorsUpdated = await getUpdatedDoctorRecordsLocalDb();
    const docRecordsToSync: apiDoctorRecords[] = localDoctorsUpdated.map(
      (record) => ({
        doctors_id: Number(record.doctors_id),
        notes_names: record.notes_names,
        notes_values: record.notes_values,
        territory_id: Number(user.territory_id),
        division: Number(user.division),
      })
    );

    const responseDoc = await axios.post(
      `${API_URL_ENV}/updateDoctorsNotes`,
      docRecordsToSync,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (docRecordsToSync.length === 0) {
      console.log("No doctor records to sync.");
      return "No doctor records to sync";
    }

    if (responseDoc.data.isProceed) {
      await deleteDoctorsTodayLocalDb();
    }

    return docRecordsToSync;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Error message:", message);
      console.error("API Error response data:", response?.data);
      console.error("API Error response status:", response?.status);
      console.error("API Error response headers:", response?.headers);
      console.error("API Error request:", request);
    } else {
      console.error("An unexpected error occurred doctorRecordsSync:", error);
    }
    throw error;
  }
};

export const syncProducts = async (totalProd: number) => {
  try {
    // TODO: this is static for now but need to make it dynamically depends on the # of products from API config table
    await dropLocalTable("products_tbl");
    // const totalProd = 110;
    for (let index = 0; index < totalProd; index += 5) {
      const responseDoc = await axios.post(
        `${API_URL_ENV}/getAllProductDetailers`,
        {
          offset: index,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (responseDoc.data.isProceed) {
        await saveProductsLocalDb(responseDoc.data.data);
      }
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API syncProducts Error message:", message);
      console.error("API syncProducts Error response data:", response?.data);
      console.error(
        "API syncProducts Error response status:",
        response?.status
      );
      console.error(
        "API syncProducts Error response headers:",
        response?.headers
      );
      console.error("API syncProducts Error request:", request);
    } else {
      console.error("An unexpected error occurred syncProducts:", error);
    }
    throw error;
  }
};

export const requestRecordSync = async (user: User): Promise<any> => {
  try {
    const localRescheduleReq = await getRescheduleRequestRecordsLocalDb();
    const rescheduleRecordsToSync: apiRescheduleReqRecords[] =
      localRescheduleReq.map((record) => ({
        schedule_id: record.schedule_id,
        request_id: record.request_id,
        sales_portal_id: record.sales_portal_id,
        doctors_id: record.doctors_id,
        date_from: record.date_from,
        date_to: record.date_to,
        status: record.status,
        type: record.type,
      }));

    const responseResreq = await axios.post(
      `${API_URL_ENV}/rescheduleRequest`,
      rescheduleRecordsToSync,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (rescheduleRecordsToSync.length === 0) {
      console.log("No Request resched records to sync.");
      return "No request resched records to sync";
    }

    if (responseResreq.data.isProceed) {
      await deleteDoctorsTodayLocalDb();
    }

    return rescheduleRecordsToSync;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Error message:", message);
      console.error("API Error response data:", response?.data);
      console.error("API Error response status:", response?.status);
      console.error("API Error response headers:", response?.headers);
      console.error("API Error request:", request);
    } else {
      console.error("An unexpected error occurred requestRecordSync:", error);
    }
    throw error;
  }
};

export const getSChedulesAPI = async (user: User): Promise<any> => {
  try {
    const { sales_portal_id } = user;
    const response = await axios.post(
      `${API_URL_ENV}/getSchedules`,
      {
        sales_portal_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const schedForMakeUp = await axios.post(
      `${API_URL_ENV}/getSchedulesForMakeup`,
      {
        sales_portal_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const mergedData = [...response.data, ...schedForMakeUp.data];
    await saveSchedulesAPILocalDb(mergedData);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Error message:", message);
      console.error("API Error response data:", response?.data);
      console.error("API Error response status:", response?.status);
      console.error("API Error response headers:", response?.headers);
      console.error("API Error request:", request);
    } else {
      console.error("An unexpected error occurred getSChedulesAPI:", error);
    }
    throw error;
  }
};

export const getCallsAPI = async (user: User): Promise<any> => {
  const now = await getCurrentDatePH();
  try {
    const { sales_portal_id } = user;
    const response = await axios.post(
      `${API_URL_ENV}/getCalls`,
      {
        sales_portal_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    await saveCallsAPILocalDb(response.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Error message:", message);
      console.error("API Error response data:", response?.data);
      console.error("API Error response status:", response?.status);
      console.error("API Error response headers:", response?.headers);
      console.error("API Error request:", request);
    } else {
      console.error("An unexpected error occurred getCallsAPI:", error);
    }
    throw error;
  }
};

export const getWeeklyCallsAPI = async (user: User): Promise<any> => {
  const now = await getCurrentDatePH();
  try {
    const { sales_portal_id } = user;
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
      console.error("An unexpected error occurred getWeeklyCallsAPI:", error);
    }
    throw error;
  }
};

export const getDoctors = async (user: User): Promise<any> => {
  try {
    const { territory_id, division } = user;
    const response = await axios.post(
      `${API_URL_ENV}/getDoctors`,
      {
        territory_id,
        division,
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
      console.error("An unexpected error occurred getDoctors:", error);
    }
    throw error;
  }
};

export const getConfig = async (user: User): Promise<any> => {
  try {
    const { territory_id, division } = user;
    const response = await axios.post(
      `${API_URL_ENV}/getAppConfig`,
      {
        territory_id,
        division,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(
      response.data.data[0].total_products,
      "getconfig response.data"
    );
    console.log(response.data.isProceed, "getconfig response.data");
    if (response.data.isProceed) {
      await saveAppConfigLocalDb(response.data.data);
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API Error message:", message);
      console.error("API Error response data:", response?.data);
      console.error("API Error response status:", response?.status);
      console.error("API Error response headers:", response?.headers);
      console.error("API Error request:", request);
    } else {
      console.error("An unexpected error occurred getConfig:", error);
    }
    throw error;
  }
};

export const getReschedulesData = async (user: User): Promise<any> => {
  try {
    const { sales_portal_id } = user;
    const response = await axios.post(
      `${API_URL_ENV}/getRescheduleRequestsSPI`,
      {
        sales_portal_id,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    await saveRescheduleListLocalDb(response.data);
    await saveRescheduleHistoryLocalDb(response.data);

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
      console.error("An unexpected error occurred getReschedulesData:", error);
    }
    throw error;
  }
};

export const getChartData = async (user: User): Promise<any[]> => {
  try {
    const { sales_portal_id } = user;
    const response = await axios.post(
      `${API_URL_ENV}/getChartData`,
      {
        sales_portal_id,
        user_type: "medrep",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    await saveChartDataLocalDb(response.data);

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API getChartData Error message:", message);
      console.error("API getChartData Error response data:", response?.data);
      console.error(
        "API getChartData Error response status:",
        response?.status
      );
      console.error(
        "API getChartData Error response headers:",
        response?.headers
      );
      console.error("API getChartData Error request:", request);
    } else {
      console.error("An unexpected error occurred : getChartData", error);
    }
    throw error;
  }
};

export const getDetailersData = async (): Promise<any[]> => {
  try {
    const response = await axios.post(`${API_URL_ENV}/getDetailers`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    await saveDetailersDataLocalDb(response.data);

    const query = `SELECT * FROM detailers_tbl`;
    const db = await SQLite.openDatabaseAsync("cmms", {
      useNewConnection: true,
    });
    const existingRows = await db.getAllAsync(query);

    return existingRows;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const { response, request, message } = error;
      console.error("API getChartData Error message:", message);
      console.error("API getChartData Error response data:", response?.data);
      console.error(
        "API getChartData Error response status:",
        response?.status
      );
      console.error(
        "API getChartData Error response headers:",
        response?.headers
      );
      console.error("API getChartData Error request123123:", request);
    } else {
      console.error("An unexpected error occurred getDetailersData:", error);
    }
    throw error;
  }
};
