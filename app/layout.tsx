import "../styles/index.css";
import Client from "@/src/components/shared/client";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>{children}</body>
      <Client />
    </html>
  );
};

export default Layout;
