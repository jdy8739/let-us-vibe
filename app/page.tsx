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
        <main className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">
            My Journal Posts
          </h1>
          <div className="text-center py-8">
            <div className="text-gray-600">Loading posts...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            My Journal Posts
          </h1>
          <Link
            href="/new-post"
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
          >
            New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No posts yet</div>
            <p className="text-gray-400">
              Create your first journal post to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border rounded-lg p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {post.title}
                  </h2>
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
                      className="w-full max-h-96 object-cover rounded"
                    />
                  </div>
                )}

                <p className="text-gray-600 mb-4">
                  {truncateContent(post.content)}
                </p>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    By {post.username}
                  </div>

                  <div className="flex space-x-3">
                    {post.aiReview && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        AI Review
                      </span>
                    )}
                    {auth.currentUser && auth.currentUser.uid === post.uid && (
                      <>
                        <button className="text-gray-600 hover:text-gray-900 text-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id, post.uid)}
                          disabled={deletingPostId === post.id}
                          className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingPostId === post.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
