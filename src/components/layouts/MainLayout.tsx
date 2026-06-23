import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../../css/MainLayout/MainLayout.css";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cerrar sidebar al cambiar de ruta (solo si está abierto)
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, sidebarOpen]); // 👈 Agregamos sidebarOpen a dependencias

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // No ocultamos el sidebar en ninguna ruta, siempre está en el DOM
  // Solo lo ocultamos visualmente con CSS en móvil
  return (
    <div className="layout">
      {/* Sidebar siempre renderizado, la clase "open" controla su visibilidad */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* Overlay solo cuando sidebar está abierto en móvil */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <div className="content-area">
        <Navbar onMenuClick={openSidebar} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}