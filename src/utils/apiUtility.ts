import axios from "axios";
import { API_URL_ENV } from "@env";

interface User {
  first_name: string;
  last_name: string;
  sales_portal_id: string;
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
    console.log(response,'api-time-in-response');

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

    console.log(response.data,'api-time-out-response');

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
