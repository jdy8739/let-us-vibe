"use client";

import { useState, useEffect } from "react";
import { auth } from "@/src/services/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: string;
  lastSignInTime: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const userProfile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
        createdAt: currentUser.metadata.creationTime || "Unknown",
        lastSignInTime: currentUser.metadata.lastSignInTime || "Unknown",
      };

      setUser(userProfile);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const formatDate = (dateString: string) => {
    if (dateString === "Unknown") return "Unknown";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-gray-600">Loading profile...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">User not found</div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              User Profile
            </h1>
            <p className="text-gray-600">
              Your account information and details.
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Picture */}
            {user.photoURL && (
              <div className="text-center">
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900">
                  {user.displayName || "Not set"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900">
                  {user.email || "Not set"}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900 font-mono text-sm">
                  {user.uid}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Verified
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.emailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Created
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900">
                    {formatDate(user.createdAt)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Sign In
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900">
                    {formatDate(user.lastSignInTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6 flex justify-between items-center">
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Back to Home
              </Link>

              <div className="flex space-x-3">
                <button
                  onClick={() => auth.signOut()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
