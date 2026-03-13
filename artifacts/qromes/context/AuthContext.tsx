import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  city: string;
  country: string;
  phone: string;
  bio?: string;
  interests: string[];
  lookingFor: string[];
  photos: string[];
  coinBalance: number;
  isOnline: boolean;
  occupation?: string;
  education?: string;
  languages: string[];
  personalityType?: string;
  relationshipStyle?: string;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  token: string | null;
};

type AuthContextValue = AuthState & {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setOnboarded: (val: boolean) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isOnboarded: false,
    token: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const [userStr, token, onboarded] = await Promise.all([
          AsyncStorage.getItem("@qromes_user"),
          AsyncStorage.getItem("@qromes_token"),
          AsyncStorage.getItem("@qromes_onboarded"),
        ]);
        setState({
          user: userStr ? JSON.parse(userStr) : null,
          token,
          isOnboarded: onboarded === "true",
          isLoading: false,
        });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const setUser = async (user: User) => {
    await AsyncStorage.setItem("@qromes_user", JSON.stringify(user));
    setState((s) => ({ ...s, user }));
  };

  const setToken = async (token: string) => {
    await AsyncStorage.setItem("@qromes_token", token);
    setState((s) => ({ ...s, token }));
  };

  const setOnboarded = async (val: boolean) => {
    await AsyncStorage.setItem("@qromes_onboarded", String(val));
    setState((s) => ({ ...s, isOnboarded: val }));
  };

  const updateUser = async (partial: Partial<User>) => {
    const updated = { ...state.user!, ...partial };
    await AsyncStorage.setItem("@qromes_user", JSON.stringify(updated));
    setState((s) => ({ ...s, user: updated }));
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([
      "@qromes_user",
      "@qromes_token",
      "@qromes_onboarded",
    ]);
    setState({ user: null, token: null, isOnboarded: false, isLoading: false });
  };

  return (
    <AuthContext.Provider
      value={{ ...state, setUser, setToken, setOnboarded, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
