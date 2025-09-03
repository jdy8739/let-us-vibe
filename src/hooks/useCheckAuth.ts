import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const useCheckAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    // 로딩 중이면 대기
    if (loading) return;

    // 공개 페이지들
    const publicPages = ["/login", "/signup", "/reset-password"];
    const isPublicPage = publicPages.includes(pathname);

    // 사용자가 로그인하지 않았고 공개 페이지가 아닌 경우 로그인 페이지로 리디렉션
    if (!user && !userData && !isPublicPage) {
      router.push("/login");
    }

    // 사용자가 로그인했고 로그인/회원가입 페이지에 있는 경우 홈으로 리디렉션
    if (
      (user || userData) &&
      (pathname === "/login" || pathname === "/signup")
    ) {
      router.push("/");
    }
  }, [user, userData, loading, pathname, router]);
};

export default useCheckAuth;
