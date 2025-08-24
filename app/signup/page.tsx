"use client";

import { useForm } from "react-hook-form";
import { Button, TextInput, GitHubButton } from "@/src/components/shared";
import Link from "next/link";
import { auth } from "@/src/services/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// GitHub icon is provided by shared GitHubButton

const Signup = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ mode: "onBlur" });

  const onSubmit = async ({ name, email, password }: SignupFormValues) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      router.push("/");
    } catch (err: unknown) {
      setError("root", { type: "server", message: mapSignupError(err) });
    }
  };

  const passwordValue = watch("password");

  // GitHub OAuth handled by shared GitHubButton

  return (
    <main className="container-center">
      <div className="card">
        <h1 className="title-lg">Work Journal</h1>
        <p className="text-muted mt-2 text-center">
          Create your account to start logging your daily tasks and insights.
        </p>

        <div className="grid gap-2.5">
          <GitHubButton
            label="Sign up with GitHub"
            onSuccess={() => router.push("/")}
          />
        </div>

        <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-gray-400">
          <span className="h-px bg-gray-200" />
          <span className="text-xs">or</span>
          <span className="h-px bg-gray-200" />
        </div>

        <form className="form mt-5" onSubmit={handleSubmit(onSubmit)}>
          {errors.root?.message && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.message}
            </div>
          )}
          <TextInput
            label="Name"
            placeholder="Enter your full name"
            {...register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />
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
            placeholder="Create a strong password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Must be at least 8 characters" },
            })}
            error={errors.password?.message}
          />
          <p className="text-muted -mt-2">
            Must be at least 8 characters and include uppercase, lowercase, and
            a number.
          </p>
          <TextInput
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            {...register("confirmPassword", {
              required: "Confirm your password",
              validate: (v) => v === passwordValue || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" disabled={isSubmitting}>
            Sign Up
          </Button>
        </form>

        <p className="text-muted mt-5 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Signup;

function mapSignupError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "unknown";
  const map: Record<string, string> = {
    "auth/email-already-in-use": "This email is already in use.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/operation-not-allowed": "Email/password accounts are not enabled.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
  };
  return map[code] ?? "Unable to sign up. Please try again.";
}
