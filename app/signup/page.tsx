"use client";

import { useForm } from "react-hook-form";
import { Button, TextInput } from "@/src/components/shared";
import Link from "next/link";

type SignupFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const Signup = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ mode: "onBlur" });

  const onSubmit = async () => {
    // no-op as requested
  };

  const passwordValue = watch("password");

  return (
    <main className="container-center">
      <div className="card">
        <h1 className="title-lg">Work Journal</h1>
        <p className="text-muted mt-2 text-center">
          Create your account to start logging your daily tasks and insights.
        </p>

        <form className="form mt-5" onSubmit={handleSubmit(onSubmit)}>
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
