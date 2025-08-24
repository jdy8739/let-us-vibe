"use client";

import { Button, TextInput } from "@/src/components/shared";
import { useForm } from "react-hook-form";
import { auth } from "@/src/services/firebase";
import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";

const GitHubIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58 0-.28-.01-1.03-.02-2.02-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.35-1.76-1.35-1.76-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.25 1.86 1.25 1.08 1.86 2.83 1.32 3.52 1.01.11-.8.42-1.32.76-1.63-2.66-.3-5.46-1.34-5.46-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.51.12-3.15 0 0 1.01-.33 3.3 1.23a11.4 11.4 0 0 1 6 0c2.28-1.56 3.29-1.23 3.29-1.23.66 1.64.24 2.85.12 3.15.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.64-5.47 5.94.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
  </svg>
);

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
          <Button type="button" variant="secondary" leftIcon={<GitHubIcon />}>
            Login with GitHub
          </Button>
        </div>

        <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-gray-400">
          <span className="h-px bg-gray-200" />
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
  };
  return map[code] ?? "Unable to sign in. Please try again.";
}

export default Login;
