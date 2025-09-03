"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/services/firebase";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 로컬스토리지 키
const AUTH_STORAGE_KEY = "journal_auth_data";
const AUTH_TIMESTAMP_KEY = "journal_auth_timestamp";

// 토큰 유효 시간 (24시간)
const TOKEN_VALIDITY_DURATION = 24 * 60 * 60 * 1000;

// 로컬스토리지 유틸리티 함수들
const saveAuthData = (userData: UserData) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error("Failed to save auth data to localStorage:", error);
  }
};

const getStoredAuthData = (): {
  userData: UserData | null;
  isValid: boolean;
} => {
  try {
    const storedData = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedTimestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);

    if (!storedData || !storedTimestamp) {
      return { userData: null, isValid: false };
    }

    const timestamp = parseInt(storedTimestamp, 10);
    const now = Date.now();

    // 토큰이 유효한지 확인 (24시간 이내)
    if (now - timestamp > TOKEN_VALIDITY_DURATION) {
      // 만료된 데이터 제거
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_TIMESTAMP_KEY);
      return { userData: null, isValid: false };
    }

    const userData = JSON.parse(storedData) as UserData;
    return { userData, isValid: true };
  } catch (error) {
    console.error("Failed to get stored auth data:", error);
    // 오류 발생 시 저장된 데이터 제거
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
    return { userData: null, isValid: false };
  }
};

const clearAuthData = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
  } catch (error) {
    console.error("Failed to clear auth data from localStorage:", error);
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 로드 시 로컬스토리지에서 사용자 데이터 확인
    const { userData: storedUserData, isValid } = getStoredAuthData();

    if (isValid && storedUserData) {
      setUserData(storedUserData);
    }

    // Firebase Auth 상태 변경 리스너
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Firebase에서 사용자 인증됨
        const newUserData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };

        setUser(firebaseUser);
        setUserData(newUserData);

        // 로컬스토리지에 사용자 데이터 저장
        saveAuthData(newUserData);
      } else {
        // 로그아웃됨
        setUser(null);
        setUserData(null);
        clearAuthData();
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 로그아웃 함수
  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setUserData(null);
      clearAuthData();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // 로컬스토리지 데이터가 있지만 Firebase 사용자가 없는 경우 검증
  useEffect(() => {
    if (!loading && userData && !user) {
      // 로컬스토리지에는 데이터가 있지만 Firebase에서는 인증되지 않은 경우
      // 로컬스토리지 데이터가 유효하지 않으므로 제거
      console.log(
        "Local storage data exists but Firebase user not authenticated. Clearing local data."
      );
      setUserData(null);
      clearAuthData();
    }
  }, [loading, userData, user]);

  const value = {
    user,
    userData,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
