"use client";

import { useEffect } from "react";
import app, { getAnalytics } from "../services/firebase";

const useFirebaseAnalytics = () => {
  useEffect(() => {
    const analytics = getAnalytics(app);

    console.group("Firebase", analytics, app);
  }, []);
};

export default useFirebaseAnalytics;
