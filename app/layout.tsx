import { FirebaseAnalytics } from "@/src/components/business";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>{children}</body>
      <FirebaseAnalytics />
    </html>
  );
};

export default Layout;
