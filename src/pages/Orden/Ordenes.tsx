import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaEye } from "react-icons/fa";
import type { EstadoOrden, OrdenResumen } from "../../types";
import {useOrdenes} from '../../context/useOrdenes';
import "../../css/Orden/Ordenes.css";

const ordenesIniciales: OrdenResumen[] = [
  { id: "1", numero: "ORD-001", cliente: "Carlos Ramírez",  vehiculo: "Toyota Corolla 2020", mecanico: "Juan Pérez",  estado: "Autorizado",     fecha: "08/06/2025" },
  { id: "2", numero: "ORD-002", cliente: "María López",     vehiculo: "Nissan Sentra 2018",  mecanico: "Luis Torres", estado: "Diagnosticado",  fecha: "07/06/2025" },
  { id: "3", numero: "ORD-003", cliente: "Roberto Silva",   vehiculo: "Chevrolet Aveo 2019", mecanico: "Pedro Gómez", estado: "Ingresado",      fecha: "06/06/2025" },
  { id: "4", numero: "ORD-004", cliente: "Ana Martínez",    vehiculo: "VW Jetta 2021",       mecanico: "Juan Pérez",  estado: "Terminado",      fecha: "05/06/2025" },
  { id: "5", numero: "ORD-005", cliente: "Jorge Hernández", vehiculo: "Ford Fiesta 2017",    mecanico: "Luis Torres", estado: "Autorizado",     fecha: "05/06/2025" },
];

const estadoConfig: Record<EstadoOrden, string> = {
  "Ingresado":     "badge-ingresado",
  "Diagnosticado": "badge-diagnosticado",
  "Autorizado":    "badge-autorizado",
  "Terminado":     "badge-terminado",
};

const ESTADOS: EstadoOrden[] = ["Ingresado", "Diagnosticado", "Autorizado", "Terminado"];

export default function Ordenes() {
  const { ordenesResumen } = useOrdenes();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<string>("Todos");

  const rol = localStorage.getItem("rol");

  const sourceList = ordenesResumen && ordenesResumen.length ? ordenesResumen : ordenesIniciales;

  const ordenesFiltradas = sourceList.filter((o) => {
    const coincide = [o.numero, o.cliente, o.vehiculo]
      .join(" ").toLowerCase()
      .includes(busqueda.toLowerCase());
    const estado = filtro === "Todos" || o.estado === filtro;
    return coincide && estado;
  });

  return (
    <div className="ordenes">

      <div className="ordenes-header">
        <div>
          <h1 className="ordenes-title">Órdenes de Servicio</h1>
          <p className="ordenes-sub">{ordenesFiltradas.length} orden(es) encontrada(s)</p>
        </div>
        {(rol === "admin" || rol === "mecanico") && (
          <button className="btn-nuevo" onClick={() => navigate("/ordenes/nueva")}>
            <FaPlus /> Nueva Orden
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="ordenes-filtros">
        <div className="ordenes-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por número, cliente o vehículo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="filtro-estados">
          {["Todos", ...ESTADOS].map((e) => (
            <button
              key={e}
              className={`filtro-btn ${filtro === e ? "filtro-activo" : ""}`}
              onClick={() => setFiltro(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="ordenes-card">
        <div className="table-wrapper">
          <table className="ordenes-table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Mecánico</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.length > 0 ? (
                ordenesFiltradas.map((o) => (
                  <tr key={o.id}>
                    <td className="orden-num">{o.numero}</td>
                    <td className="texto-blanco">{o.cliente}</td>
                    <td className="text-muted">{o.vehiculo}</td>
                    <td className="text-muted">{o.mecanico}</td>
                    <td>
                      <span className={`badge ${estadoConfig[o.estado]}`}>
                        {o.estado}
                      </span>
                    </td>
                    <td className="text-muted">{o.fecha}</td>
                    <td>
                      <button
                        className="btn-ver"
                        onClick={() => navigate(`/ordenes/${o.id}`)}
                        title="Ver detalle"
                      >
                        <FaEye /> Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="tabla-vacia">
                    No se encontraron órdenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}