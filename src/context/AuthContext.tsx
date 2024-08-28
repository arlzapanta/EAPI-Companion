import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL_ENV, TOKEN_USERNAME_ENV, TOKEN_PASSWORD_ENV } from '@env';
import axios from 'axios';

interface AuthProps {
    authState: { token: string | null; authenticated: boolean };
    onLogin: (email: string, password: string) => Promise<any>;
    onLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthProps>({
    authState: { token: null, authenticated: false },
    onLogin: async () => {},
    onLogout: async () => {},
});

// variables
const TOKEN_KEY = 'my-jwt';
let token = '';

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authState, setAuthState] = useState<{ token: string | null; authenticated: boolean }>({
        token: null,
        authenticated: false,
    });

    const login = async (email: string, password: string) => {
        try {
            const getTokenResponse = await axios.post(`${API_URL_ENV}/login`, {
                username: TOKEN_USERNAME_ENV,
                password: TOKEN_PASSWORD_ENV
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            token = getTokenResponse.data.token;
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            if (!token) {
                return { error: true, msg: 'Failed to get token' };
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const checkCredentialsResponse = await axios.post(`${API_URL_ENV}/user/login`, {
                email,
                password
            }, {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (checkCredentialsResponse.data.isProceed) {
                setAuthState({
                    token,
                    authenticated: true
                });
                return true;
            } else {
                await SecureStore.deleteItemAsync(TOKEN_KEY);
                return { error: true, msg: 'Invalid credentials' };
            }
        } catch (error: any) {
            console.log('isAxiosError : ', axios.isAxiosError(error));
            console.log('Error during login:', axios.isAxiosError(error) ? error.response?.data?.error || 'Invalid credentials' : error.message);
            return { error: true, msg: axios.isAxiosError(error) ? error.response?.data?.error || 'Invalid credentials' : error.message };
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        axios.defaults.headers.common['Authorization'] = '';
        setAuthState({
            token: null,
            authenticated: false
        });
    };

    const value = {
        onLogin: login,
        onLogout: logout,
        authState
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
