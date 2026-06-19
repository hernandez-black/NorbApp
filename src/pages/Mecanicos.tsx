import { useState } from 'react';
import { FaUserCog, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import type { Usuario, Rol } from '../types';
import '../css/Shared.css';

// Mock de mecánicos (puedes usar los mismos de Administracion)
const mecanicosMock: Usuario[] = [
  { id: "m1", nombre: "Juan Pérez", email: "juan@norba.com", rol: "mecanico", activo: true, creado_en: "15/01/2025" },
  { id: "m2", nombre: "Luis Torres", email: "luis@norba.com", rol: "mecanico", activo: true, creado_en: "20/01/2025" },
  { id: "m3", nombre: "Pedro Gómez", email: "pedro@norba.com", rol: "mecanico", activo: false, creado_en: "01/02/2025" },
];

const formVacio = { nombre: "", email: "", password: "" };

export default function Mecanicos() {
  const [mecanicos, setMecanicos] = useState<Usuario[]>(mecanicosMock);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(formVacio);
  const rol = localStorage.getItem("rol"); // para saber si es admin
  const esAdmin = rol === "admin";

  const handleGuardar = () => {
    if (!form.nombre.trim() || !form.email.trim()) return;
    if (editando) {
      setMecanicos(mecanicos.map((u) =>
        u.id === editando.id ? { ...u, nombre: form.nombre, email: form.email } : u
      ));
      setEditando(null);
    } else {
      setMecanicos([...mecanicos, {
        id: Date.now().toString(),
        nombre: form.nombre,
        email: form.email,
        rol: "mecanico" as Rol,
        activo: true,
        creado_en: new Date().toLocaleDateString("es-MX"),
      }]);
    }
    setForm(formVacio);
    setMostrarForm(false);
  };

  const handleEditar = (u: Usuario) => {
    setEditando(u);
    setForm({ nombre: u.nombre, email: u.email, password: "" });
    setMostrarForm(true);
  };

  const handleToggle = (id: string) => {
    setMecanicos(mecanicos.map((u) => u.id === id ? { ...u, activo: !u.activo } : u));
  };

  const handleCancelar = () => {
    setForm(formVacio);
    setEditando(null);
    setMostrarForm(false);
  };

  const handleEliminar = (id: string) => {
    if (confirm("¿Eliminar este mecánico?")) {
      setMecanicos(mecanicos.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="administracion"> {/* Reutilizamos estilos de administración */}

      <div className="admin-header">
        <div>
          <h1 className="admin-title"><FaUserCog /> Mecánicos</h1>
          <p className="admin-sub">Lista de mecánicos del taller</p>
        </div>
        {esAdmin && (
          <button className="btn-nuevo" onClick={() => setMostrarForm(true)}>
            <FaPlus /> Agregar mecánico
          </button>
        )}
      </div>

      {/* Stats rápidas */}
      <div className="admin-stats">
        <div className="admin-stat">
          <span className="stat-num">{mecanicos.length}</span>
          <span className="stat-lbl">Total mecánicos</span>
        </div>
        <div className="admin-stat">
          <span className="stat-num">{mecanicos.filter(u => u.activo).length}</span>
          <span className="stat-lbl">Activos</span>
        </div>
        <div className="admin-stat">
          <span className="stat-num">{mecanicos.filter(u => !u.activo).length}</span>
          <span className="stat-lbl">Inactivos</span>
        </div>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="form-card">
          <h2 className="form-title">{editando ? "Editar Mecánico" : "Nuevo Mecánico"}</h2>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Nombre completo *</label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Correo electrónico *</label>
              <input
                type="email"
                placeholder="Ej. juan@norba.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            {!editando && (
              <div className="form-group">
                <label>Contraseña inicial *</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}
          </div>
          <div className="form-actions">
            <button className="btn-cancelar" onClick={handleCancelar}>Cancelar</button>
            <button className="btn-guardar" onClick={handleGuardar}>
              {editando ? "Guardar cambios" : "Crear mecánico"}
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="tabla-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Registro</th>
                {esAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {mecanicos.map((u, i) => (
                <tr key={u.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td className="texto-principal">{u.nombre}</td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`badge-estado ${u.activo ? "estado-activo" : "estado-inactivo"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="text-muted">{u.creado_en}</td>
                  {esAdmin && (
                    <td>
                      <div className="acciones">
                        <button
                          className={`btn-icon ${u.activo ? "btn-toggle-on" : "btn-toggle-off"}`}
                          title={u.activo ? "Desactivar" : "Activar"}
                          onClick={() => handleToggle(u.id)}
                        >
                          {u.activo ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button className="btn-icon btn-editar" title="Editar" onClick={() => handleEditar(u)}>
                          <FaEdit />
                        </button>
                        <button className="btn-icon btn-eliminar" title="Eliminar" onClick={() => handleEliminar(u.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}