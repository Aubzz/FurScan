import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_URL } from '../constants/api';
import { getToken, removeToken, saveToken } from '../utils/tokenStorage';

// --- Define the props interface ---
interface AuthProviderProps {
  children: ReactNode;
}

// --- Define the shape of your user data ---
interface User {
    id: number;
    firstName?: string;
    first_name?: string; // Handle both camelCase and snake_case from backend
    lastName?: string;
    last_name?: string;
    email: string;
    profileImagePath?: string | null;
    profile_image_path?: string | null;
}

// --- Define the shape of the context ---
interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
}

// --- Create the Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Create the Provider Component ---
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const storedToken = await getToken();
                if (storedToken) {
                    setToken(storedToken);
                    // This fetch call now uses the imported API_URL
                    const response = await fetch(`${API_URL}/api/profile/me`, {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        await removeToken();
                        setToken(null);
                        setUser(null);
                    }
                }
            } catch (e) {
                console.error("AuthProvider: Failed to load user from storage", e);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    const login = (userData: User, receivedToken: string) => {
        setUser(userData);
        setToken(receivedToken);
        saveToken(receivedToken);
        router.replace('/home');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        removeToken();
        router.replace('/Screens/CreateAccount');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};