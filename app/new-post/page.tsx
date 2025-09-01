"use client";

import { useState } from "react";
import { Header } from "@/src/components/shared";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [aiReview, setAiReview] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Create New Post
            </h1>
            <p className="text-gray-600">Write your new journal entry below.</p>
          </div>

          <form className="space-y-6">
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
              />
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
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
              >
                Create Post
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
