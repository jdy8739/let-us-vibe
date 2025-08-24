import { useEffect } from "react";
import { auth } from "../services/firebase";
import { useRouter } from "next/navigation";

const useCheckAuth = () => {
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login");
    }
  }, [router]);
};

export default useCheckAuth;
