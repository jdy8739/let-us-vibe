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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* User Profile Header */}
        <div className="bg-white border rounded-lg p-8 mb-8">
          <div className="text-center mb-6">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200"
              />
            )}
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {user.displayName || "User"}
            </h1>
            {isCurrentUser && (
              <p className="text-gray-600 mb-4">This is your profile</p>
            )}
          </div>

          {/* Profile Actions */}
          <div className="flex justify-center space-x-4">
            {isCurrentUser ? (
              <>
                <Link
                  href="/profile-settings"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => auth.signOut()}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/"
                className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                Back to Home
              </Link>
            )}
          </div>
        </div>

        {/* User Account Information - Only for Current User */}
        {isCurrentUser && (
          <div className="bg-white border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Account Information
            </h2>

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
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Created
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900">
                    {formatDate(user.createdAt || "")}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Sign In
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-gray-900">
                    {formatDate(user.lastSignInTime || "")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User's Posts */}
        <div className="bg-white border rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Posts by {user.displayName || "User"}
            </h2>
            <p className="text-gray-600">
              {posts.length} post{posts.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">No posts yet</div>
              <p className="text-gray-400">
                {isCurrentUser
                  ? "Start writing your first journal post!"
                  : "This user hasn't written any posts yet."}
              </p>
              {isCurrentUser && (
                <div className="mt-4">
                  <Link
                    href="/new-post"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create First Post
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {post.title}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>

                  {/* Image Display */}
                  {post.photo && (
                    <div className="mb-4">
                      <img
                        src={post.photo}
                        alt={post.title}
                        className="w-full max-h-64 object-cover rounded"
                      />
                    </div>
                  )}

                  <p className="text-gray-600 mb-4">
                    {truncateContent(post.content)}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3">
                      {post.aiReview && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          AI Review
                        </span>
                      )}
                    </div>

                    {/* Action Buttons for Current User */}
                    {isCurrentUser && (
                      <div className="flex space-x-3">
                        <Link
                          href={`/edit-post/${post.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </Link>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
