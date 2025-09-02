"use client";

import Link from "next/link";
import { auth } from "@/src/services/firebase";
import React from "react";

const Header: React.FC = () => {
  const user = auth.currentUser;
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
          {user && (
            <Link
              href={`/profile/${user.uid}`}
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-lg font-medium"
            >
              Profile
            </Link>
          )}
          <Link
            href="/new-post"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-all text-lg font-semibold"
          >
            New Post
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
