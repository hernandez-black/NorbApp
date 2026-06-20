// src/pages/VehiculoCard.tsx
import { FaCar } from "react-icons/fa";
import type { Vehiculo, Cliente } from "../types";
import "../css/VehiculoCard/VehiculoCard.css"; // Opcional: crea este CSS para estilos

interface VehiculoCardProps {
  cliente: Cliente;
  vehiculos: Vehiculo[];
  onClose: () => void;
}

export default function VehiculoCard({ cliente, vehiculos, onClose }: VehiculoCardProps) {
  // Si no hay vehículos, mostrar mensaje
  if (!vehiculos || vehiculos.length === 0) {
    return (
      <div className="vehiculo-card-modal">
        <div className="vehiculo-card-header">
          <h3>Vehículos de {cliente.nombre}</h3>
          <button className="btn-close-modal" onClick={onClose}>×</button>
        </div>
        <p className="text-muted">Este cliente no tiene vehículos registrados.</p>
      </div>
    );
  }

  return (
    <div className="vehiculo-card-modal">
      <div className="vehiculo-card-header">
        <h3><FaCar /> Vehículos de {cliente.nombre}</h3>
        <button className="btn-close-modal" onClick={onClose}>×</button>
      </div>
      <div className="vehiculo-card-grid">
        {vehiculos.map((v) => (
          <div key={v.id} className="vehiculo-card-item">
            {/* Imagen placeholder (puedes reemplazar con URL real) */}
            <div className="vehiculo-card-image">
              <FaCar className="vehiculo-icon" />
              {/* Si tuvieras URL de imagen, usarías <img src={v.imagen} alt={v.modelo} /> */}
            </div>
            <div className="vehiculo-card-info">
              <h4>{v.marca} {v.modelo}</h4>
              <p><span>Año:</span> {v.anio}</p>
              <p><span>Color:</span> {v.color}</p>
              <p><span>Placas:</span> {v.placas}</p>
              <p><span>Kilometraje:</span> {v.kilometraje.toLocaleString()} km</p>
              <p><span>VIN:</span> {v.vin || "—"}</p>
              <p><span>Motor:</span> {v.motor || "—"}</p>
              <p><span>Cilindraje:</span> {v.cilindraje || "—"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}