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
      firstName: first_name,
      lastName: last_name,
      salesPortalId: sales_portal_id,
    };

    const response = await axios.post(
      `${API_URL_ENV}/timeIn`,
      {
        salesPortalId: userInfo.salesPortalId,
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
