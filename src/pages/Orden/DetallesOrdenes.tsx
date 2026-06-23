import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft, FaCar, FaStethoscope, FaFileInvoiceDollar,
  FaWrench, FaClipboardList, FaCheckCircle, FaHandshake,
  FaCamera, FaTools, FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaFileUpload, FaFilePdf
} from "react-icons/fa";
import { useOrdenes } from '../../context/useOrdenes';
import { useToast } from '../../context/useToast';
import type { EstadoOrden, ObjetoInventario, Usuario, ItemCotizacion, Refaccion, BitacoraItem, Cotizacion, FormaPago, Diagnostico, Rol, Evidencia, Checklist, EstadoRefaccion, TipoOrden } from "../../types";
import UploadFoto from "../../components/ui/UpdloadFoto";
import Modal from "../../components/ui/Modal";
import { generarPDFOrden } from '../../utils/generarPDF';
import CartaCompromiso from '../../components/ui/cartaCompromiso';
import { vehiculosMock } from '../../mocks/data';
import ConfirmModal from '../../components/ui/ConfirmModal'; // ✅ Descomentado y ruta corregida
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
  //  

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
                <button onClick={saveEdit} className="btn-icon btn-success"><FaSave /></button>
                <button onClick={cancelEdit} className="btn-icon btn-danger"><FaTimes /></button>
              </>
            ) : (
              <>
                <FaCheckCircle className="obj-icon" />
                <span>{obj.descripcion} (x{obj.cantidad})</span>
                <div className="obj-actions">
                  <button onClick={() => startEdit(obj)} className="btn-icon btn-edit"><FaEdit /></button>
                  <button onClick={() => handleDelete(obj.id)} className="btn-icon btn-danger"><FaTrash /></button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <button onClick={handleAdd} className="btn-primary btn-sm" style={{ marginTop: "8px" }}>
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
      <table className="cotizacion-table refacciones-table">
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
              <td><button onClick={() => deleteItem(item.id)} className="btn-icon btn-danger"><FaTrash /></button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAdd} className="btn-primary btn-sm" style={{ marginTop: "8px" }}><FaPlus /> Agregar ítem</button>
    </div>
  );
}

const estadoConfig: Record<EstadoOrden, { clase: string; label: string }> = {
  "Ingresado":     { clase: "badge-ingresado",     label: "Ingresado" },
  "Diagnosticado": { clase: "badge-diagnosticado", label: "Diagnosticado" },
  "Autorizado":    { clase: "badge-autorizado",    label: "Autorizado" },
  "Terminado":     { clase: "badge-terminado",     label: "Terminado" },
};

export default function DetalleOrden() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { ordenes, updateOrden } = useOrdenes();
  const { showToast, toasts, removeToast } = useToast();
  const [tabActivo, setTabActivo] = useState("recepcion");
  const rol = localStorage.getItem("rol");

  const orden = ordenes.find(o => o.id === id);
  const [costoDiagnostico, setCostoDiagnostico] = useState<number>(orden?.diagnostico?.costo_diagnostico || 0);
  const [responsableRecepcion, setResponsableRecepcion] = useState(orden?.responsable_recepcion || "");
  const initialLoadRef = useRef(true);

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

  // ── Estados para modal de foto en grande ──
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);

  // ── Estados para agregar refacción ──
  const [mostrarModalRefaccion, setMostrarModalRefaccion] = useState(false);
  const [nuevaRefaccion, setNuevaRefaccion] = useState<Partial<Refaccion>>({
    nombre: '',
    proveedor: '',
    cantidad: 1,
    costo: 0,
    estado: 'Solicitada',
    fecha_solicitud: new Date().toLocaleDateString('es-MX'),
  });

  // ── Estados para checklist dinámico ──
  const [nuevoItemChecklist, setNuevoItemChecklist] = useState({
    seccion: 'prueba_final' as 'prueba_final' | 'entrega',
    texto: '',
  });
  const [mostrarInputChecklist, setMostrarInputChecklist] = useState(false);

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

  useEffect(() => {
  if (initialLoadRef.current && orden) {
    setCostoDiagnostico(orden.diagnostico?.costo_diagnostico || 0);
    setResponsableRecepcion(orden.responsable_recepcion || "");
    setFotosRecepcion(orden.evidencias?.filter(e => e.tipo === 'Recepción').map(e => e.url_foto) || []);
    setFotosDiagnostico(orden.evidencias?.filter(e => e.tipo === 'Diagnóstico').map(e => e.url_foto) || []);
    setFotosReparacion(orden.evidencias?.filter(e => e.tipo === 'Reparación').map(e => e.url_foto) || []);
    setFotosEntrega(orden.evidencias?.filter(e => e.tipo === 'Entrega').map(e => e.url_foto) || []);
    
    // 👇 NUEVO: Asignar tipo por defecto si no tiene
    if (!orden.tipo) {
      updateOrden(orden.id, { tipo: 'preventivo' });
    }
    
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

  const handleEliminarAvance = (id: string, descripcion: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Eliminar avance',
      message: `¿Estás seguro de eliminar el avance "${descripcion}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: () => {
        const bitacoraActualizada = orden.bitacora?.filter(b => b.id !== id) || [];
        updateOrden(orden.id, { bitacora: bitacoraActualizada });
        showToast('Avance eliminado', 'info');
      },
    });
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

  // ── Eliminar foto de refacción ──
  const handleEliminarFotoRefaccion = (refaccionId: string, tipo: 'recibida' | 'instalada') => {
    const campo = tipo === 'recibida' ? 'foto_recibida' : 'foto_instalada';
    const refaccionesActualizadas = orden.refacciones?.map(r => {
      if (r.id === refaccionId) {
        return { ...r, [campo]: undefined };
      }
      return r;
    }) || [];
    updateOrden(orden.id, { refacciones: refaccionesActualizadas });
    showToast(`Foto ${tipo === 'recibida' ? 'recibida' : 'instalada'} eliminada`, "info");
  };

  // ── Cambiar estado de refacción ──
  const handleCambiarEstadoRefaccion = (refaccionId: string, nuevoEstado: EstadoRefaccion) => {
    const refaccionesActualizadas = orden.refacciones?.map(r => {
      if (r.id === refaccionId) {
        return { ...r, estado: nuevoEstado };
      }
      return r;
    }) || [];
    updateOrden(orden.id, { refacciones: refaccionesActualizadas });
    showToast(`Estado de refacción actualizado a ${nuevoEstado}`, "success");
  };

  // ── Agregar refacción ──
  const handleAgregarRefaccion = () => {
    if (!nuevaRefaccion.nombre?.trim() || !nuevaRefaccion.proveedor?.trim()) {
      showToast("Nombre y proveedor son obligatorios", "error");
      return;
    }

    const refaccion: Refaccion = {
      id: Date.now().toString(),
      orden_id: orden.id,
      nombre: nuevaRefaccion.nombre,
      proveedor: nuevaRefaccion.proveedor,
      cantidad: nuevaRefaccion.cantidad || 1,
      costo: nuevaRefaccion.costo || 0,
      estado: nuevaRefaccion.estado as EstadoRefaccion || 'Solicitada',
      fecha_solicitud: nuevaRefaccion.fecha_solicitud || new Date().toLocaleDateString('es-MX'),
      fecha_estimada: nuevaRefaccion.fecha_estimada,
    };

    const refaccionesActualizadas = [...(orden.refacciones || []), refaccion];
    updateOrden(orden.id, { refacciones: refaccionesActualizadas });
    setMostrarModalRefaccion(false);
    setNuevaRefaccion({
      nombre: '',
      proveedor: '',
      cantidad: 1,
      costo: 0,
      estado: 'Solicitada',
      fecha_solicitud: new Date().toLocaleDateString('es-MX'),
    });
    showToast("Refacción agregada", "success");
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

    if (tipo === 'Recepción') setFotosRecepcion(prev => [...prev, preview]);
    if (tipo === 'Diagnóstico') setFotosDiagnostico(prev => [...prev, preview]);
    if (tipo === 'Reparación') setFotosReparacion(prev => [...prev, preview]);
    if (tipo === 'Entrega') setFotosEntrega(prev => [...prev, preview]);

    showToast(`Foto de ${tipo} agregada`, "success");
  };

  // ── Eliminar foto por etapa ──
  const handleEliminarFotoEtapa = (tipo: 'Recepción' | 'Diagnóstico' | 'Reparación' | 'Entrega', url: string) => {
    const evidenciasActuales = orden.evidencias || [];
    const nuevasEvidencias = evidenciasActuales.filter(e => !(e.tipo === tipo && e.url_foto === url));
    updateOrden(orden.id, { evidencias: nuevasEvidencias });

    if (tipo === 'Recepción') setFotosRecepcion(prev => prev.filter(f => f !== url));
    if (tipo === 'Diagnóstico') setFotosDiagnostico(prev => prev.filter(f => f !== url));
    if (tipo === 'Reparación') setFotosReparacion(prev => prev.filter(f => f !== url));
    if (tipo === 'Entrega') setFotosEntrega(prev => prev.filter(f => f !== url));

    showToast(`Foto de ${tipo} eliminada`, "info");
  };

  // ── Manejador de checklist fijo (los originales) ──────────
  const handleChecklistChange = (seccion: 'prueba_final' | 'entrega', campo: keyof Checklist, valor: boolean) => {
    const currentChecklist = orden.checklist || { prueba_final: {} as Checklist, entrega: {} as Checklist };
    const updatedSeccion = { ...currentChecklist[seccion], [campo]: valor };
    const updatedChecklist = { ...currentChecklist, [seccion]: updatedSeccion };
    updateOrden(orden.id, { checklist: updatedChecklist });
    showToast(`${campo} ${valor ? 'marcado' : 'desmarcado'}`, "info");
  };

  // ── Manejadores de checklist dinámico ──────────────────────
  const handleAgregarItemChecklist = () => {
    if (!nuevoItemChecklist.texto.trim()) {
      showToast("Escribe un nombre para el ítem", "error");
      return;
    }
    const extra = orden.checklist_extra || [];
    const nuevo = {
      id: Date.now().toString(),
      seccion: nuevoItemChecklist.seccion,
      label: nuevoItemChecklist.texto.trim(),
      checked: false,
    };
    updateOrden(orden.id, { checklist_extra: [...extra, nuevo] });
    setNuevoItemChecklist({ seccion: 'prueba_final', texto: '' });
    setMostrarInputChecklist(false);
    showToast('Ítem agregado al checklist', 'success');
  };

  const handleEliminarItemChecklist = (id: string, label: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Eliminar ítem del checklist',
      message: `¿Estás seguro de eliminar el ítem "${label}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: () => {
        const extra = orden.checklist_extra || [];
        updateOrden(orden.id, { checklist_extra: extra.filter(i => i.id !== id) });
        showToast('Ítem eliminado', 'info');
      },
    });
  };

  const handleToggleItemChecklist = (id: string) => {
    const extra = orden.checklist_extra || [];
    const updated = extra.map(i =>
      i.id === id ? { ...i, checked: !i.checked } : i
    );
    updateOrden(orden.id, { checklist_extra: updated });
  };

  // ── Renderizado ──────────────────────────────────────────
  return (
    <div className="detalle">
      {/* Header con botón PDF */}
      <div className="detalle-header">
        <div className="detalle-header-left">
          <button className="btn-back" onClick={() => navigate("/ordenes")}>
            <FaArrowLeft /> Volver
          </button>
          <button className="btn-secondary btn-sm" onClick={() => generarPDFOrden(orden)} style={{ marginLeft: '0.5rem' }}>
            <FaFilePdf /> Generar PDF
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
  <div className="detalle-header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <select
      className="select-estado"
      value={orden.tipo || 'Preventivo'}
      onChange={(e) => {
        updateOrden(orden.id, { tipo: e.target.value as TipoOrden });
        showToast(`Tipo de orden actualizado a ${e.target.value}`, 'success');
      }}
      style={{ minWidth: '140px' }}
    >
      <option value="Preventivo">Preventivo</option>
      <option value="Correctivo">Correctivo</option>
      <option value="Diagnóstico de fallas">Diagnóstico</option>
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
        {/* TAB 1: RECEPCIÓN (con fotos) - CORREGIDO: admin puede cambiar vehículo */}
        {tabActivo === "recepcion" && (
          <div className="tab-panel">
            <div className="panel-grid-2">
              {/* Datos del Cliente (sin cambios) */}
              <div className="panel-card">
                <h3 className="panel-card-title">Datos del Cliente</h3>
                <div className="info-list">
                  <div className="info-item"><span>Nombre</span><p>{orden.cliente?.nombre || "—"}</p></div>
                  <div className="info-item"><span>Teléfono</span><p>{orden.cliente?.telefono || "—"}</p></div>
                  <div className="info-item"><span>Correo</span><p>{orden.cliente?.correo || "—"}</p></div>
                  <div className="info-item"><span>Tipo</span><p>{orden.cliente?.tipo || "—"}</p></div>
                </div>
              </div>

              {/* ─── DATOS DEL VEHÍCULO (EDITABLE PARA ADMIN) ─── */}
              <div className="panel-card">
                <h3 className="panel-card-title">Datos del Vehículo</h3>
                {rol === "admin" ? (
                  <select
                    value={orden.vehiculo_id || ""}
                    onChange={(e) => {
                      const nuevoVehiculo = vehiculosMock.find(v => v.id === e.target.value);
                      if (nuevoVehiculo) {
                        updateOrden(orden.id, {
                          vehiculo_id: nuevoVehiculo.id,
                          vehiculo: nuevoVehiculo,
                        });
                        showToast('Vehículo actualizado correctamente', 'success');
                      }
                    }}
                    className="form-select"
                  >
                    {vehiculosMock
                      .filter(v => v.cliente_id === orden.cliente_id)
                      .map(v => (
                        <option key={v.id} value={v.id}>
                          {v.marca} {v.modelo} - {v.placas} ({v.anio})
                        </option>
                      ))}
                  </select>
                ) : (
                  <div className="info-list">
                    <div className="info-item"><span>Marca / Modelo</span><p>{orden.vehiculo?.marca} {orden.vehiculo?.modelo}</p></div>
                    <div className="info-item"><span>Año / Color</span><p>{orden.vehiculo?.anio} / {orden.vehiculo?.color}</p></div>
                    <div className="info-item"><span>Placas</span><p className="mono">{orden.vehiculo?.placas}</p></div>
                    <div className="info-item"><span>Kilometraje</span><p>{orden.vehiculo?.kilometraje?.toLocaleString()} km</p></div>
                    <div className="info-item"><span>VIN</span><p className="mono">{orden.vehiculo?.vin || "—"}</p></div>
                    <div className="info-item"><span>Motor / Cilindros</span><p>{orden.vehiculo?.motor} / {orden.vehiculo?.cilindraje}</p></div>
                  </div>
                )}
              </div>

              {/* Motivo de Ingreso (sin cambios) */}
              <div className="panel-card">
                <h3 className="panel-card-title">Motivo de Ingreso</h3>
                <p className="panel-texto">{orden.motivo_ingreso || "—"}</p>
                <div className="info-item mt-1">
                  <span>Recibió</span>
                  <select
                    value={responsableRecepcion}
                    onChange={(e) => handleUpdateResponsable(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Seleccionar responsable</option>
                    {usuariosMock.map(u => (
                      <option key={u.id} value={u.nombre}>{u.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Inventario de Objetos (sin cambios) */}
              <div className="panel-card">
                <h3 className="panel-card-title">Inventario de Objetos</h3>
                <ObjetosEditor objetos={orden.objetos || []} onUpdate={handleUpdateObjetos} ordenId={orden.id} />
              </div>
            </div>

            {/* Fotografías de Recepción (sin cambios) */}
            <div className="panel-card mt-1">
              <h3 className="panel-card-title"><FaCamera /> Fotografías de Recepción</h3>
              <div className="flex flex-wrap gap-2">
                {fotosRecepcion.map((url, idx) => (
                  <div key={idx} className="foto-wrapper">
                    <img
                      src={url}
                      alt={`Recepción ${idx+1}`}
                      className="foto-thumbnail"
                      onClick={() => setFotoSeleccionada(url)}
                    />
                    <button
                      className="btn-eliminar-foto"
                      onClick={() => handleEliminarFotoEtapa('Recepción', url)}
                      title="Eliminar foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <UploadFoto
                onUpload={(file, preview) => handleSubirFotoEtapa('Recepción', file, preview)}
                label="Agregar foto"
                className="mt-2"
                buttonClassName="btn-success btn-sm"
              />
            </div>
          </div>
        )}

        {/* TAB 2: DIAGNÓSTICO (con fotos) - sin cambios */}
        {tabActivo === "diagnostico" && (
          <div className="tab-panel">
            <div className="panel-grid-2">
              <div className="panel-card">
                <h3 className="panel-card-title">¿Qué hace?</h3>
                <textarea
                  value={orden.diagnostico?.que_hace || ""}
                  onChange={(e) => handleDiagnosticoChange('que_hace', e.target.value)}
                  rows={2}
                  className="form-textarea"
                />
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">¿Cómo lo hace?</h3>
                <textarea
                  value={orden.diagnostico?.como_lo_hace || ""}
                  onChange={(e) => handleDiagnosticoChange('como_lo_hace', e.target.value)}
                  rows={2}
                  className="form-textarea"
                />
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">¿Cuándo lo hace?</h3>
                <textarea
                  value={orden.diagnostico?.cuando_lo_hace || ""}
                  onChange={(e) => handleDiagnosticoChange('cuando_lo_hace', e.target.value)}
                  rows={2}
                  className="form-textarea"
                />
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">¿Desde cuándo?</h3>
                <textarea
                  value={orden.diagnostico?.desde_cuando || ""}
                  onChange={(e) => handleDiagnosticoChange('desde_cuando', e.target.value)}
                  rows={2}
                  className="form-textarea"
                />
              </div>
              <div className="panel-card">
                <h3 className="panel-card-title">¿Cambios previos?</h3>
                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!orden.diagnostico?.cambios_previos}
                      onChange={() => handleDiagnosticoChange('cambios_previos', false)}
                    /> No
                  </label>
                  <label className="flex items-center gap-2">
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
                    className="form-textarea mt-2"
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
                  className="form-input"
                />
              </div>
            </div>
            <div className="panel-card mt-1">
              <h3 className="panel-card-title"><FaCamera /> Fotografías de Diagnóstico</h3>
              <div className="flex flex-wrap gap-2">
                {fotosDiagnostico.map((url, idx) => (
                  <div key={idx} className="foto-wrapper">
                    <img
                      src={url}
                      alt={`Diagnóstico ${idx+1}`}
                      className="foto-thumbnail"
                      onClick={() => setFotoSeleccionada(url)}
                    />
                    <button
                      className="btn-eliminar-foto"
                      onClick={() => handleEliminarFotoEtapa('Diagnóstico', url)}
                      title="Eliminar foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <UploadFoto
                onUpload={(file, preview) => handleSubirFotoEtapa('Diagnóstico', file, preview)}
                label="Agregar foto"
                className="mt-2"
                buttonClassName="btn-success btn-sm"
              />
            </div>
          </div>
        )}

        {/* TAB 3: COTIZACIÓN - sin cambios */}
        {tabActivo === "cotizacion" && (
          <div className="tab-panel">
            <div className="panel-card">
              <div className="cotizacion-header">
                <div>
                  <h3 className="panel-card-title">Cotización #{orden.numero}</h3>
                  <p className="text-muted-sm">Edita los conceptos y la mano de obra</p>
                </div>
                {rol === "admin" && (
                  <button className="btn-primary" onClick={guardarCotizacion}>Guardar cotización</button>
                )}
              </div>

              <ItemCotizacionEditor items={itemsCotizacion} onUpdate={setItemsCotizacion} />

              <div className="mt-4">
                <div className="form-group">
                  <label className="form-label">Concepto de mano de obra</label>
                  <input type="text" value={conceptoManoObra} onChange={e => setConceptoManoObra(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Costo de mano de obra</label>
                  <input type="number" min={0} value={costoManoObra} onChange={e => setCostoManoObra(Number(e.target.value))} className="form-input" />
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
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={autorizado} onChange={e => setAutorizado(e.target.checked)} /> Cliente autorizó
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Medio de autorización</label>
                  <select value={autorizadoPor} onChange={e => setAutorizadoPor(e.target.value)} className="form-select">
                    <option value="">Seleccionar</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Teléfono">Teléfono</option>
                    <option value="Correo">Correo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Evidencia (captura o audio)</label>
                  <label htmlFor="evidencia-input" className="btn-evidencia">
                    <FaFileUpload /> {evidenciaFile ? "Cambiar archivo" : "Seleccionar archivo"}
                  </label>
                  <input
                    id="evidencia-input"
                    type="file"
                    accept="image/*,audio/*"
                    onChange={e => setEvidenciaFile(e.target.files?.[0] || null)}
                    className="input-file-hidden"
                  />
                  {evidenciaFile && <p className="text-muted-sm mt-1">📎 {evidenciaFile.name}</p>}
                </div>
                <button className="btn-primary" onClick={guardarAutorizacion}>Guardar autorización</button>
              </div>

              <div className="panel-card">
                <h3 className="panel-card-title">Anticipo (RF-16)</h3>
                <div className="form-group">
                  <label className="form-label">Total de cotización</label>
                  <p className="mono text-lg font-bold">${total.toLocaleString("es-MX")}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">50% sugerido</label>
                  <p className="mono">${(total * 0.5).toLocaleString("es-MX")}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Monto a registrar</label>
                  <input type="number" min={0} step={100} value={anticipoMonto} onChange={e => setAnticipoMonto(Number(e.target.value))} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Forma de pago</label>
                  <select value={formaPagoAnticipo} onChange={e => setFormaPagoAnticipo(e.target.value as FormaPago)} className="form-select">
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
                <button className="btn-primary" onClick={registrarAnticipo}>Registrar anticipo</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REFACCIONES (con fotos, cambio de estado y agregar) - sin cambios */}
        {tabActivo === "refacciones" && (
          <div className="tab-panel">
            <div className="panel-card">
              <div className="cotizacion-header">
                <h3 className="panel-card-title">Refacciones</h3>
                <button className="btn-primary" onClick={() => setMostrarModalRefaccion(true)}>
                  <FaPlus /> Agregar refacción
                </button>
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
                        <td>
                          <select
                            value={r.estado}
                            onChange={(e) => handleCambiarEstadoRefaccion(r.id, e.target.value as EstadoRefaccion)}
                            className="form-select form-select-sm"
                          >
                            <option value="Solicitada">Solicitada</option>
                            <option value="En camino">En camino</option>
                            <option value="Recibida">Recibida</option>
                            <option value="Instalada">Instalada</option>
                          </select>
                        </td>
                        <td className="text-muted-sm">{r.fecha_solicitud}</td>
                        <td className="text-muted-sm">{r.fecha_estimada || "—"}</td>
                        <td className="text-muted-sm">{r.fecha_recepcion || "—"}</td>
                        <td>
                          {r.foto_recibida ? (
                            <div className="foto-wrapper">
                              <img
                                src={r.foto_recibida}
                                alt="Recibida"
                                className="foto-thumbnail-sm"
                                onClick={() => setFotoSeleccionada(r.foto_recibida!)}
                              />
                              <button
                                className="btn-eliminar-foto-sm"
                                onClick={() => handleEliminarFotoRefaccion(r.id, 'recibida')}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <UploadFoto
                              onUpload={(file, preview) => handleSubirFotoRefaccion(r.id, 'recibida', file, preview)}
                              label="Subir"
                              className="inline-block"
                              buttonClassName="upload-btn-compact"
                            />
                          )}
                        </td>
                        <td>
                          {r.foto_instalada ? (
                            <div className="foto-wrapper">
                              <img
                                src={r.foto_instalada}
                                alt="Instalada"
                                className="foto-thumbnail-sm"
                                onClick={() => setFotoSeleccionada(r.foto_instalada!)}
                              />
                              <button
                                className="btn-eliminar-foto-sm"
                                onClick={() => handleEliminarFotoRefaccion(r.id, 'instalada')}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <UploadFoto
                              onUpload={(file, preview) => handleSubirFotoRefaccion(r.id, 'instalada', file, preview)}
                              label="Subir"
                              className="inline-block"
                              buttonClassName="upload-btn-compact"
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

        {/* Modal para agregar refacción - sin cambios */}
        <Modal isOpen={mostrarModalRefaccion} onClose={() => setMostrarModalRefaccion(false)} title="Agregar refacción">
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input type="text" value={nuevaRefaccion.nombre || ''} onChange={e => setNuevaRefaccion({ ...nuevaRefaccion, nombre: e.target.value })} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Proveedor *</label>
            <input type="text" value={nuevaRefaccion.proveedor || ''} onChange={e => setNuevaRefaccion({ ...nuevaRefaccion, proveedor: e.target.value })} className="form-input" />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Cantidad</label>
              <input type="number" min={1} value={nuevaRefaccion.cantidad || 1} onChange={e => setNuevaRefaccion({ ...nuevaRefaccion, cantidad: Number(e.target.value) })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Costo</label>
              <input type="number" min={0} value={nuevaRefaccion.costo || 0} onChange={e => setNuevaRefaccion({ ...nuevaRefaccion, costo: Number(e.target.value) })} className="form-input" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha estimada</label>
            <input type="date" value={nuevaRefaccion.fecha_estimada || ''} onChange={e => setNuevaRefaccion({ ...nuevaRefaccion, fecha_estimada: e.target.value })} className="form-input" />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button className="btn-secondary" onClick={() => setMostrarModalRefaccion(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleAgregarRefaccion}>Guardar refacción</button>
          </div>
        </Modal>

        {/* TAB 5: REPARACIÓN (con Bitácora y Mecánicos) - con modal para eliminar avance */}
        {tabActivo === "reparacion" && (
          <div className="tab-panel">
            {/* Panel de Bitácora */}
            <div className="panel-card">
              <div className="cotizacion-header">
                <h3 className="panel-card-title">Bitácora de Avances</h3>
                <button
                  className="btn-primary"
                  onClick={() => setMostrarFormAvance(!mostrarFormAvance)}
                >
                  {mostrarFormAvance ? 'Cancelar' : '+ Registrar avance'}
                </button>
              </div>

              {mostrarFormAvance && (
                <div className="bg-gray-800/20 p-4 rounded-lg mb-4">
                  <div className="form-group">
                    <label className="form-label">Descripción del avance</label>
                    <textarea
                      value={nuevoAvance}
                      onChange={(e) => setNuevoAvance(e.target.value)}
                      rows={3}
                      placeholder="Ej: Se desmontaron las ruedas delanteras..."
                      className="form-textarea"
                    />
                  </div>
                  <button className="btn-primary mt-2" onClick={handleAgregarAvance}>Guardar avance</button>
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
                      <div className="bitacora-acciones">
                        <button className="btn-icon btn-edit" onClick={() => handleEditarAvance(b)} title="Editar avance"><FaEdit /></button>
                        <button className="btn-icon btn-danger" onClick={() => handleEliminarAvance(b.id, b.descripcion)} title="Eliminar avance"><FaTrash /></button>
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
              <div className="flex flex-wrap gap-2 mb-2">
                {orden.mecanicos && orden.mecanicos.length > 0 ? (
                  orden.mecanicos.map(m => (
                    <span key={m.id} className="badge-mecanico">
                      {m.nombre}
                      <button onClick={() => handleRemoverMecanico(m.id)} className="ml-1 hover:text-red-400">×</button>
                    </span>
                  ))
                ) : (
                  <span className="text-muted-sm">Ningún mecánico asignado</span>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={mecanicoSeleccionado}
                  onChange={(e) => setMecanicoSeleccionado(e.target.value)}
                  className="form-select"
                >
                  <option value="">Seleccionar mecánico...</option>
                  {mecanicosDisponibles
                    .filter(m => !orden.mecanicos?.some(a => a.id === m.id))
                    .map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                </select>
                <button className="btn-primary" onClick={handleAgregarMecanico}>Asignar</button>
              </div>
            </div>

            <div className="panel-card mt-1">
              <h3 className="panel-card-title"><FaCamera /> Fotografías de Reparación</h3>
              <div className="flex flex-wrap gap-2">
                {fotosReparacion.map((url, idx) => (
                  <div key={idx} className="foto-wrapper">
                    <img
                      src={url}
                      alt={`Reparación ${idx+1}`}
                      className="foto-thumbnail"
                      onClick={() => setFotoSeleccionada(url)}
                    />
                    <button
                      className="btn-eliminar-foto"
                      onClick={() => handleEliminarFotoEtapa('Reparación', url)}
                      title="Eliminar foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <UploadFoto
                onUpload={(file, preview) => handleSubirFotoEtapa('Reparación', file, preview)}
                label="Agregar foto"
                className="mt-2"
                buttonClassName="btn-success btn-sm"
              />
            </div>
          </div>
        )}

        {/* Modal para editar avance - sin cambios */}
        {avanceEditando && (
          <div className="modal-overlay" onClick={() => setAvanceEditando(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--fondo-card)', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
              <h3 style={{ marginBottom: '1rem' }}>Editar avance</h3>
              <textarea
                value={textoEditado}
                onChange={(e) => setTextoEditado(e.target.value)}
                rows={3}
                className="form-textarea"
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button className="btn-secondary" onClick={() => setAvanceEditando(null)}>Cancelar</button>
                <button className="btn-primary" onClick={handleGuardarEdicionAvance}>Guardar cambios</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CHECKLIST (interactivo + dinámico con modal para eliminar) */}
        {tabActivo === "checklist" && (
          <div className="tab-panel">
            <div className="panel-grid-2">
              {/* ─── PRUEBA FINAL ─── */}
              <div className="panel-card">
                <div className="flex justify-between items-center">
                  <h3 className="panel-card-title">Prueba Final</h3>
                  <button
                    className="btn-success btn-sm"
                    onClick={() => {
                      setNuevoItemChecklist({ seccion: 'prueba_final', texto: '' });
                      setMostrarInputChecklist(!mostrarInputChecklist);
                    }}
                  >
                    {mostrarInputChecklist && nuevoItemChecklist.seccion === 'prueba_final' ? 'Cancelar' : '+ Agregar ítem'}
                  </button>
                </div>

                {mostrarInputChecklist && nuevoItemChecklist.seccion === 'prueba_final' && (
                  <div className="flex gap-2 mt-2 items-center flex-wrap">
                    <input
                      type="text"
                      placeholder="Nuevo ítem..."
                      value={nuevoItemChecklist.texto}
                      onChange={(e) => setNuevoItemChecklist({ ...nuevoItemChecklist, texto: e.target.value })}
                      className="form-input flex-1"
                      style={{ minWidth: '150px' }}
                    />
                    <button className="btn-primary btn-sm" onClick={handleAgregarItemChecklist}>
                      Agregar
                    </button>
                  </div>
                )}

                <div className="checklist-lista">
                  {/* Ítems fijos */}
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
                  {/* Ítems extra (dinámicos) */}
                  {(orden.checklist_extra || [])
                    .filter(item => item.seccion === 'prueba_final')
                    .map(item => (
                      <div key={item.id} className="check-item">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => handleToggleItemChecklist(item.id)}
                          />
                          <span>{item.label}</span>
                          <button
                            onClick={() => handleEliminarItemChecklist(item.id, item.label)}
                            className="text-red-400 hover:text-red-600 transition-colors ml-2"
                            title="Eliminar ítem"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              {/* ─── CHECKLIST DE ENTREGA ─── */}
              <div className="panel-card">
                <div className="flex justify-between items-center">
                  <h3 className="panel-card-title">Checklist de Entrega</h3>
                  <button
                    className="btn-success btn-sm"
                    onClick={() => {
                      setNuevoItemChecklist({ seccion: 'entrega', texto: '' });
                      setMostrarInputChecklist(!mostrarInputChecklist);
                    }}
                  >
                    {mostrarInputChecklist && nuevoItemChecklist.seccion === 'entrega' ? 'Cancelar' : '+ Agregar ítem'}
                  </button>
                </div>

                {mostrarInputChecklist && nuevoItemChecklist.seccion === 'entrega' && (
                  <div className="flex gap-2 mt-2 items-center flex-wrap">
                    <input
                      type="text"
                      placeholder="Nuevo ítem..."
                      value={nuevoItemChecklist.texto}
                      onChange={(e) => setNuevoItemChecklist({ ...nuevoItemChecklist, texto: e.target.value })}
                      className="form-input flex-1"
                      style={{ minWidth: '150px' }}
                    />
                    <button className="btn-primary btn-sm" onClick={handleAgregarItemChecklist}>
                      Agregar
                    </button>
                  </div>
                )}

                <div className="checklist-lista">
                  {/* Ítems fijos */}
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
                  {/* Ítems extra (dinámicos) */}
                  {(orden.checklist_extra || [])
                    .filter(item => item.seccion === 'entrega')
                    .map(item => (
                      <div key={item.id} className="check-item">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => handleToggleItemChecklist(item.id)}
                          />
                          <span>{item.label}</span>
                          <button
                            onClick={() => handleEliminarItemChecklist(item.id, item.label)}
                            className="text-red-400 hover:text-red-600 transition-colors ml-2"
                            title="Eliminar ítem"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: ENTREGA (con Carta Compromiso y fotos) */}
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
                      <label className="form-label">Monto a cobrar</label>
                      <input type="number" min={0} step={100} value={pagoFinalMonto} onChange={e => setPagoFinalMonto(Number(e.target.value))} className="form-input" placeholder={String(total - anticipoMonto)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Forma de pago</label>
                      <select value={formaPagoFinal} onChange={e => setFormaPagoFinal(e.target.value as FormaPago)} className="form-select">
                        <option value="Efectivo">Efectivo</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Tarjeta">Tarjeta</option>
                      </select>
                    </div>
                    <button className="btn-primary mt-2" onClick={registrarPagoFinal}>Registrar pago final</button>
                  </>
                )}
              </div>

              {/* Carta Compromiso */}
              <CartaCompromiso
                orden={orden}
                onFirmar={(nombre) => {
                  updateOrden(orden.id, { firma_Cliente: nombre });
                  showToast('Carta compromiso firmada', 'success');
                }}
                firmado={!!orden.firma_Cliente}
                nombreFirmado={orden.firma_Cliente}
              />
            </div>
            <div className="panel-card mt-1">
              <h3 className="panel-card-title"><FaCamera /> Fotografías de Entrega</h3>
              <div className="flex flex-wrap gap-2">
                {fotosEntrega.map((url, idx) => (
                  <div key={idx} className="foto-wrapper">
                    <img
                      src={url}
                      alt={`Entrega ${idx+1}`}
                      className="foto-thumbnail"
                      onClick={() => setFotoSeleccionada(url)}
                    />
                    <button
                      className="btn-eliminar-foto"
                      onClick={() => handleEliminarFotoEtapa('Entrega', url)}
                      title="Eliminar foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <UploadFoto
                onUpload={(file, preview) => handleSubirFotoEtapa('Entrega', file, preview)}
                label="Agregar foto"
                className="mt-2"
                buttonClassName="btn-success btn-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal para ver foto en grande */}
      <Modal isOpen={!!fotoSeleccionada} onClose={() => setFotoSeleccionada(null)} title="Ver foto">
        {fotoSeleccionada && (
          <img src={fotoSeleccionada} alt="Foto" className="w-full h-auto max-h-[80vh] object-contain" />
        )}
      </Modal>

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
    </div>
  );
}