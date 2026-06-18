import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft, FaCar, FaStethoscope, FaFileInvoiceDollar,
  FaWrench, FaClipboardList, FaCheckCircle, FaHandshake,
  FaCamera, FaTools, FaPlus, FaTrash, FaEdit, FaSave, FaTimes
} from "react-icons/fa";
import { useOrdenes } from '../../context/useOrdenes';
import { useToast } from '../../context/useToast'; // Ruta correcta para el hook
import type { EstadoOrden, ObjetoInventario, Usuario, ItemCotizacion, Refaccion, BitacoraItem, Cotizacion, FormaPago, Diagnostico, Rol, Evidencia, Checklist } from "../../types";
import UploadFoto from "../../components/ui/UpdloadFoto"; // Nombre corregido
import FirmaDigital from "../../components/ui/FirmaDigital";
import "../../css/Orden/DetalleOrdenes.css";

// ── Tabs disponibles ──────────────────────────────────────
const TABS = [
  { id: "recepcion",   label: "Recepción",   icon: <FaCar /> },
  { id: "diagnostico", label: "Diagnóstico", icon: <FaStethoscope /> },
  { id: "cotizacion",  label: "Cotización",  icon: <FaFileInvoiceDollar /> },
  { id: "refacciones", label: "Refacciones", icon: <FaTools /> },
  { id: "reparacion",  label: "Reparación",  icon: <FaWrench /> },
  { id: "checklist",   label: "Checklist",   icon: <FaClipboardList /> },
  { id: "entrega",     label: "Entrega",     icon: <FaHandshake /> },
];

// ── Mock de usuarios ──────────────────────────────────────
const usuariosMock: Usuario[] = [
  { id: "u1", nombre: "Pedro Recepción", email: "pedro@norba.com", rol: "recepcion", activo: true, creado_en: "2025-01-01" },
  { id: "u2", nombre: "Ana Recepcionista", email: "ana@norba.com", rol: "recepcion", activo: true, creado_en: "2025-01-01" },
  { id: "u3", nombre: "Carlos Admin", email: "carlos@norba.com", rol: "admin", activo: true, creado_en: "2025-01-01" },
];

// ── Componente editor de objetos (RF-08) ─────────────────
function ObjetosEditor({ objetos, onUpdate, ordenId }: { objetos: ObjetoInventario[]; onUpdate: (objetos: ObjetoInventario[]) => void; ordenId?: string }) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editCant, setEditCant] = useState(1);

  const handleAdd = () => {
    const nuevo: ObjetoInventario = {
      id: Date.now().toString(),
      orden_id: ordenId || "",
      descripcion: "Nuevo objeto",
      cantidad: 1,
    };
    onUpdate([...objetos, nuevo]);
    setEditandoId(nuevo.id);
    setEditDesc(nuevo.descripcion);
    setEditCant(nuevo.cantidad);
  };

  const handleDelete = (id: string) => {
    onUpdate(objetos.filter(o => o.id !== id));
    if (editandoId === id) setEditandoId(null);
  };

  const startEdit = (obj: ObjetoInventario) => {
    setEditandoId(obj.id);
    setEditDesc(obj.descripcion);
    setEditCant(obj.cantidad);
  };

  const saveEdit = () => {
    if (editandoId) {
      onUpdate(objetos.map(o =>
        o.id === editandoId ? { ...o, descripcion: editDesc, cantidad: editCant } : o
      ));
      setEditandoId(null);
    }
  };

  const cancelEdit = () => setEditandoId(null);

  return (
    <div>
      <ul className="objetos-lista">
        {objetos.map(obj => (
          <li key={obj.id} className="objeto-item">
            {editandoId === obj.id ? (
              <>
                <input
                  type="text"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Descripción"
                  autoFocus
                />
                <input
                  type="number"
                  min={1}
                  value={editCant}
                  onChange={e => setEditCant(Number(e.target.value))}
                  style={{ width: "70px", marginLeft: "8px" }}
                />
                <button onClick={saveEdit} className="obj-btn"><FaSave /></button>
                <button onClick={cancelEdit} className="obj-btn"><FaTimes /></button>
              </>
            ) : (
              <>
                <FaCheckCircle className="obj-icon" />
                <span>{obj.descripcion} (x{obj.cantidad})</span>
                <div className="obj-actions">
                  <button onClick={() => startEdit(obj)} className="obj-btn"><FaEdit /></button>
                  <button onClick={() => handleDelete(obj.id)} className="obj-btn"><FaTrash /></button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <button onClick={handleAdd} className="btn-subir-foto" style={{ marginTop: "8px" }}>
        <FaPlus /> Agregar objeto
      </button>
    </div>
  );
}

// ── Componente editor de ítems de cotización (RF-12) ──
function ItemCotizacionEditor({ items, onUpdate }: { items: ItemCotizacion[]; onUpdate: (items: ItemCotizacion[]) => void }) {
  const handleAdd = () => {
    const nuevo: ItemCotizacion = {
      id: Date.now().toString(),
      cotizacion_id: "",
      descripcion: "Nuevo concepto",
      cantidad: 1,
      costo_unitario: 0,
      total: 0,
    };
    onUpdate([...items, { ...nuevo, total: nuevo.cantidad * nuevo.costo_unitario }]);
  };

  const updateItem = (id: string, campo: keyof ItemCotizacion, valor: string | number) => {
    const nuevos = items.map(item => {
      if (item.id === id) {
        const actualizado = { ...item, [campo]: valor };
        if (campo === 'cantidad' || campo === 'costo_unitario') {
          actualizado.total = (campo === 'cantidad' ? Number(valor) : item.cantidad) *
                              (campo === 'costo_unitario' ? Number(valor) : item.costo_unitario);
        }
        return actualizado;
      }
      return item;
    });
    onUpdate(nuevos);
  };

  const deleteItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  return (
    <div>
      <table className="cotizacion-table">
        <thead>
          <tr><th>Concepto</th><th>Cant.</th><th>Costo Unit.</th><th>Total</th><th></th></tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td><input type="text" value={item.descripcion} onChange={e => updateItem(item.id, 'descripcion', e.target.value)} style={{ width: "100%", background: "var(--fondo)", color: "var(--texto)", border: "1px solid var(--borde)", padding: "6px" }} /></td>
              <td><input type="number" min={1} value={item.cantidad} onChange={e => updateItem(item.id, 'cantidad', Number(e.target.value))} style={{ width: "70px" }} /></td>
              <td><input type="number" min={0} value={item.costo_unitario} onChange={e => updateItem(item.id, 'costo_unitario', Number(e.target.value))} style={{ width: "100px" }} /></td>
              <td className="mono text-right">${item.total.toLocaleString("es-MX")}</td>
              <td><button onClick={() => deleteItem(item.id)} className="btn-icon btn-eliminar"><FaTrash /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAdd} className="btn-accion" style={{ marginTop: "8px" }}><FaPlus /> Agregar ítem</button>
    </div>
  );
}

const estadoConfig: Record<EstadoOrden, { clase: string; label: string }> = {
  "Ingresado":     { clase: "badge-ingresado",     label: "Ingresado" },
  "Diagnosticado": { clase: "badge-diagnosticado", label: "Diagnosticado" },
  "Autorizado":    { clase: "badge-autorizado",    label: "Autorizado" },
  "Terminado":     { clase: "badge-terminado",     label: "Terminado" },
};

const refEstadoConfig: Record<string, string> = {
  "Solicitada": "ref-solicitada",
  "En camino":  "ref-encamino",
  "Recibida":   "ref-recibida",
  "Instalada":  "ref-instalada",
};

export default function DetalleOrden() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { ordenes, updateOrden } = useOrdenes();
  const { showToast, toasts, removeToast } = useToast();
  const [tabActivo, setTabActivo] = useState("recepcion");
  const rol = localStorage.getItem("rol");

  // ✅ Ahora orden tiene las propiedades directamente desde el tipo
  const orden = ordenes.find(o => o.id === id);
  const [costoDiagnostico, setCostoDiagnostico] = useState<number>(orden?.diagnostico?.costo_diagnostico || 0);
  const [responsableRecepcion, setResponsableRecepcion] = useState(orden?.responsable_recepcion || "");
  const initialLoadRef = useRef(true);

  // ── Estados para firma digital ──
  const [mostrarFirma, setMostrarFirma] = useState(false);
  const [firmaBase64, setFirmaBase64] = useState<string | undefined>(orden?.firma_Cliente); // ✅ Mayúscula

  // ── Estados para fotos por etapa ──
  const [fotosRecepcion, setFotosRecepcion] = useState<string[]>(
    orden?.evidencias?.filter(e => e.tipo === 'Recepción').map(e => e.url_foto) || []
  );
  const [fotosDiagnostico, setFotosDiagnostico] = useState<string[]>(
    orden?.evidencias?.filter(e => e.tipo === 'Diagnóstico').map(e => e.url_foto) || []
  );
  const [fotosReparacion, setFotosReparacion] = useState<string[]>(
    orden?.evidencias?.filter(e => e.tipo === 'Reparación').map(e => e.url_foto) || []
  );
  const [fotosEntrega, setFotosEntrega] = useState<string[]>(
    orden?.evidencias?.filter(e => e.tipo === 'Entrega').map(e => e.url_foto) || []
  );

  useEffect(() => {
    if (initialLoadRef.current && orden) {
      setCostoDiagnostico(orden.diagnostico?.costo_diagnostico || 0);
      setResponsableRecepcion(orden.responsable_recepcion || "");
      setFirmaBase64(orden.firma_Cliente); // ✅ Mayúscula
      setFotosRecepcion(orden.evidencias?.filter(e => e.tipo === 'Recepción').map(e => e.url_foto) || []);
      setFotosDiagnostico(orden.evidencias?.filter(e => e.tipo === 'Diagnóstico').map(e => e.url_foto) || []);
      setFotosReparacion(orden.evidencias?.filter(e => e.tipo === 'Reparación').map(e => e.url_foto) || []);
      setFotosEntrega(orden.evidencias?.filter(e => e.tipo === 'Entrega').map(e => e.url_foto) || []);
      initialLoadRef.current = false;
    }
  }, [orden]);

  // Estados locales para la cotización (RF-12 a 15)
  const [itemsCotizacion, setItemsCotizacion] = useState<ItemCotizacion[]>(orden?.cotizacion?.items || []);
  const [conceptoManoObra, setConceptoManoObra] = useState(orden?.cotizacion?.concepto_mano_obra || "Mano de obra");
  const [costoManoObra, setCostoManoObra] = useState(orden?.cotizacion?.costo_mano_obra || 0);
  const [autorizado, setAutorizado] = useState(orden?.autorizado || false);
  const [autorizadoPor, setAutorizadoPor] = useState(orden?.autorizado_por || "");
  const [evidenciaFile, setEvidenciaFile] = useState<File | null>(null);
  const [anticipoMonto, setAnticipoMonto] = useState(orden?.anticipo || 0);
  const [formaPagoAnticipo, setFormaPagoAnticipo] = useState<FormaPago>("Efectivo");
  const [pagoFinalMonto, setPagoFinalMonto] = useState(0);
  const [formaPagoFinal, setFormaPagoFinal] = useState<FormaPago>("Efectivo");

  // ── Estados para Bitácora (RF-23) ──────────────────────────
  const [nuevoAvance, setNuevoAvance] = useState('');
  const [mostrarFormAvance, setMostrarFormAvance] = useState(false);
  const [avanceEditando, setAvanceEditando] = useState<BitacoraItem | null>(null);
  const [textoEditado, setTextoEditado] = useState('');

  // ── Estados para Mecánicos (RF-21) ─────────────────────────
  const [mecanicosDisponibles] = useState<Usuario[]>([
    { id: "m1", nombre: "Juan Pérez", email: "juan@norba.com", rol: "mecanico", activo: true, creado_en: "2025-01-01" },
    { id: "m2", nombre: "Luis Torres", email: "luis@norba.com", rol: "mecanico", activo: true, creado_en: "2025-01-01" },
    { id: "m3", nombre: "Pedro Gómez", email: "pedro@norba.com", rol: "mecanico", activo: true, creado_en: "2025-01-01" },
  ]);
  const [mecanicoSeleccionado, setMecanicoSeleccionado] = useState('');

  const subtotalItems = itemsCotizacion.reduce((acc, i) => acc + i.total, 0);
  const subtotal = subtotalItems + costoManoObra;
  const total = subtotal;

  // ⚠️ Verificar que orden existe ANTES de definir funciones que la usan
  if (!orden) {
    return <div className="detalle">Cargando orden o no encontrada...</div>;
  }

  const cfg = estadoConfig[orden.estado];

  // ── Manejadores de diagnóstico ──
  const handleDiagnosticoChange = (campo: keyof Diagnostico, valor: string | number | boolean) => {
    const diagnosticoActual = orden.diagnostico || {
      id: Date.now().toString(),
      orden_id: orden.id,
      que_hace: "",
      como_lo_hace: "",
      cuando_lo_hace: "",
      desde_cuando: "",
      cambios_previos: false,
      creado_en: new Date().toLocaleDateString('es-MX'),
    };
    const nuevoDiagnostico = { ...diagnosticoActual, [campo]: valor };
    updateOrden(orden.id, { diagnostico: nuevoDiagnostico });
  };

  // ── Manejadores de cotización y pagos ──
  const guardarCotizacion = () => {
    const nuevaCotizacion: Cotizacion = {
      id: orden.cotizacion?.id || Date.now().toString(),
      orden_id: orden.id,
      numero_ticket: String(orden.numero),
      concepto_mano_obra: conceptoManoObra,
      costo_mano_obra: costoManoObra,
      subtotal: subtotal,
      total: total,
      creado_en: orden.cotizacion?.creado_en || new Date().toLocaleDateString('es-MX'),
      items: itemsCotizacion,
    };
    updateOrden(orden.id, { cotizacion: nuevaCotizacion });
    showToast("Cotización guardada", "success");
  };

  const guardarAutorizacion = () => {
    updateOrden(orden.id, { autorizado, autorizado_por: autorizadoPor });
    showToast(`Autorización ${autorizado ? "registrada" : "cancelada"}`, autorizado ? "success" : "warning");
  };

  const registrarAnticipo = () => {
    if (anticipoMonto <= 0) {
      showToast("Ingrese un monto válido", "error");
      return;
    }
    updateOrden(orden.id, { anticipo: anticipoMonto });
    showToast(`Anticipo de $${anticipoMonto.toLocaleString("es-MX")} registrado (${formaPagoAnticipo})`, "success");
  };

  const registrarPagoFinal = () => {
    const saldo = total - anticipoMonto;
    if (pagoFinalMonto !== saldo) {
      showToast(`El pago final debe ser igual al saldo restante: $${saldo.toLocaleString("es-MX")}`, "error");
      return;
    }
    updateOrden(orden.id, { pago_final: pagoFinalMonto });
    showToast(`Pago final de $${pagoFinalMonto.toLocaleString("es-MX")} registrado (${formaPagoFinal})`, "success");
  };

  // ── Manejadores de recepción ──
  const handleUpdateObjetos = (nuevosObjetos: ObjetoInventario[]) => {
    updateOrden(orden.id, { objetos: nuevosObjetos });
  };

  const handleUpdateResponsable = (value: string) => {
    setResponsableRecepcion(value);
    updateOrden(orden.id, { responsable_recepcion: value });
  };

  const handleUpdateCostoDiagnostico = (value: number) => {
    setCostoDiagnostico(value);
    handleDiagnosticoChange('costo_diagnostico', value);
  };

  // ── Manejadores de Bitácora (RF-23) ──────────────────────────
  const handleAgregarAvance = () => {
    if (!nuevoAvance.trim()) {
      showToast("Escribe una descripción del avance", "error");
      return;
    }

    const rolMock: Rol = (rol === 'admin' || rol === 'mecanico' || rol === 'recepcion')
      ? (rol as Rol)
      : 'mecanico';

    const usuarioMock: Usuario = {
      id: rolMock === 'mecanico' ? 'm1' : 'admin',
      nombre: rolMock === 'mecanico' ? 'Mecánico' : 'Administrador',
      email: '',
      rol: rolMock,
      activo: true,
      creado_en: '',
    };

    const nuevoItem: BitacoraItem = {
      id: Date.now().toString(),
      orden_id: orden.id,
      mecanico_id: usuarioMock.id,
      descripcion: nuevoAvance,
      creado_en: new Date().toLocaleString('es-MX'),
      mecanico: usuarioMock,
    };

    const bitacoraActualizada = [...(orden.bitacora || []), nuevoItem];
    updateOrden(orden.id, { bitacora: bitacoraActualizada });
    setNuevoAvance('');
    setMostrarFormAvance(false);
    showToast("Avance registrado", "success");
  };

  const handleEliminarAvance = (id: string) => {
    if (!confirm('¿Eliminar este avance?')) return;
    const bitacoraActualizada = orden.bitacora?.filter(b => b.id !== id) || [];
    updateOrden(orden.id, { bitacora: bitacoraActualizada });
    showToast("Avance eliminado", "info");
  };

  const handleEditarAvance = (item: BitacoraItem) => {
    setAvanceEditando(item);
    setTextoEditado(item.descripcion);
  };

  const handleGuardarEdicionAvance = () => {
    if (!avanceEditando || !textoEditado.trim()) return;
    const bitacoraActualizada = orden.bitacora?.map(b =>
      b.id === avanceEditando.id ? { ...b, descripcion: textoEditado.trim() } : b
    ) || [];
    updateOrden(orden.id, { bitacora: bitacoraActualizada });
    setAvanceEditando(null);
    setTextoEditado('');
    showToast("Avance editado", "success");
  };

  // ── Manejadores de Mecánicos (RF-21) ──────────────────────
  const handleAgregarMecanico = () => {
    if (!mecanicoSeleccionado) {
      showToast("Selecciona un mecánico", "error");
      return;
    }
    const mecanico = mecanicosDisponibles.find(m => m.id === mecanicoSeleccionado);
    if (!mecanico) return;

    const mecanicosActuales = orden.mecanicos || [];
    if (mecanicosActuales.some(m => m.id === mecanico.id)) {
      showToast("Este mecánico ya está asignado", "warning");
      return;
    }

    updateOrden(orden.id, { mecanicos: [...mecanicosActuales, mecanico] });
    setMecanicoSeleccionado('');
    showToast(`Mecánico ${mecanico.nombre} asignado`, "success");
  };

  const handleRemoverMecanico = (id: string) => {
    const mecanicosActuales = orden.mecanicos || [];
    const mecanicoRemovido = mecanicosActuales.find(m => m.id === id);
    updateOrden(orden.id, { mecanicos: mecanicosActuales.filter(m => m.id !== id) });
    if (mecanicoRemovido) {
      showToast(`Mecánico ${mecanicoRemovido.nombre} removido`, "info");
    }
  };

  // ── Manejador de fotos en refacciones (RF-19) ─────────────
  const handleSubirFotoRefaccion = (refaccionId: string, tipo: 'recibida' | 'instalada', _file: File, preview: string) => {
    const campo = tipo === 'recibida' ? 'foto_recibida' : 'foto_instalada';
    const refaccionesActualizadas = orden.refacciones?.map(r => {
      if (r.id === refaccionId) {
        return { ...r, [campo]: preview };
      }
      return r;
    }) || [];
    updateOrden(orden.id, { refacciones: refaccionesActualizadas });
    showToast(`Foto ${tipo === 'recibida' ? 'recibida' : 'instalada'} subida`, "success");
  };

  // ── Manejador de fotos por etapa (RF-24) ──────────────────
  const handleSubirFotoEtapa = (tipo: 'Recepción' | 'Diagnóstico' | 'Reparación' | 'Entrega', _file: File, preview: string) => {
    const nuevaEvidencia: Evidencia = {
      id: Date.now().toString(),
      orden_id: orden.id,
      tipo,
      url_foto: preview,
      responsable: rol || 'Usuario',
      creado_en: new Date().toLocaleString('es-MX'),
    };
    const evidenciasActuales = orden.evidencias || [];
    updateOrden(orden.id, { evidencias: [...evidenciasActuales, nuevaEvidencia] });

    // Actualizar estados locales
    if (tipo === 'Recepción') setFotosRecepcion(prev => [...prev, preview]);
    if (tipo === 'Diagnóstico') setFotosDiagnostico(prev => [...prev, preview]);
    if (tipo === 'Reparación') setFotosReparacion(prev => [...prev, preview]);
    if (tipo === 'Entrega') setFotosEntrega(prev => [...prev, preview]);

    showToast(`Foto de ${tipo} agregada`, "success");
  };

  // ── Validación de evidencias (RF-25) ──────────────────────
  const validarEvidencias = (): boolean => {
    const tiposRequeridos = ['Recepción', 'Diagnóstico', 'Reparación', 'Entrega'];
    const evidencias = orden.evidencias || [];
    for (const tipo of tiposRequeridos) {
      const tiene = evidencias.some(e => e.tipo === tipo);
      if (!tiene) {
        showToast(`Falta evidencia fotográfica en la etapa: ${tipo}`, "error");
        return false;
      }
    }
    return true;
  };

  // ── Manejador de checklist interactivo ────────────────────
  const handleChecklistChange = (seccion: 'prueba_final' | 'entrega', campo: keyof Checklist, valor: boolean) => {
    const currentChecklist = orden.checklist || { prueba_final: {} as Checklist, entrega: {} as Checklist };
    const updatedSeccion = { ...currentChecklist[seccion], [campo]: valor };
    const updatedChecklist = { ...currentChecklist, [seccion]: updatedSeccion };
    updateOrden(orden.id, { checklist: updatedChecklist });
    showToast(`${campo} ${valor ? 'marcado' : 'desmarcado'}`, "info");
  };

  // ── Renderizado ──────────────────────────────────────────
  return (
    <div className="detalle">
      {/* Header */}
      <div className="detalle-header">
        <div className="detalle-header-left">
          <button className="btn-back" onClick={() => navigate("/ordenes")}>
            <FaArrowLeft /> Volver
          </button>
          <div>
            <div className="detalle-titulo-row">
              <h1 className="detalle-titulo">{orden.numero}</h1>
              <span className={`badge ${cfg.clase}`}>{cfg.label}</span>
            </div>
            <p className="detalle-sub">
              {orden.cliente?.nombre || "Cliente"} · {orden.vehiculo?.marca} {orden.vehiculo?.modelo} {orden.vehiculo?.anio} · {orden.fecha || orden.creado_en}
            </p>
          </div>
        </div>
        {rol === "admin" && (
          <div className="detalle-header-actions">
            <select
              className="select-estado"
              value={orden.estado}
              onChange={(e) => {
                const nuevoEstado = e.target.value as EstadoOrden;
                if (nuevoEstado === 'Terminado' && !validarEvidencias()) {
                  return;
                }
                updateOrden(orden.id, { estado: nuevoEstado });
                if (nuevoEstado === 'Terminado') {
                  showToast('Orden marcada como Terminada', 'success');
                }
              }}
            >
              <option value="Ingresado">Ingresado</option>
              <option value="Diagnosticado">Diagnosticado</option>
              <option value="Autorizado">Autorizado</option>
              <option value="Terminado">Terminado</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-wrapper">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tabActivo === t.id ? "tab-activo" : ""}`}
            onClick={() => setTabActivo(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Contenido tabs */}
      <div className="tab-contenido">
        {/* TAB 1: RECEPCIÓN (con fotos) */}
        {tabActivo === "recepcion" && (
          <div className="tab-panel">
            <div className="panel-grid-2">
              <div className="panel-card">
                <h3 className="panel-card-title">Datos del Cliente</h3>
                <div className="info-list">
                  <div className="info-item"><span>Nombre</span><p>{orden.cliente?.nombre || "—"}</p></div>
                  <div className="info-item"><span>Teléfono</span><p>{orden.cliente?.telefono || "—"}</p></div>
                  <div className="info-item"><span>Correo</span><p>{orden.cliente?.correo || "—"}</p></div>
                  <div className="info-item"><span>Tipo</span><p>{orden.cliente?.tipo || "—"}</p></div>
                </div>
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">Datos del Vehículo</h3>
                <div className="info-list">
                  <div className="info-item"><span>Marca / Modelo</span><p>{orden.vehiculo?.marca} {orden.vehiculo?.modelo}</p></div>
                  <div className="info-item"><span>Año / Color</span><p>{orden.vehiculo?.anio} / {orden.vehiculo?.color}</p></div>
                  <div className="info-item"><span>Placas</span><p className="mono">{orden.vehiculo?.placas}</p></div>
                  <div className="info-item"><span>Kilometraje</span><p>{orden.vehiculo?.kilometraje?.toLocaleString()} km</p></div>
                  <div className="info-item"><span>VIN</span><p className="mono">{orden.vehiculo?.vin || "—"}</p></div>
                  <div className="info-item"><span>Motor / Cilindros</span><p>{orden.vehiculo?.motor} / {orden.vehiculo?.cilindraje}</p></div>
                </div>
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">Motivo de Ingreso</h3>
                <p className="panel-texto">{orden.motivo_ingreso || "—"}</p>
                <div className="info-item mt-1">
                  <span>Recibió</span>
                  <select
                    value={responsableRecepcion}
                    onChange={(e) => handleUpdateResponsable(e.target.value)}
                    style={{ background: "var(--fondo)", color: "var(--texto)", border: "1px solid var(--borde)", borderRadius: "6px", padding: "4px 8px" }}
                  >
                    <option value="">Seleccionar responsable</option>
                    {usuariosMock.map(u => (
                      <option key={u.id} value={u.nombre}>{u.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">Inventario de Objetos</h3>
                <ObjetosEditor objetos={orden.objetos || []} onUpdate={handleUpdateObjetos} ordenId={orden.id} />
              </div>
            </div>
            <div className="panel-card mt-1">
              <h3 className="panel-card-title"><FaCamera /> Fotografías de Recepción</h3>
              <div className="flex flex-wrap gap-2">
                {fotosRecepcion.map((url, idx) => (
                  <img key={idx} src={url} alt={`Recepción ${idx+1}`} className="w-16 h-16 object-cover rounded-lg border" />
                ))}
              </div>
              <UploadFoto
                onUpload={(file, preview) => handleSubirFotoEtapa('Recepción', file, preview)}
                label="Agregar foto"
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* TAB 2: DIAGNÓSTICO (con fotos) */}
        {tabActivo === "diagnostico" && (
          <div className="tab-panel">
            <div className="panel-grid-2">
              <div className="panel-card">
                <h3 className="panel-card-title">¿Qué hace?</h3>
                <textarea
                  value={orden.diagnostico?.que_hace || ""}
                  onChange={(e) => handleDiagnosticoChange('que_hace', e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--borde)", background: "var(--fondo)", color: "var(--texto)" }}
                />
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">¿Cómo lo hace?</h3>
                <textarea
                  value={orden.diagnostico?.como_lo_hace || ""}
                  onChange={(e) => handleDiagnosticoChange('como_lo_hace', e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--borde)", background: "var(--fondo)", color: "var(--texto)" }}
                />
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">¿Cuándo lo hace?</h3>
                <textarea
                  value={orden.diagnostico?.cuando_lo_hace || ""}
                  onChange={(e) => handleDiagnosticoChange('cuando_lo_hace', e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--borde)", background: "var(--fondo)", color: "var(--texto)" }}
                />
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">¿Desde cuándo?</h3>
                <textarea
                  value={orden.diagnostico?.desde_cuando || ""}
                  onChange={(e) => handleDiagnosticoChange('desde_cuando', e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--borde)", background: "var(--fondo)", color: "var(--texto)" }}
                />
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">¿Cambios previos?</h3>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="radio"
                      checked={!orden.diagnostico?.cambios_previos}
                      onChange={() => handleDiagnosticoChange('cambios_previos', false)}
                    /> No
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="radio"
                      checked={!!orden.diagnostico?.cambios_previos}
                      onChange={() => handleDiagnosticoChange('cambios_previos', true)}
                    /> Sí
                  </label>
                </div>
                {orden.diagnostico?.cambios_previos && (
                  <textarea
                    value={orden.diagnostico?.desc_cambios || ""}
                    onChange={(e) => handleDiagnosticoChange('desc_cambios', e.target.value)}
                    placeholder="Describe los cambios previos..."
                    rows={2}
                    style={{ width: "100%", padding: "8px", marginTop: "8px", borderRadius: "6px", border: "1px solid var(--borde)", background: "var(--fondo)", color: "var(--texto)" }}
                  />
                )}
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">Costo de Diagnóstico</h3>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={costoDiagnostico}
                  onChange={(e) => handleUpdateCostoDiagnostico(Number(e.target.value))}
                  style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--borde)", background: "var(--fondo)", color: "var(--texto)", width: "100%" }}
                />
              </div>
            </div>
            <div className="panel-card mt-1">
              <h3 className="panel-card-title"><FaCamera /> Fotografías de Diagnóstico</h3>
              <div className="flex flex-wrap gap-2">
                {fotosDiagnostico.map((url, idx) => (
                  <img key={idx} src={url} alt={`Diagnóstico ${idx+1}`} className="w-16 h-16 object-cover rounded-lg border" />
                ))}
              </div>
              <UploadFoto
                onUpload={(file, preview) => handleSubirFotoEtapa('Diagnóstico', file, preview)}
                label="Agregar foto"
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* TAB 3: COTIZACIÓN */}
        {tabActivo === "cotizacion" && (
          <div className="tab-panel">
            <div className="panel-card">
              <div className="cotizacion-header">
                <div>
                  <h3 className="panel-card-title">Cotización #{orden.numero}</h3>
                  <p className="text-muted-sm">Edita los conceptos y la mano de obra</p>
                </div>
                {rol === "admin" && (
                  <button className="btn-accion" onClick={guardarCotizacion}>Guardar cotización</button>
                )}
              </div>

              <ItemCotizacionEditor items={itemsCotizacion} onUpdate={setItemsCotizacion} />

              <div style={{ marginTop: "1rem" }}>
                <div className="form-group">
                  <label>Concepto de mano de obra</label>
                  <input type="text" value={conceptoManoObra} onChange={e => setConceptoManoObra(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                </div>
                <div className="form-group">
                  <label>Costo de mano de obra</label>
                  <input type="number" min={0} value={costoManoObra} onChange={e => setCostoManoObra(Number(e.target.value))} style={{ padding: "8px" }} />
                </div>
              </div>

              <div className="cotizacion-totales">
                <div className="total-row"><span>Subtotal</span><strong>${subtotal.toLocaleString("es-MX")}</strong></div>
                <div className="total-row total-final"><span>TOTAL</span><strong>${total.toLocaleString("es-MX")}</strong></div>
              </div>
            </div>

            <div className="panel-grid-2 mt-1">
              <div className="panel-card">
                <h3 className="panel-card-title">Autorización del Cliente (RF-15)</h3>
                <div className="form-group">
                  <label><input type="checkbox" checked={autorizado} onChange={e => setAutorizado(e.target.checked)} /> Cliente autorizó</label>
                </div>
                <div className="form-group">
                  <label>Medio de autorización</label>
                  <select value={autorizadoPor} onChange={e => setAutorizadoPor(e.target.value)}>
                    <option value="">Seleccionar</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Teléfono">Teléfono</option>
                    <option value="Correo">Correo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Evidencia (captura o audio)</label>
                  <input type="file" onChange={e => setEvidenciaFile(e.target.files?.[0] || null)} />
                  {evidenciaFile && <p className="text-muted-sm">Archivo: {evidenciaFile.name}</p>}
                </div>
                <button className="btn-accion" onClick={guardarAutorizacion}>Guardar autorización</button>
              </div>

              <div className="panel-card">
                <h3 className="panel-card-title">Anticipo (RF-16)</h3>
                <div className="form-group">
                  <label>Total de cotización</label>
                  <p className="mono">${total.toLocaleString("es-MX")}</p>
                </div>
                <div className="form-group">
                  <label>50% sugerido</label>
                  <p className="mono">${(total * 0.5).toLocaleString("es-MX")}</p>
                </div>
                <div className="form-group">
                  <label>Monto a registrar</label>
                  <input type="number" min={0} step={100} value={anticipoMonto} onChange={e => setAnticipoMonto(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Forma de pago</label>
                  <select value={formaPagoAnticipo} onChange={e => setFormaPagoAnticipo(e.target.value as FormaPago)}>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
                <button className="btn-accion" onClick={registrarAnticipo}>Registrar anticipo</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REFACCIONES (con fotos - RF-19) */}
        {tabActivo === "refacciones" && (
          <div className="tab-panel">
            <div className="panel-card">
              <div className="cotizacion-header">
                <h3 className="panel-card-title">Refacciones</h3>
                {rol && <button className="btn-accion">+ Agregar refacción</button>}
              </div>
              <div className="table-wrapper">
                <table className="cotizacion-table">
                  <thead>
                    <tr>
                      <th>Refacción</th>
                      <th>Proveedor</th>
                      <th>Cant.</th>
                      <th>Costo</th>
                      <th>Estado</th>
                      <th>F. Solicitud</th>
                      <th>F. Estimada</th>
                      <th>F. Recepción</th>
                      <th>Foto Recibida</th>
                      <th>Foto Instalada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.refacciones?.map((r: Refaccion) => (
                      <tr key={r.id}>
                        <td>{r.nombre}</td>
                        <td className="text-muted-sm">{r.proveedor}</td>
                        <td className="text-center">{r.cantidad}</td>
                        <td className="text-right">${r.costo?.toLocaleString("es-MX")}</td>
                        <td><span className={`badge-ref ${refEstadoConfig[r.estado]}`}>{r.estado}</span></td>
                        <td className="text-muted-sm">{r.fecha_solicitud}</td>
                        <td className="text-muted-sm">{r.fecha_estimada || "—"}</td>
                        <td className="text-muted-sm">{r.fecha_recepcion || "—"}</td>
                        <td>
                          {r.foto_recibida ? (
                            <img src={r.foto_recibida} alt="Recibida" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <UploadFoto
                              onUpload={(file, preview) => handleSubirFotoRefaccion(r.id, 'recibida', file, preview)}
                              label="Subir"
                              className="inline-block"
                            />
                          )}
                        </td>
                        <td>
                          {r.foto_instalada ? (
                            <img src={r.foto_instalada} alt="Instalada" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <UploadFoto
                              onUpload={(file, preview) => handleSubirFotoRefaccion(r.id, 'instalada', file, preview)}
                              label="Subir"
                              className="inline-block"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REPARACIÓN (con Bitácora y Mecánicos - RF-23 y RF-21) */}
        {tabActivo === "reparacion" && (
          <div className="tab-panel">
            {/* Panel de Bitácora */}
            <div className="panel-card">
              <div className="cotizacion-header">
                <h3 className="panel-card-title">Bitácora de Avances</h3>
                <button
                  className="btn-accion"
                  onClick={() => setMostrarFormAvance(!mostrarFormAvance)}
                >
                  {mostrarFormAvance ? 'Cancelar' : '+ Registrar avance'}
                </button>
              </div>

              {mostrarFormAvance && (
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--fondo-card)', borderRadius: '8px' }}>
                  <div className="form-group">
                    <label>Descripción del avance</label>
                    <textarea
                      value={nuevoAvance}
                      onChange={(e) => setNuevoAvance(e.target.value)}
                      rows={3}
                      placeholder="Ej: Se desmontaron las ruedas delanteras..."
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--borde)', background: 'var(--fondo)', color: 'var(--texto)' }}
                    />
                  </div>
                  <button className="btn-guardar" onClick={handleAgregarAvance} style={{ marginTop: '8px' }}>
                    Guardar avance
                  </button>
                </div>
              )}

              <div className="bitacora-lista">
                {orden.bitacora && orden.bitacora.length > 0 ? (
                  orden.bitacora.map((b: BitacoraItem) => (
                    <div key={b.id} className="bitacora-item">
                      <div className="bitacora-dot" />
                      <div className="bitacora-info">
                        <p className="bitacora-desc">{b.descripcion}</p>
                        <span className="bitacora-meta">
                          {typeof b.mecanico === 'string' ? b.mecanico : b.mecanico?.nombre || 'Mecánico'} · {b.creado_en}
                        </span>
                      </div>
                      <div className="bitacora-acciones" style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                        <button
                          className="btn-icon btn-editar"
                          onClick={() => handleEditarAvance(b)}
                          title="Editar avance"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-eliminar"
                          onClick={() => handleEliminarAvance(b.id)}
                          title="Eliminar avance"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-sm">No hay avances registrados aún.</p>
                )}
              </div>
            </div>

            {/* Panel de Mecánicos Asignados (RF-21) */}
            <div className="panel-card">
              <h3 className="panel-card-title">Mecánicos Asignados</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {orden.mecanicos && orden.mecanicos.length > 0 ? (
                  orden.mecanicos.map(m => (
                    <span key={m.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--primario)', padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '0.8rem' }}>
                      {m.nombre}
                      <button onClick={() => handleRemoverMecanico(m.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
                    </span>
                  ))
                ) : (
                  <span className="text-muted-sm">Ningún mecánico asignado</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={mecanicoSeleccionado}
                  onChange={(e) => setMecanicoSeleccionado(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--borde)', background: 'var(--fondo)', color: 'var(--texto)' }}
                >
                  <option value="">Seleccionar mecánico...</option>
                  {mecanicosDisponibles
                    .filter(m => !orden.mecanicos?.some(a => a.id === m.id))
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                </select>
                <button className="btn-accion" onClick={handleAgregarMecanico}>Asignar</button>
              </div>
            </div>

            <div className="panel-card mt-1">
              <h3 className="panel-card-title"><FaCamera /> Fotografías de Reparación</h3>
              <div className="flex flex-wrap gap-2">
                {fotosReparacion.map((url, idx) => (
                  <img key={idx} src={url} alt={`Reparación ${idx+1}`} className="w-16 h-16 object-cover rounded-lg border" />
                ))}
              </div>
              <UploadFoto
                onUpload={(file, preview) => handleSubirFotoEtapa('Reparación', file, preview)}
                label="Agregar foto"
                className="mt-2"
              />
            </div>
          </div>
        )}

        {/* Modal para editar avance */}
        {avanceEditando && (
          <div className="modal-overlay" onClick={() => setAvanceEditando(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--fondo-card)', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
              <h3 style={{ marginBottom: '1rem' }}>Editar avance</h3>
              <textarea
                value={textoEditado}
                onChange={(e) => setTextoEditado(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--borde)', background: 'var(--fondo)', color: 'var(--texto)' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button className="btn-cancelar" onClick={() => setAvanceEditando(null)}>Cancelar</button>
                <button className="btn-guardar" onClick={handleGuardarEdicionAvance}>Guardar cambios</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CHECKLIST (interactivo) */}
        {tabActivo === "checklist" && (
          <div className="tab-panel">
            <div className="panel-grid-2">
              <div className="panel-card">
                <h3 className="panel-card-title">Prueba Final</h3>
                <div className="checklist-lista">
                  {[
  { label: "Sin daños nuevos", key: "sin_danos" },
  { label: "Piezas instaladas OK", key: "piezas_ok" },
  { label: "Prueba de funcionamiento OK", key: "prueba_ok" },
].map((item) => (
  <div key={item.key} className="check-item">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={!!orden.checklist?.prueba_final?.[item.key as keyof Checklist]}
        onChange={(e) => handleChecklistChange('prueba_final', item.key as keyof Checklist, e.target.checked)}
      />
      <span>{item.label}</span>
    </label>
  </div>
))}
                </div>
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">Checklist de Entrega</h3>
                <div className="checklist-lista">
                  {[
  { label: "Vehículo limpio", key: "limpieza" },
  { label: "Sin daños en la entrega", key: "sin_danos" },
  { label: "Llaves entregadas", key: "llaves_ok" },
].map((item) => (
  <div key={item.key} className="check-item">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={!!orden.checklist?.entrega?.[item.key as keyof Checklist]}
        onChange={(e) => handleChecklistChange('entrega', item.key as keyof Checklist, e.target.checked)}
      />
      <span>{item.label}</span>
    </label>
  </div>
))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ENTREGA (con firma y fotos) */}
        {tabActivo === "entrega" && (
          <div className="tab-panel">
            <div className="panel-grid-2">
              <div className="panel-card">
                <h3 className="panel-card-title">Pago Final (RF-17)</h3>
                <div className="info-list">
                  <div className="info-item"><span>Total cotización</span><p className="mono">${total.toLocaleString("es-MX")}</p></div>
                  <div className="info-item"><span>Anticipo pagado</span><p className="mono">- ${anticipoMonto.toLocaleString("es-MX")}</p></div>
                  <div className="info-item"><span>Saldo restante</span><p className="panel-monto">${(total - anticipoMonto).toLocaleString("es-MX")}</p></div>
                </div>
                {rol === "admin" && (
                  <>
                    <div className="form-group">
                      <label>Monto a cobrar</label>
                      <input type="number" min={0} step={100} value={pagoFinalMonto} onChange={e => setPagoFinalMonto(Number(e.target.value))} placeholder={String(total - anticipoMonto)} />
                    </div>
                    <div className="form-group">
                      <label>Forma de pago</label>
                      <select value={formaPagoFinal} onChange={e => setFormaPagoFinal(e.target.value as FormaPago)}>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Tarjeta">Tarjeta</option>
                      </select>
                    </div>
                    <button className="btn-accion mt-1" onClick={registrarPagoFinal}>Registrar pago final</button>
                  </>
                )}
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">Firma del Cliente (RF-26)</h3>
                {firmaBase64 ? (
                  <div>
                    <img src={firmaBase64} alt="Firma del cliente" className="max-w-full h-auto border rounded" />
                    <button className="btn-accion mt-2" onClick={() => { setFirmaBase64(undefined); updateOrden(orden.id, { firma_Cliente: undefined }); showToast("Firma eliminada", "info"); }}>Eliminar firma</button>
                  </div>
                ) : mostrarFirma ? (
                  <FirmaDigital
                    onSave={(firma) => {
                      setFirmaBase64(firma);
                      updateOrden(orden.id, { firma_Cliente: firma });
                      setMostrarFirma(false);
                      showToast('Firma guardada', 'success');
                    }}
                    onCancel={() => setMostrarFirma(false)}
                  />
                ) : (
                  <button className="btn-accion" onClick={() => setMostrarFirma(true)}>Capturar firma</button>
                )}
              </div>
            </div>
            <div className="panel-card mt-1">
              <h3 className="panel-card-title"><FaCamera /> Fotografías de Entrega</h3>
              <div className="flex flex-wrap gap-2">
                {fotosEntrega.map((url, idx) => (
                  <img key={idx} src={url} alt={`Entrega ${idx+1}`} className="w-16 h-16 object-cover rounded-lg border" />
                ))}
              </div>
              <UploadFoto
                onUpload={(file, preview) => handleSubirFotoEtapa('Entrega', file, preview)}
                label="Agregar foto"
                className="mt-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Toasts */}
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
    </div>
  );
}