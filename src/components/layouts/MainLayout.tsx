import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../../css/MainLayout/MainLayout.css";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({
  children,
}: MainLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showSidebar = location.pathname !== "/" || sidebarOpen;

useEffect(() => {
  if (sidebarOpen) {
    setSidebarOpen(false);
  }
}, [location.pathname, sidebarOpen]);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      {showSidebar && <Sidebar open={sidebarOpen} onClose={closeSidebar} />}

      {showSidebar && sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <div className="content-area">
        <Navbar onMenuClick={openSidebar} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
