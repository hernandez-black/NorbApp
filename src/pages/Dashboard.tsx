import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useOrdenes } from '../context/useOrdenes';
import { usuariosMock } from '../mocks/data';
import {
  FaClipboardList, FaCar, FaUsers, FaTools,
  FaCheckCircle, FaClock, FaWrench, FaExclamationCircle,
} from "react-icons/fa";
import "../css/Dasbhoard/Dashboard.css";
import type { EstadoOrden } from "../types";

// 🔥 Cambio: JSX.Element → React.ReactNode
const estadoConfig: Record<EstadoOrden, { label: string; clase: string; icon: React.ReactNode }> = {
  "Ingresado":    { label: "Ingresado",    clase: "badge-ingresado",    icon: <FaClock /> },
  "Diagnosticado":{ label: "Diagnosticado",clase: "badge-diagnosticado",icon: <FaExclamationCircle /> },
  "Autorizado":   { label: "Autorizado",   clase: "badge-autorizado",   icon: <FaWrench /> },
  "Terminado":    { label: "Terminado",    clase: "badge-terminado",    icon: <FaCheckCircle /> },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { ordenes } = useOrdenes();

  // 🔥 Inicializar stats con valores calculados
  const [stats, setStats] = useState(() => {
    const activas = ordenes.filter(o => o.estado !== 'Terminado').length;
    const vehiculosEnTaller = new Set(ordenes.filter(o => o.estado !== 'Terminado').map(o => o.vehiculo_id)).size;
    const clientes = new Set(ordenes.map(o => o.cliente_id)).size;
    const mecanicosActivos = usuariosMock.filter(u => u.rol === 'mecanico' && u.activo).length;
    return {
      ordenesActivas: activas,
      vehiculosTaller: vehiculosEnTaller,
      clientes,
      mecanicosActivos,
    };
  });

  // 🔥 Usar useRef para evitar la advertencia de setState en efecto
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Solo actualizar si no es la primera ejecución (ya que el estado inicial ya tiene los valores)
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const activas = ordenes.filter(o => o.estado !== 'Terminado').length;
    const vehiculosEnTaller = new Set(ordenes.filter(o => o.estado !== 'Terminado').map(o => o.vehiculo_id)).size;
    const clientes = new Set(ordenes.map(o => o.cliente_id)).size;
    const mecanicosActivos = usuariosMock.filter(u => u.rol === 'mecanico' && u.activo).length;

    setStats({
      ordenesActivas: activas,
      vehiculosTaller: vehiculosEnTaller,
      clientes,
      mecanicosActivos,
    });
  }, [ordenes]);

  // Órdenes recientes (últimas 5)
  const ordenesRecientes = ordenes.slice(0, 5).map(o => ({
    id: o.id,
    numero: `ORD-${o.numero.toString().padStart(3, '0')}`,
    cliente: o.cliente?.nombre || "Cliente",
    vehiculo: o.vehiculo ? `${o.vehiculo.marca} ${o.vehiculo.modelo} ${o.vehiculo.anio}` : "Vehículo",
    mecanico: "No asignado",
    estado: o.estado,
    fecha: o.creado_en,
  }));

  // Actividad reciente (de bitácora de todas las órdenes)
  const actividad = ordenes.flatMap(o =>
    (o.bitacora || []).map(b => ({
      texto: `${b.descripcion} (ORD-${o.numero.toString().padStart(3, '0')})`,
      tiempo: b.creado_en,
      tipo: 'info' as const,
    }))
  ).slice(0, 5);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-sub">Bienvenido, Administrador</p>
        </div>
        <button className="btn-nueva-orden" onClick={() => navigate("/ordenes/nueva")}>
          + Nueva Orden
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon"><FaClipboardList /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.ordenesActivas}</span>
            <span className="stat-label">Órdenes Activas</span>
          </div>
        </div>
        <div className="stat-card stat-dark">
          <div className="stat-icon"><FaCar /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.vehiculosTaller}</span>
            <span className="stat-label">Vehículos en Taller</span>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.clientes}</span>
            <span className="stat-label">Clientes Registrados</span>
          </div>
        </div>
        <div className="stat-card stat-dark">
          <div className="stat-icon"><FaTools /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.mecanicosActivos}</span>
            <span className="stat-label">Mecánicos Activos</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="dashboard-grid">
        {/* Tabla órdenes */}
        <div className="dash-card ordenes-card">
          <div className="card-header">
            <h2 className="card-title"><FaClipboardList /> Órdenes Recientes</h2>
            <button className="btn-ver-todo" onClick={() => navigate("/ordenes")}>Ver todo</button>
          </div>
          <div className="table-wrapper">
            <table className="dash-table">
              <thead><tr><th>Orden</th><th>Cliente</th><th>Vehículo</th><th>Mecánico</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody>
                {ordenesRecientes.map((o) => {
                  const cfg = estadoConfig[o.estado];
                  return (
                    <tr key={o.id} className="fila-clickeable" onClick={() => navigate(`/ordenes/${o.id}`)}>
                      <td className="orden-num">{o.numero}</td>
                      <td>{o.cliente}</td>
                      <td className="text-muted">{o.vehiculo}</td>
                      <td>{o.mecanico}</td>
                      <td><span className={`badge ${cfg.clase}`}>{cfg.icon} {cfg.label}</span></td>
                      <td className="text-muted">{o.fecha}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="dash-card actividad-card">
          <div className="card-header">
            <h2 className="card-title"><FaClock /> Actividad Reciente</h2>
          </div>
          <ul className="actividad-lista">
            {actividad.map((a, i) => (
              <li key={i} className={`actividad-item act-${a.tipo}`}>
                <div className="act-dot" />
                <div className="act-info">
                  <p className="act-texto">{a.texto}</p>
                  <span className="act-tiempo">{a.tiempo}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}