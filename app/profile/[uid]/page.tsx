"use client";

import { useState, useEffect, use } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db, auth } from "@/src/services/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, Badge } from "@/src/components/shared";
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

const UserProfilePage = ({ params }: { params: Promise<{ uid: string }> }) => {
  const { uid } = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Fetching profile for UID:", uid);

        // Check if this is the current user's profile
        const currentUser = auth.currentUser;
        console.log("Current user:", currentUser?.uid);

        if (currentUser && currentUser.uid === uid) {
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
            where("uid", "==", uid),
            limit(1)
          );
          const postsSnapshot = await getDocs(postsQuery);

          if (!postsSnapshot.empty) {
            const firstPost = postsSnapshot.docs[0].data();
            console.log("Found post data:", firstPost);
            setUser({
              uid: uid,
              email: null,
              displayName: firstPost.username || "User",
              photoURL: null,
              emailVerified: false,
            });
          } else {
            console.log("No posts found for this user");
            setUser({
              uid: uid,
              email: null,
              displayName: "User",
              photoURL: null,
              emailVerified: false,
            });
          }
        }

        // Fetch posts by this user
        console.log("Fetching posts for UID:", uid);
        const postsQuery = query(
          collection(db, "posts"),
          where("uid", "==", uid)
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
  }, [uid, router]);

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
            <div style={{ padding: "1rem" }}>
              <Link
                href="/"
                style={{ padding: "0.5rem 1rem" }}
                className="inline-flex items-center bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold text-lg transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main style={{ padding: "4rem 1.5rem" }} className="max-w-5xl mx-auto">
        {/* User Profile Header */}
        <div
          style={{ padding: "2rem", marginBottom: "2.5rem" }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div
            style={{ padding: "1rem", gap: "1.5rem" }}
            className="flex items-center justify-between"
          >
            <div
              style={{ padding: "0.5rem", gap: "1.25rem" }}
              className="flex items-center"
            >
              <div style={{ padding: "0.5rem" }} className="relative">
                <Avatar
                  src={user.photoURL || undefined}
                  initials={user.displayName || "U"}
                  size={96}
                />
                <span className="absolute -bottom-1 -right-1 block w-4 h-4 rounded-full bg-green-500 ring-2 ring-white" />
              </div>
              <div style={{ padding: "0.5rem" }}>
                <h1
                  style={{ padding: "0.5rem 0" }}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight"
                >
                  {user.displayName || "User"}
                </h1>
                <div
                  style={{ padding: "0.25rem 0", gap: "0.5rem" }}
                  className="mt-1 flex items-center text-sm text-gray-600"
                >
                  {user.email && <span>{user.email}</span>}
                  {user.emailVerified && (
                    <Badge tone="green" size="sm">
                      Verified
                    </Badge>
                  )}
                  {isCurrentUser && (
                    <Badge tone="neutral" size="sm">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div
              style={{ padding: "0.5rem" }}
              className="flex items-center gap-3"
            >
              {isCurrentUser ? (
                <>
                  <Link
                    href="/profile-settings"
                    style={{ padding: "0.625rem 1.25rem" }}
                    className="inline-flex items-center bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => auth.signOut()}
                    style={{ padding: "0.625rem 1.25rem" }}
                    className="inline-flex items-center bg-white text-gray-700 border border-gray-200 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
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
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/"
                  style={{ padding: "0.625rem 1.25rem" }}
                  className="inline-flex items-center bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
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
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Back to Home
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* User Account Information - Only for Current User */}
        {isCurrentUser && (
          <div
            style={{ padding: "2rem", marginBottom: "2.5rem" }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <h2
              style={{ padding: "1rem 0 1.5rem 0" }}
              className="text-2xl font-bold text-gray-900 text-center"
            >
              Account Information
            </h2>

            <dl
              style={{ padding: "1rem", gap: "1.5rem" }}
              className="grid grid-cols-1 md:grid-cols-2"
            >
              <div className="space-y-5">
                <div>
                  <dt className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide px-2 py-1">
                    Display Name
                  </dt>
                  <dd className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                    {user.displayName || "Not set"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide px-2 py-1">
                    Email Address
                  </dt>
                  <dd className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                    {user.email || "Not set"}
                  </dd>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <dt className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide px-2 py-1">
                    User ID
                  </dt>
                  <dd className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono text-sm">
                    {user.uid}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide px-2 py-1">
                    Email Verified
                  </dt>
                  <dd className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.emailVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.emailVerified ? (
                        <>
                          <svg
                            className="w-3.5 h-3.5 mr-1.5"
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
                            className="w-3.5 h-3.5 mr-1.5"
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
                  </dd>
                </div>
              </div>
            </dl>

            {/* Account Details */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Account Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide px-2 py-1">
                    Account Created
                  </dt>
                  <dd className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                    {formatDate(user.createdAt || "")}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide px-2 py-1">
                    Last Sign In
                  </dt>
                  <dd className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                    {formatDate(user.lastSignInTime || "")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* User's Posts */}
        <div
          style={{ padding: "2rem" }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <div
            style={{ padding: "1rem", marginBottom: "1.5rem" }}
            className="text-center"
          >
            <h2
              style={{ padding: "0.5rem 0" }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Posts by {user.displayName || "User"}
            </h2>
            <p style={{ padding: "0.5rem" }} className="text-sm text-gray-600">
              {posts.length} post{posts.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
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
              <h3
                style={{ padding: "0.75rem 1rem" }}
                className="text-xl font-semibold text-gray-900 mb-2"
              >
                No posts yet
              </h3>
              <p
                style={{ padding: "0.5rem 1rem" }}
                className="text-gray-600 text-base mb-6 max-w-md mx-auto"
              >
                {isCurrentUser
                  ? "Start writing your first journal post!"
                  : "This user hasn't written any posts yet."}
              </p>
              {isCurrentUser && (
                <div style={{ padding: "0.5rem" }} className="mt-2">
                  <Link
                    href="/new-post"
                    style={{ padding: "0.5rem 1rem" }}
                    className="inline-flex items-center bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span style={{ padding: "0.25rem" }}>
                      Create First Post
                    </span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Post Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3
                        style={{ padding: "0.5rem 1rem 0.5rem 0" }}
                        className="text-xl font-semibold text-gray-900 leading-tight"
                      >
                        {post.title}
                      </h3>
                      <div
                        style={{ padding: "0.25rem 0.625rem" }}
                        className="text-xs text-gray-600 bg-gray-50 rounded-full whitespace-nowrap"
                      >
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Image Display */}
                  {post.photo && (
                    <div className="px-6 pb-5">
                      <img
                        src={post.photo}
                        alt={post.title}
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Post Content */}
                  <div className="px-6 pb-5">
                    <p
                      style={{ padding: "0.75rem" }}
                      className="text-gray-700 text-base leading-relaxed"
                    >
                      {truncateContent(post.content)}
                    </p>
                  </div>

                  {/* Post Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        {post.aiReview && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800">
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
                            <span style={{ padding: "0.125rem" }}>
                              AI Review
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Action Buttons for Current User */}
                      {isCurrentUser && (
                        <div
                          style={{ padding: "0.5rem" }}
                          className="flex items-center gap-3"
                        >
                          <Link
                            href={`/edit-post/${post.id}`}
                            style={{ padding: "0.25rem 0.75rem" }}
                            className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 rounded hover:bg-gray-100"
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
                            <span style={{ padding: "0.125rem" }}>Edit</span>
                          </Link>
                          <button
                            style={{ padding: "0.375rem 0.75rem" }}
                            className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span style={{ padding: "0.125rem" }}>Delete</span>
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
