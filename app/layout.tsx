import "../styles/index.css";
import Client from "@/src/components/shared/client";
import Header from "@/src/components/layout/Header";
import { AuthProvider } from "@/src/contexts/AuthContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 antialiased">
        <AuthProvider>
          <Header />
          <div className="min-h-[calc(100vh-64px)]">{children}</div>
          <Client />
        </AuthProvider>
      </body>
    </html>
  );
};

export default Layout;
