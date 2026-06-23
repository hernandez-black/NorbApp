// src/types/index.ts
export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  correo?: string;
  tipo: 'particular' | 'empresa';
  razon_social?: string;
  rfc?: string;
  creado_en: string;
  updated_at?: string;
}

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
  updated_at?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'mecanico' | 'recepcion';
  activo: boolean;
  creado_en: string;
  updated_at?: string;
}

export interface Orden {
  id: string;
  numero: number;
  cliente_id: string;
  vehiculo_id: string;
  motivo_ingreso?: string;
  estado: 'Ingresado' | 'Diagnosticado' | 'Autorizado' | 'Terminado';
  tipo: 'Preventivo' | 'Correctivo' | 'Diagnóstico de fallas';
  responsable_recepcion?: string;
  anticipo: number;
  pago_final: number;
  autorizado: boolean;
  autorizado_por?: string;
  creado_en: string;
  entregado_en?: string;
  updated_at?: string;
}

export interface Diagnostico {
  id: string;
  orden_id: string;
  que_hace?: string;
  como_lo_hace?: string;
  cuando_lo_hace?: string;
  desde_cuando?: string;
  cambios_previos: boolean;
  desc_cambios?: string;
  costo_diagnostico?: number;
  creado_en: string;
}

export interface Cotizacion {
  id: string;
  orden_id: string;
  numero_ticket: string;
  concepto_mano_obra?: string;
  costo_mano_obra: number;
  subtotal: number;
  total: number;
  creado_en: string;
  items?: ItemCotizacion[];
}

export interface ItemCotizacion {
  id: string;
  cotizacion_id: string;
  descripcion: string;
  cantidad: number;
  costo_unitario: number;
  total: number;
}

export interface Refaccion {
  id: string;
  orden_id: string;
  nombre: string;
  marca?: string;
  proveedor: string;
  cantidad: number;
  costo: number;
  estado: 'Solicitada' | 'En camino' | 'Recibida' | 'Instalada';
  fecha_solicitud?: string;
  fecha_estimada?: string;
  fecha_recepcion?: string;
  observaciones?: string;
  foto_recibida?: string;
  foto_instalada?: string;
  created_at?: string;
}

export interface Evidencia {
  id: string;
  orden_id: string;
  tipo: 'Recepción' | 'Diagnóstico' | 'Reparación' | 'Entrega';
  url_foto: string;
  descripcion?: string;
  responsable?: string;
  creado_en: string;
}

export interface BitacoraItem {
  id: string;
  orden_id: string;
  mecanico_id: string;
  descripcion: string;
  creado_en: string;
}

export interface Checklist {
  id: string;
  orden_id: string;
  tipo: 'prueba_final' | 'entrega';
  sin_danos: boolean;
  limpieza: boolean;
  piezas_ok: boolean;
  llaves_ok: boolean;
  prueba_ok?: boolean;
  firma_cliente?: string;
  observaciones?: string;
  completado_en?: string;
}

export interface ChecklistExtra {
  id: string;
  orden_id: string;
  seccion: 'prueba_final' | 'entrega';
  label: string;
  checked: boolean;
}

export interface ObjetoInventario {
  id: string;
  orden_id: string;
  descripcion: string;
  cantidad: number;
}

export interface Pago {
  id: string;
  orden_id: string;
  tipo: 'anticipo' | 'saldo_final';
  monto: number;
  forma_pago: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  registrado_por: string;
  creado_en: string;
}

export interface OrdenMecanico {
  id: string;
  orden_id: string;
  mecanico_id: string;
  asignado_en: string;
}