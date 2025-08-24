"use client";

import { useForm } from "react-hook-form";
import { Button, TextInput } from "@/src/components/shared";
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
    <main className="container-center">
      <div className="card">
        <h1 className="title-lg">Reset your password</h1>
        <p className="text-muted mt-2 text-center">
          Enter the email address you registered with and we&apos;ll send you
          instructions to reset your password.
        </p>

        <form className="form mt-5" onSubmit={handleSubmit(onSubmit)}>
          {errors.root?.message && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.message}
            </div>
          )}
          {info && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {info}
            </div>
          )}
          <TextInput
            label="Email address"
            type="email"
            placeholder="your.email@example.com"
            {...register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />

          <Button type="submit" disabled={isSubmitting}>
            Send Reset Instructions
          </Button>
        </form>

        <div className="mt-3.5 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
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
