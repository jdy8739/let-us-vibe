"use client";

import React from "react";
import {
  GithubAuthProvider,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/src/services/firebase";
import { Button } from "./Button";

export type GitHubButtonProps = {
  label?: string;
  variant?: "primary" | "secondary";
  className?: string;
  onSuccess?: (credential: UserCredential) => void;
  onError?: (message: string, error: unknown) => void;
};

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

const GitHubButton: React.FC<GitHubButtonProps> = ({
  label = "Continue with GitHub",
  variant = "secondary",
  className,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const provider = new GithubAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      onSuccess?.(cred);
    } catch (err) {
      onError?.(mapOAuthErrorToMessage(err), err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      leftIcon={<GitHubIcon />}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {label}
    </Button>
  );
};

function mapOAuthErrorToMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "unknown";
  const map: Record<string, string> = {
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
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
  };
  return map[code] ?? "Unable to continue with GitHub. Please try again.";
}

export default GitHubButton;
