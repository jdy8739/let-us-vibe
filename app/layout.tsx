import Firebase from "@/src/components/business/Firebase";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>{children}</body>
      <Firebase />
    </html>
  );
};

export default Layout;
