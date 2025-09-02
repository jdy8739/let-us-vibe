"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, auth, storage } from "@/src/services/firebase";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";
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

const EditPostPage = ({ params }: { params: { id: string } }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [aiReview, setAiReview] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, "posts", params.id));

        if (!postDoc.exists()) {
          setError("Post not found");
          setIsLoading(false);
          return;
        }

        const postData = { id: postDoc.id, ...postDoc.data() } as Post;

        // Check if current user owns this post
        if (!auth.currentUser || auth.currentUser.uid !== postData.uid) {
          setError("You don't have permission to edit this post");
          setIsLoading(false);
          return;
        }

        setPost(postData);
        setTitle(postData.title);
        setBody(postData.content);
        setAiReview(postData.aiReview);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError("Failed to load post");
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      const selectedFile = files[0];

      // Check file size (1MB = 1024 * 1024 bytes)
      if (selectedFile.size > 1024 * 1024) {
        alert("File size must be 1MB or less. Please select a smaller image.");
        e.target.value = ""; // Clear the input
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body");
      return;
    }

    if (!auth.currentUser || !post) {
      alert("Authentication error");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: any = {
        title: title.trim(),
        content: body.trim(),
        aiReview: aiReview,
        updatedAt: new Date(),
      };

      // If there's a new file, upload it
      if (file) {
        // Delete old image if exists
        if (post.photo) {
          try {
            const oldPhotoUrl = new URL(post.photo);
            const pathSegments = oldPhotoUrl.pathname.split("/");
            const oldStoragePath = pathSegments.slice(-3).join("/");
            const oldImageRef = ref(storage, oldStoragePath);
            await deleteObject(oldImageRef);
          } catch (imageError) {
            console.error("Error deleting old image:", imageError);
          }
        }

        // Upload new image
        const locationRef = ref(
          storage,
          `posts/${auth.currentUser.uid}-${
            auth.currentUser.displayName || "user"
          }/${post.id}`
        );

        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);

        updateData.photo = url;
      }

      // Update the post document
      await updateDoc(doc(db, "posts", post.id), updateData);

      alert("Post updated successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Edit Post
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Update your post with new content and images
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Loading post...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Error Loading Post
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              {error}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Input */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-lg font-semibold text-gray-900 mb-4"
                >
                  Post Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your post title..."
                />
              </div>

              {/* Content Input */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-lg font-semibold text-gray-900 mb-4"
                >
                  Post Content
                </label>
                <textarea
                  id="content"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={8}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                  placeholder="Write your thoughts, experiences, or memories here..."
                />
              </div>

              {/* Current Image Display */}
              {post?.photo && (
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Current Image
                  </label>
                  <div className="relative inline-block">
                    <img
                      src={post.photo}
                      alt="Current post image"
                      className="w-full max-w-md h-64 object-cover rounded-xl shadow-sm border-2 border-gray-200"
                    />
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </div>
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  {post?.photo ? "Replace Image" : "Add Image"} (Optional)
                </label>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-lg text-gray-600">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, GIF up to 1MB
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* File Info */}
                  {file && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-blue-700">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Review Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="aiReview"
                  checked={aiReview}
                  onChange={(e) => setAiReview(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-4 focus:ring-blue-100 focus:ring-offset-0"
                />
                <label
                  htmlFor="aiReview"
                  className="text-lg font-medium text-gray-900"
                >
                  Enable AI Review for this post
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link
                  href="/"
                  className="inline-flex items-center px-8 py-3 bg-white text-gray-700 border-2 border-gray-200 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Update Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditPostPage;
