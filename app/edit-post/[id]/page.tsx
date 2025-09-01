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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-gray-600">Loading post...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">Post not found</div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Edit Post
            </h1>
            <p className="text-gray-600">Update your journal entry below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Enter your post title"
                required
              />
            </div>

            {/* Body Input */}
            <div>
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Body
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
                placeholder="Write your journal entry here..."
                required
              />
            </div>

            {/* Current Image Display */}
            {post.photo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Image
                </label>
                <div className="mb-2">
                  <img
                    src={post.photo}
                    alt="Current post image"
                    className="w-full max-h-48 object-cover rounded"
                  />
                </div>
              </div>
            )}

            {/* New Image Upload */}
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {post.photo
                  ? "Replace Image (Optional)"
                  : "Add Image (Optional)"}
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 1MB. Supported formats: JPG, PNG, GIF, etc.
              </p>
              {file && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {/* AI Review Section */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="aiReview"
                  checked={aiReview}
                  onChange={(e) => setAiReview(e.target.checked)}
                  className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                />
                <label
                  htmlFor="aiReview"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Request AI Review
                </label>
              </div>

              {aiReview && (
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-gray-700 text-sm font-medium">
                      AI Review Enabled
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Your post will be analyzed for grammar, style, and
                    conciseness upon saving.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Post"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditPostPage;
