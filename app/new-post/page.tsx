"use client";

import { useState } from "react";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "@/src/services/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main style={{ padding: "4rem 1.5rem" }} className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div style={{ padding: "1rem", marginBottom: "2.5rem" }}>
          <h1
            style={{ padding: "1rem 0" }}
            className="text-4xl font-bold text-gray-900 tracking-tight"
          >
            Create New Post
          </h1>
          <p
            style={{ padding: "0.5rem 0" }}
            className="mt-2 text-base text-gray-600 max-w-3xl"
          >
            Share your thoughts and experiences with the world.
          </p>
        </div>

        {/* Form Container */}
        <div
          style={{ padding: "2rem" }}
          className="bg-white rounded-xl shadow-sm border border-gray-200"
        >
          <form
            onSubmit={handleSubmit}
            style={{ padding: "1rem", gap: "1.5rem" }}
            className="space-y-6"
          >
            {/* Title Input */}
            <div style={{ padding: "1rem" }}>
              <label
                htmlFor="title"
                style={{ padding: "0.5rem 0 0.625rem 0" }}
                className="block text-sm font-semibold text-gray-900"
              >
                Post Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Post title"
              />
            </div>

            {/* Content Input */}
            <div style={{ padding: "1rem" }}>
              <label
                htmlFor="content"
                style={{ padding: "0.5rem 0 0.625rem 0" }}
                className="block text-sm font-semibold text-gray-900"
              >
                Post Content
              </label>
              <textarea
                id="content"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                placeholder="Write your thoughts here..."
              />
            </div>

            {/* Image Upload */}
            <div style={{ padding: "1rem" }}>
              <label
                style={{ padding: "0.5rem 0 0.625rem 0" }}
                className="block text-sm font-semibold text-gray-900"
              >
                Add Image (Optional)
              </label>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
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
                      <p className="mb-1.5 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
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
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-5 h-5 text-gray-700"
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
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
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
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="aiReview"
                checked={aiReview}
                onChange={(e) => setAiReview(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-4 focus:ring-blue-100 focus:ring-offset-0"
              />
              <label
                htmlFor="aiReview"
                className="text-sm font-medium text-gray-900"
              >
                Enable AI Review for this post
              </label>
            </div>

            {/* Action Buttons */}
            <div
              style={{ padding: "1rem" }}
              className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200"
            >
              <Link
                href="/"
                style={{ padding: "0.5rem 1rem" }}
                className="inline-flex items-center bg-white text-gray-700 border border-gray-200 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                    Creating...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Create Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewPostPage;
