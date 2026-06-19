import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaEye } from "react-icons/fa";
import type { EstadoOrden} from "../../types";
import { useOrdenes } from '../../context/useOrdenes';
import "../../css/Orden/Ordenes.css";

// Los estados posibles
const ESTADOS: EstadoOrden[] = ["Ingresado", "Diagnosticado", "Autorizado", "Terminado"];

const estadoConfig: Record<EstadoOrden, string> = {
  "Ingresado":     "badge-ingresado",
  "Diagnosticado": "badge-diagnosticado",
  "Autorizado":    "badge-autorizado",
  "Terminado":     "badge-terminado",
};

export default function Ordenes() {
  const { ordenesResumen, updateOrden } = useOrdenes();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<string>("Todos");
  const rol = localStorage.getItem("rol");

  // Usamos ordenesResumen si existe, si no, usamos un mock local (pero ahora usamos el contexto)
  const sourceList = ordenesResumen && ordenesResumen.length ? ordenesResumen : [];

  const ordenesFiltradas = sourceList.filter((o) => {
    const coincide = [o.numero, o.cliente, o.vehiculo]
      .join(" ").toLowerCase()
      .includes(busqueda.toLowerCase());
    const estado = filtro === "Todos" || o.estado === filtro;
    return coincide && estado;
  });

  // Función para cambiar estado
  const handleCambiarEstado = (id: string, nuevoEstado: EstadoOrden) => {
    updateOrden(id, { estado: nuevoEstado });
  };

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
                ordenesFiltradas.map((o) => {
                  // Buscamos la orden completa para obtener el ID real (necesario para updateOrden)
                  // const ordenCompleta = ordenes.find(ord => ord.id === o.id);
                  return (
                    <tr key={o.id}>
                      <td className="orden-num">{o.numero}</td>
                      <td className="texto-blanco">{o.cliente}</td>
                      <td className="text-muted">{o.vehiculo}</td>
                      <td className="text-muted">{o.mecanico}</td>
                      <td>
                        {rol === "admin" ? (
                          <select
                            value={o.estado}
                            onChange={(e) => handleCambiarEstado(o.id, e.target.value as EstadoOrden)}
                            className="form-select-sm"
                            style={{ 
                              background: 'var(--fondo-card)',
                              color: 'var(--texto)',
                              border: '1px solid var(--borde)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            {ESTADOS.map((est) => (
                              <option key={est} value={est}>{est}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`badge ${estadoConfig[o.estado]}`}>
                            {o.estado}
                          </span>
                        )}
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
                  );
                })
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