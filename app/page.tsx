"use client";

import { Header } from "@/src/components/shared";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          My Journal Posts
        </h1>

        {/* Content will be added here later */}
      </main>
    </div>
  );
}
