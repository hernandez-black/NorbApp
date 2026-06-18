import { useState } from "react";
import { FaCar, FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import type { Vehiculo } from "../types";
import "../css/Shared.css";

const vehiculosIniciales: Vehiculo[] = [
  { id: "1", cliente_id: "1", marca: "Toyota",     modelo: "Corolla", anio: 2020, color: "Blanco", placas: "ABC-123", kilometraje: 45000, vin: "1HGBH41JXMN109186", motor: "2.0L", cilindraje: "4 cilindros", creado_en: "08/06/2025" },
  { id: "2", cliente_id: "2", marca: "Nissan",     modelo: "Sentra",  anio: 2018, color: "Gris",   placas: "DEF-456", kilometraje: 72000, vin: "3N1AB7AP0JY123456", motor: "1.8L", cilindraje: "4 cilindros", creado_en: "07/06/2025" },
  { id: "3", cliente_id: "3", marca: "Chevrolet",  modelo: "Aveo",    anio: 2019, color: "Rojo",   placas: "GHI-789", kilometraje: 38000, motor: "1.6L", cilindraje: "4 cilindros", creado_en: "06/06/2025" },
  { id: "4", cliente_id: "4", marca: "Volkswagen", modelo: "Jetta",   anio: 2021, color: "Negro",  placas: "JKL-012", kilometraje: 21000, vin: "3VW2B7AJ0MM123789", motor: "1.4T", cilindraje: "4 cilindros", creado_en: "05/06/2025" },
];

const formVacio = {
  cliente_id: "", marca: "", modelo: "", anio: new Date().getFullYear(),
  color: "", placas: "", kilometraje: 0, vin: "", motor: "", cilindraje: "",
};

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(vehiculosIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Vehiculo | null>(null);
  const [form, setForm] = useState(formVacio);

  const filtrados = vehiculos.filter((v) =>
    [v.marca, v.modelo, v.placas, v.color, v.vin ?? ""]
      .join(" ").toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleGuardar = () => {
    if (!form.marca.trim() || !form.modelo.trim() || !form.placas.trim()) return;
    if (editando) {
      setVehiculos(vehiculos.map((v) => v.id === editando.id ? { ...v, ...form } : v));
      setEditando(null);
    } else {
      setVehiculos([...vehiculos, { id: Date.now().toString(), ...form, creado_en: new Date().toLocaleDateString("es-MX") }]);
    }
    setForm(formVacio);
    setMostrarForm(false);
  };

  const handleEditar = (v: Vehiculo) => {
    setEditando(v);
    setForm({
      cliente_id: v.cliente_id, marca: v.marca, modelo: v.modelo, anio: v.anio,
      color: v.color, placas: v.placas, kilometraje: v.kilometraje,
      vin: v.vin ?? "", motor: v.motor ?? "", cilindraje: v.cilindraje ?? "",
    });
    setMostrarForm(true);
  };

  const handleCancelar = () => {
    setForm(formVacio);
    setEditando(null);
    setMostrarForm(false);
  };

  return (
    <div className="vehiculos">

      <div className="vehiculos-header">
        <div>
          <h1 className="vehiculos-title"><FaCar /> Vehículos</h1>
          <p className="vehiculos-sub">{filtrados.length} vehículo(s) registrado(s)</p>
        </div>
        <button className="btn-nuevo" onClick={() => setMostrarForm(true)}>
          <FaPlus /> Nuevo Vehículo
        </button>
      </div>

      {mostrarForm && (
        <div className="form-card">
          <h2 className="form-title">{editando ? "Editar Vehículo" : "Nuevo Vehículo"}</h2>
          <div className="form-grid-3">
            <div className="form-group">
              <label>Marca *</label>
              <input type="text" placeholder="Ej. Toyota"
                value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Modelo *</label>
              <input type="text" placeholder="Ej. Corolla"
                value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Año</label>
              <input type="number" min={1990} max={new Date().getFullYear() + 1}
                value={form.anio} onChange={(e) => setForm({ ...form, anio: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input type="text" placeholder="Ej. Blanco"
                value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Placas *</label>
              <input type="text" placeholder="Ej. ABC-123"
                value={form.placas} onChange={(e) => setForm({ ...form, placas: e.target.value.toUpperCase() })} />
            </div>
            <div className="form-group">
              <label>Kilometraje</label>
              <input type="number" min={0} placeholder="Ej. 45000"
                value={form.kilometraje} onChange={(e) => setForm({ ...form, kilometraje: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>VIN / No. Serie</label>
              <input type="text" placeholder="Ej. 1HGBH41JXMN109186"
                value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })} />
            </div>
            <div className="form-group">
              <label>Motor</label>
              <input type="text" placeholder="Ej. 2.0L"
                value={form.motor} onChange={(e) => setForm({ ...form, motor: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Cilindraje</label>
              <input type="text" placeholder="Ej. 4 cilindros"
                value={form.cilindraje} onChange={(e) => setForm({ ...form, cilindraje: e.target.value })} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-cancelar" onClick={handleCancelar}>Cancelar</button>
            <button className="btn-guardar" onClick={handleGuardar}>
              {editando ? "Guardar cambios" : "Registrar"}
            </button>
          </div>
        </div>
      )}

      <div className="search-box">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Buscar por marca, modelo, placas o VIN..."
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      <div className="tabla-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Marca / Modelo</th>
                <th>Año</th>
                <th>Color</th>
                <th>Placas</th>
                <th>Kilometraje</th>
                <th>VIN</th>
                <th>Motor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? filtrados.map((v, i) => (
                <tr key={v.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td className="texto-principal">{v.marca} {v.modelo}</td>
                  <td className="text-muted">{v.anio}</td>
                  <td>
                    <div className="color-cell">
                      <span className="color-dot" style={{ background: v.color.toLowerCase() }} />
                      <span className="text-muted">{v.color}</span>
                    </div>
                  </td>
                  <td className="mono placas">{v.placas}</td>
                  <td className="text-muted">{v.kilometraje.toLocaleString()} km</td>
                  <td className="mono text-muted">{v.vin || "—"}</td>
                  <td className="text-muted">{v.motor || "—"}</td>
                  <td>
                    <div className="acciones">
                      <button className="btn-icon btn-editar" title="Editar" onClick={() => handleEditar(v)}><FaEdit /></button>
                      <button className="btn-icon btn-eliminar" title="Eliminar" onClick={() => setVehiculos(vehiculos.filter((x) => x.id !== v.id))}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="tabla-vacia">No se encontraron vehículos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}