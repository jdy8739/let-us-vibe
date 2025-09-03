"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/src/services/firebase";
import { useAuth } from "@/src/contexts/AuthContext";
import Link from "next/link";

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

const HomePage = () => {
  const { user, userData } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // 현재 사용자 정보 (Firebase user 또는 로컬스토리지 userData)
  const currentUser = user || (userData ? { uid: userData.uid } : null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];

        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDeletePost = async (postId: string, postUid: string) => {
    if (!currentUser) {
      alert("Please login to delete posts");
      return;
    }

    if (currentUser.uid !== postUid) {
      alert("You can only delete your own posts");
      return;
    }

    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeletingPostId(postId);

    try {
      // Find the post to get the image path
      const postToDelete = posts.find((post) => post.id === postId);

      // Delete the post document first
      await deleteDoc(doc(db, "posts", postId));

      // If the post has an image, delete it from Firebase Storage
      if (postToDelete?.photo) {
        try {
          // Extract the image path from the photo URL
          // The URL format is: https://firebasestorage.googleapis.com/.../posts/uid-username/postId
          const photoUrl = new URL(postToDelete.photo);
          const pathSegments = photoUrl.pathname.split("/");
          const storagePath = pathSegments.slice(-3).join("/"); // posts/uid-username/postId

          const imageRef = ref(storage, storagePath);
          await deleteObject(imageRef);
        } catch (imageError) {
          console.error("Error deleting image:", imageError);
          // Image deletion failed, but post was deleted, so continue
        }
      }

      // Remove the deleted post from local state
      setPosts(posts.filter((post) => post.id !== postId));

      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeletingPostId(null);
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "Unknown date";

    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-12 py-20">
          <h1 className="text-3xl font-semibold text-gray-900 mb-12 py-6 px-4">
            My Journal Posts
          </h1>
          <div className="text-center py-16 px-8">
            <div className="text-gray-600 py-4 px-6 text-lg">
              Loading posts...
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-28">
        {/* Header Section */}

        {/* Action Bar */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {currentUser && (
              <Link
                href={`/profile/${currentUser.uid}`}
                className="group inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-200/50 rounded-2xl hover:bg-white hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-medium text-lg shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                View Profile
              </Link>
            )}
            <Link
              href="/new-post"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 text-lg shadow-lg"
            >
              <svg
                className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-200"
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
              Create New Post
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="relative">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 text-center py-20 sm:py-24 lg:py-32 px-8 sm:px-12 lg:px-20 mx-auto max-w-4xl">
              {/* Decorative background elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl"></div>
              <div className="absolute top-8 left-8 w-20 h-20 bg-blue-100/30 rounded-full blur-xl"></div>
              <div className="absolute bottom-8 right-8 w-32 h-32 bg-indigo-100/30 rounded-full blur-xl"></div>

              <div className="relative z-10">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-8 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-14 h-14 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                    No posts yet
                  </span>
                </h3>

                <p className="text-gray-600 mb-12 max-w-md mx-auto text-lg leading-relaxed">
                  Start your journaling journey by creating your first post
                  <span className="block mt-2 text-base text-gray-500">
                    Share your thoughts, experiences, and memories
                  </span>
                </p>

                <Link
                  href="/new-post"
                  className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg shadow-lg"
                >
                  <svg
                    className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-200"
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
                  Create Your First Post
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12 lg:space-y-16">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className="p-6 group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl hover:bg-white hover:-translate-y-1 transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

                {/* Post Header */}
                <div className="p-8 sm:p-12 lg:p-16 pb-6 sm:pb-8 lg:pb-12">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 sm:gap-10 mb-8 sm:mb-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight flex-1 group-hover:text-blue-900 transition-colors duration-300">
                      {post.title}
                    </h2>
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center text-sm text-gray-500 bg-gradient-to-r from-gray-50 to-blue-50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-gray-200/50 font-medium shadow-sm">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-10 p-4 sm:p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100/50">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-blue-800 text-lg sm:text-xl font-bold shadow-lg ring-4 ring-white/50">
                      {post.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm text-gray-500 mb-1 font-medium uppercase tracking-wide">
                        Author
                      </div>
                      <Link
                        href={`/profile/${post.uid}`}
                        className="text-gray-900 hover:text-blue-700 font-semibold transition-all duration-200 text-lg sm:text-xl px-2 py-1 rounded-lg hover:bg-white/80 hover:shadow-sm"
                      >
                        {post.username}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Image Display */}
                {post.photo && (
                  <div className="px-8 sm:px-12 lg:px-16 pb-8 sm:pb-12 lg:pb-14">
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <img
                        src={post.photo}
                        alt={post.title}
                        className="w-full max-h-80 sm:max-h-96 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                )}

                {/* Post Content */}
                <div className="px-8 sm:px-12 lg:px-16 pb-8 sm:pb-12 lg:pb-16">
                  <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-2xl p-6 sm:p-8 border border-gray-100/50">
                    <p className="text-gray-700 text-lg sm:text-xl leading-relaxed">
                      {truncateContent(post.content)}
                    </p>
                  </div>
                </div>

                {/* Post Footer */}
                <div className="px-8 sm:px-12 lg:px-16 py-6 sm:py-8 lg:py-12 bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm border-t border-gray-200/50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-4">
                      {post.aiReview && (
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-sm">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          AI Reviewed
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {currentUser && currentUser.uid === post.uid && (
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/edit-post/${post.id}`}
                          className="group inline-flex items-center px-6 py-3 text-gray-700 hover:text-blue-700 font-medium rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200 border border-gray-200/50 hover:border-blue-200"
                        >
                          <svg
                            className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200"
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
                        <button
                          onClick={() => handleDeletePost(post.id, post.uid)}
                          disabled={deletingPostId === post.id}
                          className="group inline-flex items-center px-6 py-3 text-red-600 hover:text-red-700 font-medium rounded-xl hover:bg-red-50/80 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200/50 hover:border-red-300"
                        >
                          <svg
                            className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200"
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
                          {deletingPostId === post.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
