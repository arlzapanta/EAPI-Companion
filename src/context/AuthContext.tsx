import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { API_KEY, TOKEN_USERNAME_ENV, TOKEN_PASSWORD_ENV } from "@env";
import axios from "axios";
import { View, Text } from "react-native";
import Loading from "../components/Loading";
import { customToast } from "../utils/customToast";

const AuthContext = createContext<AuthProps>({
  authState: { token: null, authenticated: false },
  onLogin: async () => {},
  onLogout: async () => {},
});

const TOKEN_KEY = "my-jwt";
const USER_INFO_KEY = "user-info";

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    authenticated: false,
    user: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const storedUser = await SecureStore.getItemAsync(USER_INFO_KEY);
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setAuthState({
          token,
          authenticated: true,
          user,
        });
      }
      setLoading(false);
    };
    loadToken();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axios.post(`${API_KEY}/login`, {
        username: TOKEN_USERNAME_ENV,
        password: TOKEN_PASSWORD_ENV,
      });
      const newToken = response.data.token;
      if (newToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        const storedUser = await SecureStore.getItemAsync(USER_INFO_KEY);
        const user = storedUser ? JSON.parse(storedUser) : null;
        setAuthState({
          token: newToken,
          authenticated: true,
          user,
        });

        return newToken;
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const { response, request, message } = error;
        customToast(
          ` Server is down,Please contact admin or DSM : ${message} api : ${API_KEY}`
        );
        // console.error("API refreshToken Error message:", message);
        // console.error("API refreshToken Error response data:", response?.data);
        // console.error(
        //   "API refreshToken Error response status:",
        //   response?.status
        // );
        // console.error(
        //   "API refreshToken Error response headers:",
        //   response?.headers
        // );
        // console.error("API refreshToken Error request:", request);
      } else {
        console.error("An unexpected error occurred: refreshToken", error);
      }
      throw error;
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            const newToken = await refreshToken();
            error.config.headers["Authorization"] = `Bearer ${newToken}`;
            return axios(error.config);
          } catch (refreshError) {
            console.log("Token refresh failed:", refreshError);
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [authState.token]);

  const login = async (email: string, password: string) => {
    try {
      const getTokenResponse = await axios.post(
        `${API_KEY}/login`,
        {
          username: TOKEN_USERNAME_ENV,
          password: TOKEN_PASSWORD_ENV,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // const jsonData = JSON.parse(getTokenResponse.data.replace("test", ""));
      // const token = jsonData.token;

      const token = getTokenResponse.data.token;
      if (!token) {
        return { error: true, msg: "Failed to get token" };
      }

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const checkCredentialsResponse = await axios.post(
        `${API_KEY}/user/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (checkCredentialsResponse.data.isProceed) {
        const user: User = checkCredentialsResponse.data.user;
        await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(user));

        setAuthState({
          token,
          authenticated: true,
          user,
        });

        return true;
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        return { error: true, msg: "Invalid credentials" };
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const { response, request, message } = error;
        customToast(
          ` Server is down,Please contact admin or DSM : ${message} api : ${API_KEY}`
        );
        // console.error("API login Error message:", message);
        // console.error("API login Error response data:", response?.data);
        // console.error("API login Error response status:", response?.status);
        // console.error("API login Error response headers:", response?.headers);
        // console.error("API login Error request:", request);
      } else {
        console.error("An unexpected error occurred: login", error);
      }
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
    delete axios.defaults.headers.common["Authorization"];
    setAuthState({
      token: null,
      authenticated: false,
      user: null,
    });
  };

  const value = {
    onLogin: login,
    onLogout: logout,
    authState,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <View>
          <Loading />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
