import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  Orden, OrdenResumen, Cliente, Vehiculo, Diagnostico,
  Cotizacion, ItemCotizacion, Refaccion, BitacoraItem, Checklist
} from '../types';

// ---- Clave para localStorage ----
const STORAGE_KEY = 'norbapp_ordenes';

// ---- Función para cargar órdenes desde localStorage o usar mocks ----
const loadOrdenes = (): Orden[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error al cargar órdenes desde localStorage:', e);
  }
  return ordenesMock;
};

// ---- Mocks ----
const mockCliente: Cliente = {
  id: "1",
  nombre: "Carlos Ramírez",
  telefono: "555-123-4567",
  correo: "carlos@mail.com",
  tipo: "particular",
  creado_en: "01/01/2025",
};

const mockVehiculo: Vehiculo = {
  id: "1",
  cliente_id: "1",
  marca: "Toyota",
  modelo: "Corolla",
  anio: 2020,
  color: "Blanco",
  placas: "ABC-123",
  kilometraje: 45000,
  vin: "1HGBH41JXMN109186",
  motor: "2.0L",
  cilindraje: "4 cilindros",
  creado_en: "01/01/2025",
};

const mockDiagnostico: Diagnostico = {
  id: "d1",
  orden_id: "1",
  que_hace: "Chirrido metálico al frenar",
  como_lo_hace: "Sonido fuerte que aumenta con la velocidad",
  cuando_lo_hace: "Al presionar el pedal de freno",
  desde_cuando: "Hace 2 semanas",
  cambios_previos: false,
  costo_diagnostico: 300,
  creado_en: "08/06/2025",
};

const mockItemsCotizacion: ItemCotizacion[] = [
  { id: "i1", cotizacion_id: "c1", descripcion: "Pastillas de freno delanteras", cantidad: 1, costo_unitario: 850, total: 850 },
  { id: "i2", cotizacion_id: "c1", descripcion: "Discos de freno", cantidad: 2, costo_unitario: 1200, total: 2400 },
];

const mockCotizacion: Cotizacion = {
  id: "c1",
  orden_id: "1",
  numero_ticket: "ORD-001",
  concepto_mano_obra: "Cambio de sistema de frenos completo",
  costo_mano_obra: 800,
  subtotal: 4050,
  total: 4050,
  creado_en: "08/06/2025",
  items: mockItemsCotizacion,
};

const mockRefacciones: Refaccion[] = [
  { id: "r1", orden_id: "1", nombre: "Pastillas de freno", proveedor: "AutoPartes SA", cantidad: 1, costo: 850, estado: "Instalada", fecha_solicitud: "06/06/2025", fecha_estimada: "07/06/2025", fecha_recepcion: "07/06/2025" },
  { id: "r2", orden_id: "1", nombre: "Discos de freno", proveedor: "AutoPartes SA", cantidad: 2, costo: 1200, estado: "Recibida", fecha_solicitud: "06/06/2025", fecha_estimada: "08/06/2025", fecha_recepcion: "08/06/2025" },
];

const mockBitacora: BitacoraItem[] = [
  { id: "b1", orden_id: "1", mecanico_id: "m1", descripcion: "Se desmontaron las ruedas delanteras", creado_en: "08/06/2025 09:00", mecanico: { id: "m1", nombre: "Juan Pérez", email: "juan@norba.com", rol: "mecanico", activo: true, creado_en: "2025-01-01" } },
  { id: "b2", orden_id: "1", mecanico_id: "m1", descripcion: "Se detectó desgaste severo en pastillas", creado_en: "08/06/2025 10:30", mecanico: { id: "m1", nombre: "Juan Pérez", email: "juan@norba.com", rol: "mecanico", activo: true, creado_en: "2025-01-01" } },
];

const mockChecklistPruebaFinal: Checklist = {
  id: "ch_pf1", orden_id: "1", tipo: "prueba_final",
  sin_danos: true, limpieza: false, piezas_ok: true, llaves_ok: false, prueba_ok: false,
};

const mockChecklistEntrega: Checklist = {
  id: "ch_ent1", orden_id: "1", tipo: "entrega",
  sin_danos: false, limpieza: false, piezas_ok: false, llaves_ok: false,
};

// 👇 ORDEN MOCK ACTUALIZADA CON tipo Y checklist_extra (para pruebas)
const ordenesMock: Orden[] = [
  {
    id: "1",
    numero: 1,
    cliente_id: "1",
    vehiculo_id: "1",
    motivo_ingreso: "Ruido al frenar y vibración en el volante a alta velocidad.",
    estado: "Autorizado",
    responsable_recepcion: "Pedro Recepción",
    anticipo: 2025,
    pago_final: 0,
    autorizado: true,
    autorizado_por: "WhatsApp",
    creado_en: "08/06/2025",
    entregado_en: undefined,
    cliente: mockCliente,
    vehiculo: mockVehiculo,
    diagnostico: mockDiagnostico,
    cotizacion: mockCotizacion,
    refacciones: mockRefacciones,
    bitacora: mockBitacora,
    checklist: { prueba_final: mockChecklistPruebaFinal, entrega: mockChecklistEntrega },
    objetos: [
      { id: "o1", orden_id: "1", descripcion: "Llanta de refacción", cantidad: 1 },
      { id: "o2", orden_id: "1", descripcion: "Gato hidráulico", cantidad: 1 },
    ],
    mecanicos: [],
    tipo: "correctivo", // 👈 NUEVO: tipo de orden
    checklist_extra: [ // 👈 NUEVO: items extra para checklist (para pruebas)
      { id: "ce1", seccion: "prueba_final", label: "Verificar nivel de aceite", checked: false },
      { id: "ce2", seccion: "entrega", label: "Entregar manual de usuario", checked: true },
    ],
  },
];

// ---- Tipos del contexto (con deleteOrden) ----
interface OrdenContextType {
  ordenes: Orden[];
  ordenesResumen: OrdenResumen[];
  getOrdenById: (id: string) => Orden | undefined;
  updateOrden: (id: string, data: Partial<Orden>) => void;
  createOrden: (orden: Omit<Orden, 'id' | 'numero' | 'creado_en'>) => void;
  deleteOrden: (id: string) => void; // 👈 NUEVO
}

// ---- Contexto ----
export const OrdenContext = createContext<OrdenContextType | undefined>(undefined);

// ---- Provider ----
export const OrdenProvider = ({ children }: { children: ReactNode }) => {
  const [ordenes, setOrdenes] = useState<Orden[]>(loadOrdenes);

  // Guardar en localStorage cada vez que cambien las órdenes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ordenes));
    } catch (e) {
      console.warn('Error al guardar órdenes en localStorage:', e);
    }
  }, [ordenes]);

  const getOrdenById = (id: string) => ordenes.find(o => o.id === id);

  const updateOrden = (id: string, data: Partial<Orden>) => {
    setOrdenes(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  };

  const createOrden = (orden: Omit<Orden, 'id' | 'numero' | 'creado_en'>) => {
    const lastNum = ordenes.reduce((max, o) => Math.max(max, o.numero), 0);
    const newNum = lastNum + 1;
    const newId = String(newNum);

    const defaultChecklist = {
      prueba_final: {
        id: `ch_${newId}_pf`, orden_id: newId, tipo: "prueba_final" as const,
        sin_danos: false, limpieza: false, piezas_ok: false, llaves_ok: false, prueba_ok: false,
      },
      entrega: {
        id: `ch_${newId}_ent`, orden_id: newId, tipo: "entrega" as const,
        sin_danos: false, limpieza: false, piezas_ok: false, llaves_ok: false,
      },
    };

    const newOrden: Orden = {
      ...orden,
      id: newId,
      numero: newNum,
      creado_en: new Date().toLocaleDateString('es-MX'),
      diagnostico: orden.diagnostico || undefined,
      cotizacion: orden.cotizacion || undefined,
      refacciones: orden.refacciones || [],
      bitacora: orden.bitacora || [],
      checklist: orden.checklist || defaultChecklist,
      objetos: orden.objetos || [],
      mecanicos: orden.mecanicos || [],
      tipo: orden.tipo,
      checklist_extra: orden.checklist_extra || [],
    };

    setOrdenes(prev => [...prev, newOrden]);
  };

  // 👇 NUEVA FUNCIÓN deleteOrden
  const deleteOrden = (id: string) => {
    setOrdenes(prev => prev.filter(o => o.id !== id));
  };

  const ordenesResumen: OrdenResumen[] = ordenes.map(o => ({
    id: o.id,
    numero: `ORD-${o.numero.toString().padStart(3, '0')}`,
    cliente: o.cliente?.nombre || "Cliente sin nombre",
    vehiculo: o.vehiculo ? `${o.vehiculo.marca} ${o.vehiculo.modelo} ${o.vehiculo.anio}` : "Vehículo sin datos",
    mecanico: "No asignado",
    estado: o.estado,
    fecha: o.creado_en,
    tipo: o.tipo,
  }));

  return (
    <OrdenContext.Provider value={{ 
      ordenes, 
      ordenesResumen, 
      getOrdenById, 
      updateOrden, 
      createOrden,
      deleteOrden // 👈 EXPORTADO
    }}>
      {children}
    </OrdenContext.Provider>
  );
};