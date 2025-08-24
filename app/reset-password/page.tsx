"use client";

import { useForm } from "react-hook-form";
import { Button, TextInput } from "@/src/components/shared";
import Link from "next/link";

type ResetFormValues = {
  email: string;
};

const ResetPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({ mode: "onBlur" });

  const onSubmit = async () => {
    // no-op as requested
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
