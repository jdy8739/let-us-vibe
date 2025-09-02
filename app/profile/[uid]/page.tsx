"use client";

import { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db, auth } from "@/src/services/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt?: string;
  lastSignInTime?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  username: string;
  uid: string;
  createdAt: Timestamp;
  aiReview: boolean;
  photo?: string;
}

const UserProfilePage = ({ params }: { params: { uid: string } }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Fetching profile for UID:", params.uid);

        // Check if this is the current user's profile
        const currentUser = auth.currentUser;
        console.log("Current user:", currentUser?.uid);

        if (currentUser && currentUser.uid === params.uid) {
          console.log("This is current user's profile");
          setIsCurrentUser(true);
          // Use current user data with metadata
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
        } else {
          console.log("This is another user's profile");
          // For other users, we can only show limited info from posts
          // We'll try to get displayName from their posts
          const postsQuery = query(
            collection(db, "posts"),
            where("uid", "==", params.uid),
            limit(1)
          );
          const postsSnapshot = await getDocs(postsQuery);

          if (!postsSnapshot.empty) {
            const firstPost = postsSnapshot.docs[0].data();
            console.log("Found post data:", firstPost);
            setUser({
              uid: params.uid,
              email: null,
              displayName: firstPost.username || "User",
              photoURL: null,
              emailVerified: false,
            });
          } else {
            console.log("No posts found for this user");
            setUser({
              uid: params.uid,
              email: null,
              displayName: "User",
              photoURL: null,
              emailVerified: false,
            });
          }
        }

        // Fetch posts by this user
        console.log("Fetching posts for UID:", params.uid);
        const postsQuery = query(
          collection(db, "posts"),
          where("uid", "==", params.uid)
          // Removed orderBy to avoid index requirement
        );

        const postsSnapshot = await getDocs(postsQuery);
        const postsData = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];

        // Sort posts by createdAt on client side
        postsData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          const dateA = a.createdAt.toDate();
          const dateB = b.createdAt.toDate();
          return dateB.getTime() - dateA.getTime(); // Descending order
        });

        console.log("Found posts:", postsData.length);
        setPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(
          `Failed to load user profile: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setLoading(false);
      }
    };

    // Wait for auth to be ready
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user !== null) {
        fetchUserProfile();
      } else {
        // No user logged in, redirect to login
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [params.uid, router]);

  const formatDate = (timestamp: Timestamp | string) => {
    if (!timestamp || timestamp === "Unknown") return "Unknown date";

    try {
      let date: Date;
      if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else {
        date = timestamp.toDate();
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown date";
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">
              {error || "User not found"}
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* User Profile Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 mb-12 text-center">
          <div className="mb-8">
            {user.photoURL && (
              <div className="relative inline-block">
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
              </div>
            )}
            {!user.photoURL && (
              <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl">
                <span className="text-white text-4xl font-bold">
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            {user.displayName || "User"}
          </h1>
          {isCurrentUser && (
            <p className="text-lg text-blue-600 font-medium mb-6">
              This is your profile
            </p>
          )}

          {/* Profile Actions */}
          <div className="flex justify-center items-center space-x-4">
            {isCurrentUser ? (
              <>
                <Link
                  href="/profile-settings"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </Link>
                <button
                  onClick={() => auth.signOut()}
                  className="inline-flex items-center px-8 py-3 bg-white text-red-600 border-2 border-red-200 font-semibold rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Back to Home
              </Link>
            )}
          </div>
        </div>

        {/* User Account Information - Only for Current User */}
        {isCurrentUser && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Display Name
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                    {user.displayName || "Not set"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                    {user.email || "Not set"}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    User ID
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono text-sm font-medium">
                    {user.uid}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Email Verified
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        user.emailVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.emailVerified ? (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Verified
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Not Verified
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Account Created
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                    {formatDate(user.createdAt || "")}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Last Sign In
                  </label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                    {formatDate(user.lastSignInTime || "")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User's Posts */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Posts by {user.displayName || "User"}
            </h2>
            <p className="text-lg text-gray-600">
              {posts.length} post{posts.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                No posts yet
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {isCurrentUser
                  ? "Start writing your first journal post!"
                  : "This user hasn't written any posts yet."}
              </p>
              {isCurrentUser && (
                <div className="mt-4">
                  <Link
                    href="/new-post"
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create First Post
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Post Header */}
                  <div className="p-8 pb-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 leading-tight pr-4">
                        {post.title}
                      </h3>
                      <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full whitespace-nowrap">
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Image Display */}
                  {post.photo && (
                    <div className="px-8 pb-6">
                      <img
                        src={post.photo}
                        alt={post.title}
                        className="w-full max-h-64 object-cover rounded-xl shadow-sm"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="px-8 pb-6">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {truncateContent(post.content)}
                    </p>
                  </div>

                  {/* Post Footer */}
                  <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {post.aiReview && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            AI Review
                          </span>
                        )}
                      </div>

                      {/* Action Buttons for Current User */}
                      {isCurrentUser && (
                        <div className="flex items-center space-x-4">
                          <Link
                            href={`/edit-post/${post.id}`}
                            className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </Link>
                          <button className="inline-flex items-center px-4 py-2 text-red-600 hover:text-red-800 font-medium transition-colors duration-200">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
