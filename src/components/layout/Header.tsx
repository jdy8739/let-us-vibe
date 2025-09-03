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
      style={{ padding: "3rem 3rem 1.5rem 3rem" }}
      className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-gray-200"
    >
      <div
        style={{ padding: "1rem 1.5rem" }}
        className="max-w-6xl mx-auto flex items-center justify-between"
      >
        <Link
          href="/"
          style={{ padding: "0.75rem 0.75rem" }}
          className="text-2xl font-bold tracking-tight text-gray-900"
        >
          Journal
        </Link>
        <nav
          style={{ padding: "0.5rem", gap: "1.5rem 2rem" }}
          className="flex items-center"
        >
          {currentUser ? (
            <>
              <Link
                href={`/profile/${currentUser.uid}`}
                style={{ padding: "0.5rem 1rem" }}
                className="hidden sm:inline-flex items-center rounded-xl border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-lg font-medium"
              >
                <span style={{ padding: "0.25rem" }}>Profile</span>
              </Link>
              <Link
                href="/new-post"
                style={{ padding: "0.5rem 1rem" }}
                className="inline-flex items-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-lg font-semibold"
              >
                <span style={{ padding: "0.25rem" }}>New Post</span>
              </Link>
              <button
                onClick={handleLogout}
                style={{ padding: "0.5rem 1rem" }}
                className="inline-flex items-center rounded-xl border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 transition-all text-lg font-medium"
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
                <span style={{ padding: "0.25rem" }}>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{ padding: "0.5rem 1rem" }}
                className="inline-flex items-center rounded-xl border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-lg font-medium"
              >
                <span style={{ padding: "0.25rem" }}>Login</span>
              </Link>
              <Link
                href="/signup"
                style={{ padding: "0.5rem 1rem" }}
                className="inline-flex items-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-lg font-semibold"
              >
                <span style={{ padding: "0.25rem" }}>Sign Up</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
