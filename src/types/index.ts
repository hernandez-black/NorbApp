// ─── ROLES ────────────────────────────────────────────────
export type Rol = "admin" | "mecanico" | "recepcion";

// ─── USUARIO ──────────────────────────────────────────────
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  creado_en: string;
}

// ─── CLIENTE ──────────────────────────────────────────────
export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  correo?: string;
  tipo: "particular" | "empresa";
  razon_social?: string;
  rfc?: string;
  creado_en: string;
}

// ─── VEHÍCULO ─────────────────────────────────────────────
export interface Vehiculo {
  id: string;
  cliente_id: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  placas: string;
  kilometraje: number;
  vin?: string;
  motor?: string;
  cilindraje?: string;
  creado_en: string;
}

// ─── ESTADOS DE ORDEN (RF-22) ─────────────────────────────
export type EstadoOrden =
  | "Ingresado"
  | "Diagnosticado"
  | "Autorizado"
  | "Terminado";

// Agregar después de EstadoOrden
export interface OrdenResumen {
  id: string;
  numero: string;
  cliente: string;
  vehiculo: string;
  mecanico: string;
  estado: EstadoOrden;
  fecha: string;
}


// ─── ORDEN DE SERVICIO ────────────────────────────────────
export interface Orden {
  id: string;
  numero: number;               // ORD-001, ORD-002...
  cliente_id: string;
  vehiculo_id: string;
  motivo_ingreso: string;
  estado: EstadoOrden;
  responsable_recepcion: string;
  anticipo: number;
  pago_final: number;
  autorizado: boolean;
  autorizado_por?: string;      // medio: WhatsApp, presencial...
  creado_en: string;
  entregado_en?: string;
  // Relaciones (cuando se hace join con Supabase)
  cliente?: Cliente;
  vehiculo?: Vehiculo;
  objetos?: ObjetoInventario[];
  diagnostico?: Diagnostico;
  cotizacion?: Cotizacion;
  refacciones?: Refaccion[];
  bitacora?: BitacoraItem[];
  checklist?: {
    prueba_final?: Checklist;
    entrega?: Checklist;
  };
  mecanicos?: Usuario[];        // para mostrar en resumen y detalles
  fecha?: string; // alias conveniente para interfaces existentes (puede mapear a creado_en)
  evidencias?: Evidencia[];     // para mostrar fotos en detalles
  firma_Cliente?: string;          // base64 de la firma digital (para mostrar en detalles) 
}

// ─── DIAGNÓSTICO ──────────────────────────────────────────
export interface Diagnostico {
  id: string;
  orden_id: string;
  que_hace: string;
  como_lo_hace: string;
  cuando_lo_hace: string;
  desde_cuando: string;
  cambios_previos: boolean;
  desc_cambios?: string;
  costo_diagnostico?: number;
  creado_en: string;
}

// ─── COTIZACIÓN ───────────────────────────────────────────
export interface Cotizacion {
  id: string;
  orden_id: string;
  numero_ticket: string;        // mismo que la orden
  concepto_mano_obra: string;
  costo_mano_obra: number;
  subtotal: number;
  total: number;
  creado_en: string;
  items: ItemCotizacion[];
}

export interface ItemCotizacion {
  id: string;
  cotizacion_id: string;
  descripcion: string;
  cantidad: number;
  costo_unitario: number;
  total: number;
}

// ─── REFACCIÓN ────────────────────────────────────────────
export type EstadoRefaccion =
  | "Solicitada"
  | "En camino"
  | "Recibida"
  | "Instalada";

export interface Refaccion {
  id: string;
  orden_id: string;
  nombre: string;
  marca?: string;
  proveedor: string;
  cantidad: number;
  costo: number;
  estado: EstadoRefaccion;
  fecha_solicitud: string;
  fecha_estimada?: string;
  fecha_recepcion?: string;
  observaciones?: string;
  foto_recibida?: string;       // URL Supabase Storage
  foto_instalada?: string;      // URL Supabase Storage
}

// ─── EVIDENCIA FOTOGRÁFICA ────────────────────────────────
export type TipoEvidencia =
  | "Recepción"
  | "Diagnóstico"
  | "Reparación"
  | "Entrega";

export interface Evidencia {
  id: string;
  orden_id: string;
  tipo: TipoEvidencia;
  url_foto: string;             // URL Supabase Storage
  descripcion?: string;
  responsable: string;
  creado_en: string;
}

// ─── BITÁCORA DE AVANCES ──────────────────────────────────
export interface BitacoraItem {
  id: string;
  orden_id: string;
  mecanico_id: string;
  descripcion: string;
  creado_en: string;
  mecanico?: string | Usuario;
}

// ─── CHECKLIST ────────────────────────────────────────────
export type TipoChecklist = "prueba_final" | "entrega";

export interface Checklist {
  id: string;
  orden_id: string;
  tipo: TipoChecklist;
  sin_danos: boolean;
  limpieza: boolean;
  piezas_ok: boolean;
  llaves_ok: boolean;
  prueba_ok?: boolean;          // solo en prueba_final
  firma_cliente?: string;       // base64 de la firma digital
  observaciones?: string;
  completado_en?: string;
}

// ─── MECÁNICO ASIGNADO ────────────────────────────────────
export interface Asignacion {
  id: string;
  orden_id: string;
  mecanico_id: string;
  asignado_en: string;
  mecanico?: Usuario;
}

// ─── INVENTARIO DE OBJETOS (RF-08) ────────────────────────
export interface ObjetoInventario {
  id: string;
  orden_id: string;
  descripcion: string;
  cantidad: number;
}

// ─── PAGO ─────────────────────────────────────────────────
export type FormaPago = "Efectivo" | "Transferencia" | "Tarjeta";

export interface Pago {
  id: string;
  orden_id: string;
  tipo: "anticipo" | "saldo_final";
  monto: number;
  forma_pago: FormaPago;
  registrado_por: string;
  creado_en: string;
}

