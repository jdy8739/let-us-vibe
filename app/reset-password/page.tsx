"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import { auth } from "@/src/services/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

type ResetFormValues = {
  email: string;
};

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({ mode: "onBlur" });

  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async ({ email }: ResetFormValues) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("Password reset email sent. Please check your inbox.");
    } catch (err: unknown) {
      const message = mapResetError(err);
      setInfo(null);
      setError("root", { type: "server", message });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div style={{ padding: "1rem" }} className="text-center mb-12">
          <h1
            style={{ padding: "1rem" }}
            className="text-4xl font-bold text-gray-900 mb-4 tracking-tight"
          >
            Reset Password
          </h1>
          <p style={{ padding: "0.5rem" }} className="text-lg text-gray-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Reset Password Form */}
        <div
          style={{ padding: "2rem" }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ padding: "1rem" }}
            className="space-y-6"
          >
            {/* Email Input */}
            <div style={{ padding: "0.75rem" }}>
              <label
                htmlFor="email"
                style={{ padding: "0.5rem 0" }}
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                {...register("email", { required: "Email is required" })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your email..."
              />
              {errors.email && (
                <p
                  style={{ padding: "0.25rem 0" }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Success Message */}
            {info && (
              <div
                style={{ padding: "1rem" }}
                className="bg-green-50 border border-green-200 rounded-xl"
              >
                <div
                  style={{ padding: "0.5rem" }}
                  className="flex items-center space-x-3"
                >
                  <svg
                    className="w-5 h-5 text-green-600"
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
                  <p
                    style={{ padding: "0.25rem" }}
                    className="text-green-800 text-sm font-medium"
                  >
                    {info}
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div
                style={{ padding: "1rem" }}
                className="bg-red-50 border border-red-200 rounded-xl"
              >
                <div
                  style={{ padding: "0.5rem" }}
                  className="flex items-center space-x-3"
                >
                  <svg
                    className="w-5 h-5 text-red-600"
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
                  <p
                    style={{ padding: "0.25rem" }}
                    className="text-red-800 text-sm font-medium"
                  >
                    {errors.root.message}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
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
                  <span style={{ padding: "0.25rem" }}>Sending...</span>
                </>
              ) : (
                <span style={{ padding: "0.25rem" }}>Send Reset Link</span>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div style={{ padding: "1rem" }} className="mt-8 text-right">
            <p style={{ padding: "0.5rem" }} className="text-gray-600">
              Remember your password?{" "}
              <Link
                href="/login"
                style={{ padding: "0.25rem 0.5rem" }}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors rounded hover:bg-blue-50"
              >
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

function mapResetError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "unknown";
  const map: Record<string, string> = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/missing-email": "Email is required.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
  };
  return map[code] ?? "Unable to send reset email. Please try again.";
}
