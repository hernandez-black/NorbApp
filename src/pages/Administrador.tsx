import { useState } from "react";
import { FaUserShield, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import type { Usuario, Rol } from "../types";
import { useToast } from '../context/useToast';
import ConfirmModal from '../components/ui/ConfirmModal';
import "../css/Shared.css";

const usuariosIniciales: Usuario[] = [
  { id: "1", nombre: "Admin Principal", email: "admin@norba.com",      rol: "admin",    activo: true,  creado_en: "01/01/2025" },
  { id: "2", nombre: "Juan Pérez",      email: "juan@norba.com",       rol: "mecanico", activo: true,  creado_en: "15/01/2025" },
  { id: "3", nombre: "Luis Torres",     email: "luis@norba.com",       rol: "mecanico", activo: true,  creado_en: "20/01/2025" },
  { id: "4", nombre: "Pedro Gómez",     email: "pedro@norba.com",      rol: "mecanico", activo: false, creado_en: "01/02/2025" },
];

const formVacio = { nombre: "", email: "", rol: "mecanico" as Rol, password: "" };

export default function Administracion() {
  const { showToast, toasts, removeToast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(formVacio);
  const [filtroRol, setFiltroRol] = useState<string>('Todos');

  // Estado del modal de confirmación
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

  const usuariosFiltrados = usuarios.filter(u => {
    if (filtroRol === 'Todos') return true;
    return u.rol === filtroRol;
  });

  const handleGuardar = () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      showToast("Nombre y correo son obligatorios", "error");
      return;
    }
    if (editando) {
      setUsuarios(usuarios.map((u) =>
        u.id === editando.id ? { ...u, nombre: form.nombre, email: form.email, rol: form.rol } : u
      ));
      setEditando(null);
      showToast("Usuario actualizado correctamente", "success");
    } else {
      setUsuarios([...usuarios, {
        id: Date.now().toString(), nombre: form.nombre, email: form.email,
        rol: form.rol, activo: true, creado_en: new Date().toLocaleDateString("es-MX"),
      }]);
      showToast("Usuario creado correctamente", "success");
    }
    setForm(formVacio);
    setMostrarForm(false);
  };

  const handleEditar = (u: Usuario) => {
    setEditando(u);
    setForm({ nombre: u.nombre, email: u.email, rol: u.rol, password: "" });
    setMostrarForm(true);
  };

  const handleToggle = (id: string, nombre: string) => {
    setUsuarios(usuarios.map((u) => u.id === id ? { ...u, activo: !u.activo } : u));
    const estado = !usuarios.find(u => u.id === id)?.activo;
    showToast(`Usuario ${nombre} ${estado ? 'activado' : 'desactivado'}`, 'info');
  };

  const handleEliminar = (id: string, nombre: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Eliminar usuario',
      message: `¿Estás seguro de eliminar al usuario ${nombre}? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: () => {
        setUsuarios(usuarios.filter((x) => x.id !== id));
        showToast(`Usuario ${nombre} eliminado`, 'info');
      },
    });
  };

  const handleCancelar = () => {
    setForm(formVacio);
    setEditando(null);
    setMostrarForm(false);
  };

  const admins    = usuarios.filter((u) => u.rol === "admin");
  const mecanicos = usuarios.filter((u) => u.rol === "mecanico");

  return (
    <>
      <div className="administracion">
        <div className="admin-header">
          <div>
            <h1 className="admin-title"><FaUserShield /> Administración</h1>
            <p className="admin-sub">Gestión de usuarios y roles del sistema</p>
          </div>
          <button className="btn-nuevo" onClick={() => setMostrarForm(true)}>
            <FaPlus /> Nuevo Usuario
          </button>
        </div>

        <div className="admin-stats">
          <div className="admin-stat">
            <span className="stat-num">{usuarios.length}</span>
            <span className="stat-lbl">Total usuarios</span>
          </div>
          <div className="admin-stat">
            <span className="stat-num">{admins.length}</span>
            <span className="stat-lbl">Administradores</span>
          </div>
          <div className="admin-stat">
            <span className="stat-num">{mecanicos.length}</span>
            <span className="stat-lbl">Mecánicos</span>
          </div>
          <div className="admin-stat">
            <span className="stat-num">{usuarios.filter((u) => u.activo).length}</span>
            <span className="stat-lbl">Activos</span>
          </div>
        </div>

        <div className="filtro-btns" style={{ marginBottom: '1rem' }}>
          {['Todos', 'admin', 'mecanico'].map((rol) => (
            <button
              key={rol}
              className={`filtro-btn ${filtroRol === rol ? 'filtro-activo' : ''}`}
              onClick={() => setFiltroRol(rol)}
            >
              {rol === 'Todos' ? 'Todos' : rol === 'admin' ? 'Administradores' : 'Mecánicos'}
            </button>
          ))}
        </div>

        {mostrarForm && (
          <div className="form-card">
            <h2 className="form-title">{editando ? "Editar Usuario" : "Nuevo Usuario"}</h2>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Nombre completo *</label>
                <input type="text" placeholder="Ej. Juan Pérez"
                  value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Correo electrónico *</label>
                <input type="email" placeholder="Ej. juan@norba.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as Rol })}>
                  <option value="admin">Administrador</option>
                  <option value="mecanico">Mecánico</option>
                </select>
              </div>
              {!editando && (
                <div className="form-group">
                  <label>Contraseña inicial *</label>
                  <input type="password" placeholder="Mínimo 6 caracteres"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              )}
            </div>
            <div className="form-actions">
              <button className="btn-cancelar" onClick={handleCancelar}>Cancelar</button>
              <button className="btn-guardar" onClick={handleGuardar}>
                {editando ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </div>
        )}

        <div className="tabla-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u, i) => (
                  <tr key={u.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td className="texto-principal">{u.nombre}</td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <span className={`badge-rol ${u.rol === "admin" ? "rol-admin" : "rol-mecanico"}`}>
                        {u.rol === "admin" ? "Administrador" : "Mecánico"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-estado ${u.activo ? "estado-activo" : "estado-inactivo"}`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="text-muted">{u.creado_en}</td>
                    <td>
                      <div className="acciones">
                        <button
                          className={`btn-icon ${u.activo ? "btn-toggle-on" : "btn-toggle-off"}`}
                          title={u.activo ? "Desactivar" : "Activar"}
                          onClick={() => handleToggle(u.id, u.nombre)}
                        >
                          {u.activo ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button className="btn-icon btn-editar" title="Editar" onClick={() => handleEditar(u)}>
                          <FaEdit />
                        </button>
                        <button className="btn-icon btn-eliminar" title="Eliminar" onClick={() => handleEliminar(u.id, u.nombre)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type || 'danger'}
      />

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
    </>
  );
}