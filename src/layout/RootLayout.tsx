import { useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && <Sidebar />}
      <div className={`flex-1 ${!isAuthPage ? "ml-64" : ""}`}>{children}</div>
    </div>
  );
}
