import { useState } from "react";
import { FaUsers, FaPlus, FaSearch, FaEdit, FaTrash, FaHistory } from "react-icons/fa";
import type { Cliente } from "../types";
import "../css/Shared.css";

const clientesIniciales: Cliente[] = [
  { id: "1", nombre: "Carlos Ramírez",  telefono: "555-123-4567", correo: "carlos@mail.com",  tipo: "particular", creado_en: "01/01/2025" },
  { id: "2", nombre: "María López",     telefono: "555-234-5678", correo: "maria@mail.com",   tipo: "particular", creado_en: "15/02/2025" },
  { id: "3", nombre: "Transportes RSA", telefono: "555-345-6789", correo: "rsa@empresa.com",  tipo: "empresa", razon_social: "Transportes RSA S.A. de C.V.", rfc: "TRS123456ABC", creado_en: "10/03/2025" },
  { id: "4", nombre: "Ana Martínez",    telefono: "555-456-7890", correo: "ana@mail.com",     tipo: "particular", creado_en: "22/04/2025" },
  { id: "5", nombre: "Jorge Hernández", telefono: "555-567-8901", correo: "jorge@mail.com",   tipo: "particular", creado_en: "05/05/2025" },
];

const formVacio = {
  nombre: "", telefono: "", correo: "",
  tipo: "particular" as Cliente["tipo"],
  razon_social: "", rfc: "",
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState(formVacio);

  const filtrados = clientes.filter((c) => {
    const coincide = [c.nombre, c.telefono, c.correo ?? ""]
      .join(" ").toLowerCase().includes(busqueda.toLowerCase());
    const tipo = filtroTipo === "Todos" || c.tipo === filtroTipo;
    return coincide && tipo;
  });

  const handleGuardar = () => {
    if (!form.nombre.trim() || !form.telefono.trim()) return;
    if (editando) {
      setClientes(clientes.map((c) =>
        c.id === editando.id ? { ...c, ...form } : c
      ));
      setEditando(null);
    } else {
      setClientes([...clientes, {
        id: Date.now().toString(), ...form, creado_en: new Date().toLocaleDateString("es-MX"),
      }]);
    }
    setForm(formVacio);
    setMostrarForm(false);
  };

  const handleEditar = (c: Cliente) => {
    setEditando(c);
    setForm({
      nombre: c.nombre, telefono: c.telefono, correo: c.correo ?? "",
      tipo: c.tipo, razon_social: c.razon_social ?? "", rfc: c.rfc ?? "",
    });
    setMostrarForm(true);
  };

  const handleEliminar = (id: string) => {
    setClientes(clientes.filter((c) => c.id !== id));
  };

  const handleCancelar = () => {
    setForm(formVacio);
    setEditando(null);
    setMostrarForm(false);
  };

  return (
    <div className="clientes">

      <div className="clientes-header">
        <div>
          <h1 className="clientes-title"><FaUsers /> Clientes</h1>
          <p className="clientes-sub">{filtrados.length} cliente(s) registrado(s)</p>
        </div>
        <button className="btn-nuevo" onClick={() => setMostrarForm(true)}>
          <FaPlus /> Nuevo Cliente
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="form-card">
          <h2 className="form-title">{editando ? "Editar Cliente" : "Nuevo Cliente"}</h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Nombre completo *</label>
              <input type="text" placeholder="Ej. Carlos Ramírez"
                value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Teléfono *</label>
              <input type="tel" placeholder="Ej. 555-123-4567"
                value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" placeholder="Ej. correo@ejemplo.com"
                value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Tipo de cliente</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Cliente["tipo"] })}>
                <option value="particular">Particular</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>
            {form.tipo === "empresa" && (
              <>
                <div className="form-group">
                  <label>Razón social</label>
                  <input type="text" placeholder="Ej. Transportes RSA S.A. de C.V."
                    value={form.razon_social} onChange={(e) => setForm({ ...form, razon_social: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>RFC</label>
                  <input type="text" placeholder="Ej. TRS123456ABC"
                    value={form.rfc} onChange={(e) => setForm({ ...form, rfc: e.target.value.toUpperCase() })} />
                </div>
              </>
            )}
          </div>
          <div className="form-actions">
            <button className="btn-cancelar" onClick={handleCancelar}>Cancelar</button>
            <button className="btn-guardar" onClick={handleGuardar}>
              {editando ? "Guardar cambios" : "Registrar"}
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-row">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Buscar por nombre, teléfono o correo..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="filtro-btns">
          {["Todos", "particular", "empresa"].map((t) => (
            <button key={t}
              className={`filtro-btn ${filtroTipo === t ? "filtro-activo" : ""}`}
              onClick={() => setFiltroTipo(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Tipo</th>
                <th>RFC</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? filtrados.map((c, i) => (
                <tr key={c.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td className="texto-principal">{c.nombre}</td>
                  <td className="text-muted">{c.telefono}</td>
                  <td className="text-muted">{c.correo || "—"}</td>
                  <td>
                    <span className={`badge-tipo ${c.tipo === "empresa" ? "tipo-empresa" : "tipo-particular"}`}>
                      {c.tipo}
                    </span>
                  </td>
                  <td className="mono text-muted">{c.rfc || "—"}</td>
                  <td className="text-muted">{c.creado_en}</td>
                  <td>
                    <div className="acciones">
                      <button className="btn-icon btn-historial" title="Ver historial"><FaHistory /></button>
                      <button className="btn-icon btn-editar" title="Editar" onClick={() => handleEditar(c)}><FaEdit /></button>
                      <button className="btn-icon btn-eliminar" title="Eliminar" onClick={() => handleEliminar(c.id)}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="tabla-vacia">No se encontraron clientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}