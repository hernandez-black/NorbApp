import {
  FaClipboardList, FaCar, FaUsers, FaTools,
  FaCheckCircle, FaClock, FaWrench, FaExclamationCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import type { ReactElement } from "react";
import "../css/Dasbhoard/Dashboard.css";
import type { EstadoOrden } from "../types";

const stats = [
  { icon: <FaClipboardList />, label: "Órdenes Activas", value: 12, color: "stat-blue" },
  { icon: <FaCar />,           label: "Vehículos en Taller", value: 8, color: "stat-dark" },
  { icon: <FaUsers />,         label: "Clientes Registrados", value: 145, color: "stat-blue" },
  { icon: <FaTools />,         label: "Mecánicos Activos", value: 5, color: "stat-dark" },
];

interface OrdenResumen {
  id: string;
  numero: string;
  cliente: string;
  vehiculo: string;
  mecanico: string;
  estado: EstadoOrden;
  fecha: string;
}

const ordenesRecientes: OrdenResumen[] = [
  { id: "1", numero: "ORD-001", cliente: "Carlos Ramírez",   vehiculo: "Toyota Corolla 2020",  mecanico: "Juan Pérez",  estado: "Autorizado",    fecha: "08/06/2025" },
  { id: "2", numero: "ORD-002", cliente: "María López",      vehiculo: "Nissan Sentra 2018",   mecanico: "Luis Torres", estado: "Diagnosticado", fecha: "07/06/2025" },
  { id: "3", numero: "ORD-003", cliente: "Roberto Silva",    vehiculo: "Chevrolet Aveo 2019",  mecanico: "Pedro Gómez", estado: "Ingresado",     fecha: "06/06/2025" },
  { id: "4", numero: "ORD-004", cliente: "Ana Martínez",     vehiculo: "VW Jetta 2021",        mecanico: "Juan Pérez",  estado: "Terminado",     fecha: "05/06/2025" },
  { id: "5", numero: "ORD-005", cliente: "Jorge Hernández",  vehiculo: "Ford Fiesta 2017",     mecanico: "Luis Torres", estado: "Autorizado",    fecha: "05/06/2025" },
];

const estadoConfig: Record<EstadoOrden, { label: string; clase: string; icon: ReactElement }> = {
  "Ingresado":    { label: "Ingresado",    clase: "badge-ingresado",    icon: <FaClock /> },
  "Diagnosticado":{ label: "Diagnosticado",clase: "badge-diagnosticado",icon: <FaExclamationCircle /> },
  "Autorizado":   { label: "Autorizado",   clase: "badge-autorizado",   icon: <FaWrench /> },
  "Terminado":    { label: "Terminado",    clase: "badge-terminado",    icon: <FaCheckCircle /> },
};

const actividad = [
  { texto: "ORD-004 marcada como Terminada",         tiempo: "Hace 30 min", tipo: "success" },
  { texto: "Refacción recibida en ORD-003",          tiempo: "Hace 1 hora", tipo: "info" },
  { texto: "Nuevo vehículo ingresado: Ford Fiesta",  tiempo: "Hace 2 horas",tipo: "neutral" },
  { texto: "Diagnóstico completado en ORD-002",      tiempo: "Hace 3 horas",tipo: "info" },
  { texto: "Cliente autorizó reparación ORD-001",    tiempo: "Ayer",        tipo: "success" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-sub">Bienvenido, Administrador</p>
        </div>
        <button className="btn-nueva-orden" onClick={() => navigate("/ordenes")}>
          + Nueva Orden
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Contenido principal */}
      <div className="dashboard-grid">

        {/* Tabla órdenes */}
        <div className="dash-card ordenes-card">
          <div className="card-header">
            <h2 className="card-title"><FaClipboardList /> Órdenes Recientes</h2>
            <button className="btn-ver-todo" onClick={() => navigate("/ordenes")}>
              Ver todo
            </button>
          </div>
          <div className="table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Cliente</th>
                  <th>Vehículo</th>
                  <th>Mecánico</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ordenesRecientes.map((o) => {
                  const cfg = estadoConfig[o.estado];
                  return (
                    <tr
                      key={o.id}
                      className="fila-clickeable"
                      onClick={() => navigate(`/ordenes/${o.id}`)}
                    >
                      <td className="orden-num">{o.numero}</td>
                      <td>{o.cliente}</td>
                      <td className="text-muted">{o.vehiculo}</td>
                      <td>{o.mecanico}</td>
                      <td>
                        <span className={`badge ${cfg.clase}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
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