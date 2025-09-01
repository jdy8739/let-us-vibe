"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/src/services/firebase";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  username: string;
  uid: string;
  createdAt: any;
  aiReview: boolean;
  photo?: string;
}

const HomePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
                    <button className="text-gray-600 hover:text-gray-900 text-sm">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900 text-sm">
                      Delete
                    </button>
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
