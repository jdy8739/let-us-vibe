"use client";

import { Button, TextInput, GitHubButton } from "@/src/components/shared";
import { useForm } from "react-hook-form";
import { auth } from "@/src/services/firebase";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

// GitHub icon moved into shared GitHubButton

type LoginFormValues = { email: string; password: string };

const Login = () => {
  const router = useRouter();
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

      router.push("/");
    } catch (err: unknown) {
      setError("root", {
        type: "server",
        message: mapFirebaseErrorToMessage(err),
      });
    }
  };

  // deprecated: logic moved into shared GitHubButton

  return (
    <main className="container-center">
      <div className="card">
        <div className="mb-5 text-center">
          <h1 className="title-lg">
            Welcome to Work Journal
            <br />
            Feed
          </h1>
          <p className="text-muted mt-2">
            Unlock your productivity, one entry at a time.
          </p>
        </div>

        <div className="grid gap-2.5">
          <GitHubButton
            label="Login with GitHub"
            onSuccess={() => router.push("/")}
          />
          <span className="text-xs">or</span>
          <span className="h-px bg-gray-200" />
        </div>

        <form className="form" onSubmit={handleSubmit(onSubmit)}>
          {errors.root?.message && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.message}
            </div>
          )}

          <TextInput
            label="Email"
            type="email"
            placeholder="your.email@example.com"
            {...register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />
          <TextInput
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
            error={errors.password?.message}
          />

          <Button type="submit" disabled={isSubmitting}>
            Log In
          </Button>
        </form>
        <div className="mt-3 text-center text-sm">
          <Link
            href="/reset-password"
            className="text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <p className="text-muted mt-5 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
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
