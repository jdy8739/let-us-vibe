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
import { db, auth, storage } from "@/src/services/firebase";
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

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
    if (!auth.currentUser) {
      alert("Please login to delete posts");
      return;
    }

    if (auth.currentUser.uid !== postUid) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-5xl mx-auto px-12 py-24">
        {/* Header Section */}
        <div className="mb-20 py-12 px-4">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight py-6 px-4">
            My Journal Posts
          </h1>
          <p className="mt-6 text-base text-gray-600 max-w-3xl py-5 px-4 leading-relaxed">
            Keep your thoughts organized and look back on moments that matter.
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-20 py-10 px-4">
          <div className="flex items-center gap-6">
            {auth.currentUser && (
              <Link
                href={`/profile/${auth.currentUser.uid}`}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-lg"
              >
                <svg
                  className="w-6 h-6 mr-4"
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
                Profile
              </Link>
            )}
            <Link
              href="/new-post"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
            >
              <svg
                className="w-6 h-6 mr-4"
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
              New Post
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 text-center py-32 px-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-10 flex items-center justify-center p-6">
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
            <h3 className="text-3xl font-bold text-gray-900 mb-8 py-4 px-6">
              No posts yet
            </h3>
            <p className="text-gray-600 mb-16 max-w-lg mx-auto py-6 px-8 leading-relaxed text-lg">
              Start your journaling journey by creating your first post
            </p>
            <Link
              href="/new-post"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors duration-200 shadow-sm hover:shadow-md text-lg"
            >
              <svg
                className="w-6 h-6 mr-4"
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
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 p-2"
              >
                {/* Post Header */}
                <div className="p-16 pb-12">
                  <div className="flex justify-between items-start gap-10 mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight flex-1 py-4 px-2">
                      {post.title}
                    </h2>
                    <div className="text-sm text-gray-500 bg-gray-50 px-8 py-4 rounded-lg whitespace-nowrap font-medium">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-8 mb-10 py-6 px-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-700 text-lg font-bold ring-2 ring-white shadow-sm p-2">
                      {post.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="py-3 px-2">
                      <div className="text-sm text-gray-500 mb-3 px-2 py-1">
                        Author
                      </div>
                      <Link
                        href={`/profile/${post.uid}`}
                        className="text-gray-900 hover:text-gray-700 font-semibold transition-colors px-3 py-2 text-lg rounded-lg hover:bg-gray-50"
                      >
                        {post.username}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Image Display */}
                {post.photo && (
                  <div className="px-16 pb-14">
                    <div className="rounded-xl overflow-hidden bg-gray-100 shadow-sm p-2">
                      <img
                        src={post.photo}
                        alt={post.title}
                        className="w-full max-h-80 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Post Content */}
                <div className="px-16 pb-16">
                  <p className="text-gray-700 text-lg leading-relaxed py-6 px-4">
                    {truncateContent(post.content)}
                  </p>
                </div>

                {/* Post Footer */}
                <div className="px-16 py-12 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-6 py-4 px-2">
                      {post.aiReview && (
                        <span className="inline-flex items-center px-7 py-4 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <svg
                            className="w-4 h-4 mr-3"
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
                    {auth.currentUser && auth.currentUser.uid === post.uid && (
                      <div className="flex items-center gap-4 py-4 px-2">
                        <Link
                          href={`/edit-post/${post.id}`}
                          className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-white transition-all duration-200 border border-transparent hover:border-gray-200 text-lg"
                        >
                          <svg
                            className="w-5 h-5 mr-3"
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
                          className="inline-flex items-center px-10 py-5 text-red-600 hover:text-red-800 font-medium rounded-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-red-200 text-lg"
                        >
                          <svg
                            className="w-5 h-5 mr-3"
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
