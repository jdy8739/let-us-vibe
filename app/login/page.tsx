"use client";

import { Button, TextInput, GitHubButton } from "@/src/components/shared";
import { useForm } from "react-hook-form";
import { auth } from "@/src/services/firebase";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import Link from "next/link";

type LoginFormValues = { email: string; password: string };

const Login = () => {
  const router = useRouter();
  const { loading } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ mode: "onBlur" });

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(credential.user, {
        displayName: credential.user.displayName,
      });

      // AuthContext가 자동으로 로컬스토리지에 저장하므로 별도 처리 불필요
      router.push("/");
    } catch (err: unknown) {
      setError("root", {
        type: "server",
        message: mapFirebaseErrorToMessage(err),
      });
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
            Welcome Back
          </h1>
          <p style={{ padding: "0.5rem" }} className="text-lg text-gray-600">
            Sign in to your journal account
          </p>
        </div>

        {/* Login Form */}
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

            {/* Password Input */}
            <div style={{ padding: "0.75rem" }}>
              <label
                htmlFor="password"
                style={{ padding: "0.5rem 0" }}
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register("password", { required: "Password is required" })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter your password..."
              />
              {errors.password && (
                <p
                  style={{ padding: "0.25rem 0" }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.password.message}
                </p>
              )}
              <div style={{ padding: "0.5rem 0" }} className="text-right mt-2">
                <Link
                  href="/reset-password"
                  style={{ padding: "0.25rem 0.5rem" }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors rounded hover:bg-blue-50"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

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
                  <span style={{ padding: "0.25rem" }}>Signing In...</span>
                </>
              ) : (
                <span style={{ padding: "0.25rem" }}>Sign In</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ padding: "1.5rem 0" }} className="my-6">
            <div style={{ padding: "0.5rem" }} className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div
                style={{ padding: "0.5rem" }}
                className="relative flex justify-center text-sm"
              >
                <span
                  style={{ padding: "0 0.5rem" }}
                  className="bg-white text-gray-500"
                >
                  Or continue with
                </span>
              </div>
            </div>
          </div>

          {/* GitHub Sign In */}
          <button
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <svg
              className="w-5 h-5 mr-2 inline"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          {/* Sign Up Link */}
          <div
            style={{ padding: "2rem 1rem 0 1rem" }}
            className="mt-8 text-right"
          >
            <p style={{ padding: "0.5rem" }} className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                style={{ padding: "0.25rem 0.5rem" }}
                className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors rounded hover:bg-blue-50"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function mapFirebaseErrorToMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "unknown";
  const map: Record<string, string> = {
    "auth/invalid-credential": "Invalid email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
    // OAuth/GitHub specific
    "auth/account-exists-with-different-credential":
      "An account exists with the same email using a different sign-in method.",
    "auth/popup-closed-by-user": "Popup closed before completing sign in.",
    "auth/cancelled-popup-request":
      "Another sign-in popup is open. Please try again.",
    "auth/popup-blocked": "Popup was blocked by the browser.",
    "auth/operation-not-supported-in-this-environment":
      "Operation not supported in this environment.",
    "auth/unauthorized-domain":
      "This domain is not authorized for OAuth operations.",
  };
  return map[code] ?? "Unable to sign in. Please try again.";
}

export default Login;
