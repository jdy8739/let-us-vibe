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
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-gray-200 px-12 py-6">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-4 sm:py-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-gray-900 px-3 py-2"
        >
          Journal
        </Link>
        <nav className="flex items-center gap-6 sm:gap-8 px-2 py-2">
          {currentUser ? (
            <>
              <Link
                href={`/profile/${currentUser.uid}`}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-lg font-medium"
              >
                Profile
              </Link>
              <Link
                href="/new-post"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-lg font-semibold"
              >
                New Post
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 transition-all text-lg font-medium"
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
                className="inline-flex items-center px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-lg font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-lg font-semibold"
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
