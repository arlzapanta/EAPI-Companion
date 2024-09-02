import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { API_URL_ENV, TOKEN_USERNAME_ENV, TOKEN_PASSWORD_ENV } from "@env";
import axios from "axios";
import { View } from "react-native";
import { Text } from "react-native-elements";
import { saveUserLoginToLocalDb } from "../utils/localDbUtils";
import { apiTimeIn } from "../utils/apiTimeIn";

interface User {
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

interface AuthState {
  token: string | null;
  authenticated: boolean;
  user?: User | null;
}

interface AuthProps {
  authState: AuthState;
  onLogin: (email: string, password: string) => Promise<any>;
  onLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthProps>({
  authState: { token: null, authenticated: false },
  onLogin: async () => {},
  onLogout: async () => {},
});

const TOKEN_KEY = "my-jwt";

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    authenticated: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await axios.get(`${API_URL_ENV}/user/validate`, {
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.data.isValid) {
            setAuthState({
              token,
              authenticated: true,
              user: response.data.user,
            });
          } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setAuthState({
              token: null,
              authenticated: false,
              user: null,
            });
          }
        } else {
          setAuthState({
            token: null,
            authenticated: false,
            user: null,
          });
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setAuthState({
          token: null,
          authenticated: false,
          user: null,
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const getTokenResponse = await axios.post(
        `${API_URL_ENV}/login`,
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

      const token = getTokenResponse.data.token;
      if (!token) {
        return { error: true, msg: "Failed to get token" };
      }

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const checkCredentialsResponse = await axios.post(
        `${API_URL_ENV}/user/login`,
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

        setAuthState({
          token,
          authenticated: true,
          user: user,
        });

        try {
          await apiTimeIn(user);
        } catch (error: any) {
          console.log(error, "after successful login > apiTimeIn");
        }

        try {
          await saveUserLoginToLocalDb(user);
        } catch (error: any) {
          console.log(error, "after successful login > saveUserLoginToLocalDb");
        }

        return true;
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        return { error: true, msg: "Invalid credentials" };
      }
    } catch (error: any) {
      console.log("isAxiosError : ", axios.isAxiosError(error));
      console.log(
        "Error during login:",
        axios.isAxiosError(error)
          ? error.response?.data?.error || "Invalid credentials"
          : error.message
      );
      return {
        error: true,
        msg: axios.isAxiosError(error)
          ? error.response?.data?.error || "Invalid credentials"
          : error.message,
      };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    axios.defaults.headers.common["Authorization"] = "";
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
          <Text>Loading...</Text>
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
