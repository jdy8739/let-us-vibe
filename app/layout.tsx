import "../styles/index.css";
import Client from "@/src/components/shared/client";
import Header from "@/src/components/layout/Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>
        <Header />
        {children}
      </body>
      <Client />
    </html>
  );
};

export default Layout;
