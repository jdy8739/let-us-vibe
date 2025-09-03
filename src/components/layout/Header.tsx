"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "@/src/contexts/AuthContext";

const Header: React.FC = () => {
  const { user, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // 로그아웃 후 로그인 페이지로 리디렉션은 useCheckAuth에서 처리
    } catch (error) {
      console.error("Logout failed:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  // 사용자 정보 (Firebase user 또는 로컬스토리지 userData 중 하나)
  const currentUser =
    user ||
    (userData
      ? { uid: userData.uid, displayName: userData.displayName }
      : null);

  return (
    <header
      style={{ padding: "1rem 1.5rem" }}
      className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-gray-200"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          style={{ padding: "0.5rem 1rem" }}
          className="text-2xl font-bold tracking-tight text-gray-900 hover:text-blue-600 transition-all duration-200 rounded-xl hover:bg-blue-50/80 hover:shadow-sm transform hover:scale-105"
        >
          <span style={{ padding: "0.25rem" }}>📝</span>
          <span style={{ padding: "0.25rem 0.5rem" }}>Journal</span>
        </Link>
        <nav style={{ padding: "0.5rem" }} className="flex items-center">
          {currentUser ? (
            <>
              <Link
                href={`/profile/${currentUser.uid}`}
                style={{ padding: "0.75rem 1.25rem", marginRight: "1rem" }}
                className="hidden sm:inline-flex items-center h-11 rounded-xl border-2 border-gray-200 text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all text-base font-medium shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <span style={{ padding: "0.25rem" }}>👤</span>
                <span style={{ padding: "0.25rem" }}>Profile</span>
              </Link>
              <Link
                href="/new-post"
                style={{ padding: "0.75rem 1.25rem", marginRight: "1rem" }}
                className="inline-flex items-center h-11 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-base font-semibold"
              >
                New Post
              </Link>
              <button
                onClick={handleLogout}
                style={{ padding: "0.75rem 1.25rem" }}
                className="inline-flex items-center h-11 rounded-xl border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 transition-all text-base font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{ padding: "0.75rem 1.25rem", marginRight: "1rem" }}
                className="inline-flex items-center h-11 rounded-xl border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-base font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                style={{ padding: "0.75rem 1.25rem" }}
                className="inline-flex items-center h-11 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-base font-semibold"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
