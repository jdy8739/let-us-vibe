"use client";

import { auth } from "@/src/services/firebase";

const Home = () => {
  return <div>Welcome {auth.currentUser?.displayName}</div>;
};

export default Home;
