import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OrdenProvider } from "../context/OrdenContext";
import MainLayout from "../components/layouts/MainLayout";

// Páginas sin layout
import Home from "../pages/Home";
import Login from "../pages/Login";

// Páginas con layout
import Dashboard from "../pages/Dashboard";
import Ordenes from "../pages/Orden/Ordenes";
import DetalleOrden from "../pages/Orden/DetallesOrdenes";
import NuevaOrden from "../pages/Orden/NuevaOrden";
import Clientes from "../pages/Clientes";
import Vehiculos from "../pages/Vehiculos";
import Administracion from "../pages/Administrador";

const isAuthenticated = () => !!localStorage.getItem("rol");
const getRole = () => localStorage.getItem("rol");

function RutaProtegida({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

function SoloAdmin({ children }: { children: React.ReactNode }) {
  return getRole() === "admin" ? <>{children}</> : <Navigate to="/ordenes" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <OrdenProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <RutaProtegida><SoloAdmin><MainLayout><Dashboard /></MainLayout></SoloAdmin></RutaProtegida>
          } />

          <Route path="/ordenes" element={
            <RutaProtegida><MainLayout><Ordenes /></MainLayout></RutaProtegida>
          } />

          <Route path="/ordenes/nueva" element={
            <RutaProtegida><MainLayout><NuevaOrden /></MainLayout></RutaProtegida>
          } />

          <Route path="/ordenes/:id" element={
            <RutaProtegida><MainLayout><DetalleOrden /></MainLayout></RutaProtegida>
          } />

          <Route path="/clientes" element={
            <RutaProtegida><MainLayout><Clientes /></MainLayout></RutaProtegida>
          } />

          <Route path="/vehiculos" element={
            <RutaProtegida><MainLayout><Vehiculos /></MainLayout></RutaProtegida>
          } />

          <Route path="/administracion" element={
            <RutaProtegida><SoloAdmin><MainLayout><Administracion /></MainLayout></SoloAdmin></RutaProtegida>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OrdenProvider>
    </BrowserRouter>
  );
}