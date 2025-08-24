"use client";

import useCheckAuth from "@/src/hooks/useCheckAuth";
import useFirebaseAnalytics from "@/src/hooks/useFirebaseAnalytics";

const Client = () => {
  useFirebaseAnalytics();
  useCheckAuth();

  return null;
};

export default Client;
