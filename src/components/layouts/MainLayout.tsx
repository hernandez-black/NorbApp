import type { ReactNode } from "react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../../css/MainLayout/MainLayout.css";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <div className="content-area">
        <Navbar onMenuClick={openSidebar} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}