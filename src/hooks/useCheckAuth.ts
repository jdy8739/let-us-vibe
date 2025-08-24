import { useEffect } from "react";
import { auth } from "../services/firebase";
import { usePathname, useRouter } from "next/navigation";

const useCheckAuth = () => {
  const router = useRouter();

  const pathname = usePathname();

  useEffect(() => {
    if (!auth.currentUser && pathname !== "/login" && pathname !== "/signup") {
      router.push("/login");
    }
  }, [router, pathname]);
};

export default useCheckAuth;
