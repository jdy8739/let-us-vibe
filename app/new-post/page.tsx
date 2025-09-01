"use client";

import { useState } from "react";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "@/src/services/firebase";
import { useRouter } from "next/navigation";

const NewPostPage = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [aiReview, setAiReview] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length === 1) {
      setFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body");
      return;
    }

    if (!auth.currentUser) {
      alert("Please login to create a post");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create the post document
      const postData = {
        title: title.trim(),
        content: body.trim(),
        username:
          auth.currentUser.displayName || auth.currentUser.email || "Anonymous",
        uid: auth.currentUser.uid,
        createdAt: new Date(),
        aiReview: aiReview,
      };

      const docRef = await addDoc(collection(db, "posts"), postData);

      // If there's a file, upload it to Firebase Storage
      if (file) {
        const locationRef = ref(
          storage,
          `posts/${auth.currentUser.uid}-${
            auth.currentUser.displayName || "user"
          }/${docRef.id}`
        );

        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);

        // Update the post document with the image URL
        await updateDoc(doc(db, "posts", docRef.id), {
          photo: url,
        });
      }

      alert("Post created successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Create New Post
            </h1>
            <p className="text-gray-600">Write your new journal entry below.</p>
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

            {/* Image Upload */}
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Image (Optional)
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              {file && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
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
                {isSubmitting ? "Creating..." : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewPostPage;
