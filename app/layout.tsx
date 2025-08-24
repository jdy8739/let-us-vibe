import { Firebase } from "@/src/components/business";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>{children}</body>
      <Firebase />
    </html>
  );
};

export default Layout;
