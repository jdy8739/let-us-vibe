"use client";

import { useEffect } from "react";
import app, { getAnalytics } from "../../services/firebase";

const FirebaseAnalytics = () => {
  useEffect(() => {
    const analytics = getAnalytics(app);

    console.group("Firebase", analytics, app);
  }, []);

  return null;
};

export default FirebaseAnalytics;
