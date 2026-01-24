// In app/contexts/AuthContext.tsx

import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { API_URL } from '../constants/api';
import { getToken, removeToken, saveToken } from '../utils/tokenStorage';

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
// This component will wrap your app and provide the auth state
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Start with loading true
    const router = useRouter();

    useEffect(() => {
        // This effect runs once when the app starts
        const loadUserFromStorage = async () => {
            console.log("AuthProvider: Starting to load user from storage..."); // <-- ADD THIS
            try {
                const storedToken = await getToken();
                console.log("AuthProvider: Token from storage:", storedToken); // <-- ADD THIS
                if (storedToken) {
                    setToken(storedToken);
                    // If we have a token, we should fetch the user's profile
                    console.log("AuthProvider: Fetching user profile from /api/profile/me..."); // <-- ADD THIS
                    const response = await fetch(`${API_URL}/api/profile/me`, {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    });

                    // --- ADD THESE LOGS TO INSPECT THE RESPONSE ---
                    console.log("AuthProvider: API Response Status:", response.status);
                    console.log("AuthProvider: API Response OK?", response.ok);

                    if (response.ok) {
                        const userData = await response.json();
                        console.log("AuthProvider: Fetched user data successfully:", userData); // <-- ADD THIS
                        setUser(userData);
                    } else {
                        // Token is invalid or expired, log them out
                        console.error("AuthProvider: Failed to fetch user. Status:", response.status);
                        await removeToken();
                        setToken(null);
                        setUser(null);
                    }
                }  else {
                    console.log("AuthProvider: No token found in storage."); // <-- ADD THIS
                }
            } catch (e) {
                // --- THIS WILL CATCH NETWORK ERRORS ---
                console.error("AuthProvider: An error occurred in loadUserFromStorage:", e);
            } finally {
                console.log("AuthProvider: Finished loading process. setIsLoading(false)."); // <-- ADD THIS
                setIsLoading(false); // Finished loading
            }
        };

        loadUserFromStorage();
    }, []);

    const login = (userData: User, receivedToken: string) => {
        setUser(userData);
        setToken(receivedToken);
        saveToken(receivedToken); // Save token to secure storage
        router.replace('/home'); // Navigate after setting state
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        removeToken();
        router.replace('/Screens/CreateAccount'); 
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {isLoading ? (
                // Show a global loading spinner while we check for a token
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#F79C4E" />
                </View>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

// --- Create a custom hook for easy access to the context ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};