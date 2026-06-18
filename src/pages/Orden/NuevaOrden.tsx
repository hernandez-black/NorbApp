// src/pages/Orden/NuevaOrden.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Cliente, Vehiculo } from '../../types';
import {useOrdenes} from '../../context/useOrdenes';


// Mock de clientes y vehículos (deberían venir de su propio contexto, pero usamos los mismos mocks)
const clientesMock: Cliente[] = [
  { id: "1", nombre: "Carlos Ramírez", telefono: "555-123-4567", correo: "carlos@mail.com", tipo: "particular", creado_en: "01/01/2025" },
  { id: "2", nombre: "María López", telefono: "555-234-5678", correo: "maria@mail.com", tipo: "particular", creado_en: "15/02/2025" },
  { id: "3", nombre: "Transportes RSA", telefono: "555-345-6789", correo: "rsa@empresa.com", tipo: "empresa", razon_social: "Transportes RSA S.A. de C.V.", rfc: "TRS123456ABC", creado_en: "10/03/2025" },
  { id: "4", nombre: "Ana Martínez", telefono: "555-456-7890", correo: "ana@mail.com", tipo: "particular", creado_en: "22/04/2025" },
  { id: "5", nombre: "Jorge Hernández", telefono: "555-567-8901", correo: "jorge@mail.com", tipo: "particular", creado_en: "05/05/2025" },
];

const vehiculosMock: Vehiculo[] = [
  { id: "1", cliente_id: "1", marca: "Toyota", modelo: "Corolla", anio: 2020, color: "Blanco", placas: "ABC-123", kilometraje: 45000, vin: "1HGBH41JXMN109186", motor: "2.0L", cilindraje: "4 cilindros", creado_en: "08/06/2025" },
  { id: "2", cliente_id: "2", marca: "Nissan", modelo: "Sentra", anio: 2018, color: "Gris", placas: "DEF-456", kilometraje: 72000, vin: "3N1AB7AP0JY123456", motor: "1.8L", cilindraje: "4 cilindros", creado_en: "07/06/2025" },
  { id: "3", cliente_id: "3", marca: "Chevrolet", modelo: "Aveo", anio: 2019, color: "Rojo", placas: "GHI-789", kilometraje: 38000, vin: "", motor: "1.6L", cilindraje: "4 cilindros", creado_en: "06/06/2025" },
  { id: "4", cliente_id: "4", marca: "Volkswagen", modelo: "Jetta", anio: 2021, color: "Negro", placas: "JKL-012", kilometraje: 21000, vin: "3VW2B7AJ0MM123789", motor: "1.4T", cilindraje: "4 cilindros", creado_en: "05/06/2025" },
];

export default function NuevaOrden() {
  const navigate = useNavigate();
  const { createOrden } = useOrdenes(); // Usamos el hook importado
  const [clienteId, setClienteId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');
  const [motivoIngreso, setMotivoIngreso] = useState('');

  const handleSubmit = () => {
    if (!clienteId || !vehiculoId) {
      alert('Selecciona cliente y vehículo');
      return;
    }

    // Buscar el cliente y vehículo completos
    const cliente = clientesMock.find(c => c.id === clienteId);
    const vehiculo = vehiculosMock.find(v => v.id === vehiculoId);

    if (!cliente || !vehiculo) {
      alert('Error: datos no encontrados');
      return;
    }

    createOrden({
      cliente_id: clienteId,
      vehiculo_id: vehiculoId,
      motivo_ingreso: motivoIngreso,
      estado: 'Ingresado',
      responsable_recepcion: '',
      anticipo: 0,
      pago_final: 0,
      autorizado: false,
      autorizado_por: undefined,
      // 🔥 Pasamos los objetos completos
      cliente: cliente,
      vehiculo: vehiculo,
    });
    navigate('/ordenes');
  };

  return (
    <div className="form-card">
      <h2>Nueva Orden de Servicio</h2>
      <div className="form-group">
        <label>Cliente</label>
        <select value={clienteId} onChange={e => setClienteId(e.target.value)}>
          <option value="">Seleccionar</option>
          {clientesMock.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Vehículo</label>
        <select value={vehiculoId} onChange={e => setVehiculoId(e.target.value)} disabled={!clienteId}>
          <option value="">Seleccionar</option>
          {vehiculosMock.filter(v => v.cliente_id === clienteId).map(v => (
            <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.placas}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Motivo de ingreso</label>
        <textarea value={motivoIngreso} onChange={e => setMotivoIngreso(e.target.value)} rows={3} />
      </div>
      <div className="form-actions">
        <button className="btn-cancelar" onClick={() => navigate('/ordenes')}>Cancelar</button>
        <button className="btn-guardar" onClick={handleSubmit}>Crear orden</button>
      </div>
    </div>
  );
}