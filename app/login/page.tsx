"use client";

import { Button } from "@/src/components/shared";

const GoogleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="white"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21.35 11.1h-9.17v2.96h5.26c-.23 1.3-1.55 3.8-5.26 3.8-3.17 0-5.76-2.62-5.76-5.86s2.59-5.86 5.76-5.86c1.8 0 3.01.77 3.7 1.43l2.52-2.43C17.3 3.35 15.1 2.4 12.18 2.4 6.86 2.4 2.62 6.64 2.62 11.96s4.24 9.56 9.56 9.56c5.52 0 9.16-3.88 9.16-9.34 0-.63-.07-1.09-.19-1.99z" />
  </svg>
);

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

const Login = () => {
  return (
    <main className="container-center">
      <div className="card">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-2xl text-blue-600">
            *
          </div>
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
          <Button type="button" leftIcon={<GoogleIcon />}>
            Login with Google
          </Button>
          <Button type="button" variant="secondary" leftIcon={<GitHubIcon />}>
            Login with GitHub
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Login;
