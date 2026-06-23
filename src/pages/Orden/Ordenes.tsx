import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaEye, FaTrash } from "react-icons/fa";
import type { EstadoOrden, TipoOrden } from "../../types";
import { useOrdenes } from '../../context/useOrdenes';
import { useToast } from '../../context/useToast';
import ConfirmModal from '../../components/ui/ConfirmModal'; // 👈 Importación correcta
import "../../css/Orden/Ordenes.css";

const ESTADOS: EstadoOrden[] = ["Ingresado", "Diagnosticado", "Autorizado", "Terminado"];
const TIPOS: TipoOrden[] = ["preventivo", "correctivo", "diagnostico de fallas"];

const estadoConfig: Record<EstadoOrden, string> = {
  "Ingresado":     "badge-ingresado",
  "Diagnosticado": "badge-diagnosticado",
  "Autorizado":    "badge-autorizado",
  "Terminado":     "badge-terminado",
};

export default function Ordenes() {
  const { ordenes, updateOrden, deleteOrden } = useOrdenes();
  const { showToast, toasts, removeToast } = useToast();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const rol = localStorage.getItem("rol");

  // ── Estado del modal de confirmación ──
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    onConfirm: () => void;
    title?: string;
    message?: string;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    onConfirm: () => {},
  });

  const columnCount = rol === "admin" ? 9 : 8;

  // ── Filtrado ──────────────────────────────────────────────
  const ordenesFiltradas = ordenes.filter((o) => {
    const coincide = [
      `ORD-${o.numero.toString().padStart(3, '0')}`,
      o.cliente?.nombre || "",
      o.vehiculo?.marca || "",
      o.vehiculo?.modelo || "",
      o.tipo || "",
    ].join(" ").toLowerCase().includes(busqueda.toLowerCase());
    const estado = filtroEstado === "Todos" || o.estado === filtroEstado;
    const tipo = filtroTipo === "Todos" || o.tipo === filtroTipo;
    return coincide && estado && tipo;
  });

  // ── Cambiar estado (con validación) ──
  const handleCambiarEstado = (id: string, nuevoEstado: EstadoOrden) => {
    if (nuevoEstado !== 'Terminado') {
      updateOrden(id, { estado: nuevoEstado });
      showToast(`Estado actualizado a ${nuevoEstado}`, 'success');
      return;
    }

    const ordenCompleta = ordenes.find(o => o.id === id);
    if (!ordenCompleta) {
      showToast('Orden no encontrada', 'error');
      return;
    }

    const tiposRequeridos = ['Recepción', 'Diagnóstico', 'Reparación', 'Entrega'];
    const evidencias = ordenCompleta.evidencias || [];
    let falta = false;
    let etapaFaltante = '';

    for (const tipo of tiposRequeridos) {
      if (!evidencias.some(e => e.tipo === tipo)) {
        etapaFaltante = tipo;
        falta = true;
        break;
      }
    }

    if (falta) {
      showToast(`⚠️ Falta evidencia en: ${etapaFaltante}`, 'error');
      return;
    }

    updateOrden(id, { estado: 'Terminado' });
    showToast('✅ Orden marcada como Terminada', 'success');
  };

  // ── Eliminar orden (abre modal) ──
  const handleEliminarOrden = (id: string, numero: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Eliminar orden',
      message: `¿Estás seguro de eliminar la orden ${numero}? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: () => {
        deleteOrden(id);
        showToast(`Orden ${numero} eliminada`, 'info');
      },
    });
  };

  return (
    <>
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
              placeholder="Buscar por número, cliente, vehículo o tipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filtro-grupo">
            <span className="filtro-label">Estado:</span>
            <div className="filtro-btns">
              {["Todos", ...ESTADOS].map((e) => (
                <button
                  key={e}
                  className={`filtro-btn ${filtroEstado === e ? "filtro-activo" : ""}`}
                  onClick={() => setFiltroEstado(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="filtro-grupo">
            <span className="filtro-label">Tipo:</span>
            <div className="filtro-btns">
              {["Todos", ...TIPOS].map((t) => (
                <button
                  key={t}
                  className={`filtro-btn ${filtroTipo === t ? "filtro-activo" : ""}`}
                  onClick={() => setFiltroTipo(t)}
                >
                  {t === "Diagnóstico de fallas" ? "Diagnóstico" : t}
                </button>
              ))}
            </div>
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
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                  {rol === "admin" && <th>Eliminar</th>}
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.length > 0 ? (
                  ordenesFiltradas.map((o) => {
                    const numero = `ORD-${o.numero.toString().padStart(3, '0')}`;
                    const cliente = o.cliente?.nombre || "Sin cliente";
                    const vehiculo = o.vehiculo ? `${o.vehiculo.marca} ${o.vehiculo.modelo}` : "Sin vehículo";
                    return (
                      <tr key={o.id}>
                        <td className="orden-num">{numero}</td>
                        <td className="texto-blanco">{cliente}</td>
                        <td className="text-muted">{vehiculo}</td>
                        <td className="text-muted">No asignado</td>
                        <td className="text-muted">
                          {o.tipo ? (
                            <span className={`badge-tipo ${o.tipo === "preventivo" ? "tipo-preventivo" : o.tipo === "correctivo" ? "tipo-correctivo" : "tipo-diagnostico"}`}>
                              {o.tipo === "diagnostico de fallas" ? "diagnóstico" : o.tipo}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
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
                        <td className="text-muted">{o.creado_en}</td>
                        <td>
                          <button
                            className="btn-ver"
                            onClick={() => navigate(`/ordenes/${o.id}`)}
                            title="Ver detalle"
                          >
                            <FaEye /> Ver
                          </button>
                        </td>
                        {rol === "admin" && (
                          <td>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleEliminarOrden(o.id, numero)}
                              title="Eliminar orden"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={columnCount} className="tabla-vacia">
                      No se encontraron órdenes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── MODAL DE CONFIRMACIÓN ─── */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type || 'danger'}
      />

      {/* ─── TOASTS ─── */}
      {toasts.map((toast) => (
        <div key={toast.id} className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'error' ? 'bg-red-600' :
            toast.type === 'warning' ? 'bg-yellow-600' :
            'bg-blue-600'
          }`}>
            {toast.message}
            <button onClick={() => removeToast(toast.id)} className="ml-3 text-white/70 hover:text-white">×</button>
          </div>
        </div>
      ))}
    </>
  );
}