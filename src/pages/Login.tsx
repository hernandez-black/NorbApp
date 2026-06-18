import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from "react-icons/fa";
import "../css/Login/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);

    // --- Aquí irá la llamada a Supabase Auth cuando tengas las credenciales ---
    // const { error } = await supabase.auth.signInWithPassword({ email, password })
    // Por ahora simulamos el login:
    setTimeout(() => {
  if (form.email === "admin@norba.com" && form.password === "admin123") {
    localStorage.setItem("rol", "admin");
    navigate("/dashboard");
  } else if (form.email === "mecanico@norba.com" && form.password === "mec123") {
    localStorage.setItem("rol", "mecanico");
    navigate("/ordenes");
  } else {
    setError("Correo o contraseña incorrectos.");
  }
  setLoading(false);
}, 800);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-text">NorbApp</span>
          <p className="login-subtitulo">Sistema de Gestión de Taller</p>
        </div>

        {/* Formulario */}
        <div className="login-form">
          <div className="login-group">
            <label>Correo electrónico</label>
            <div className="login-input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>

          <div className="login-group">
            <label>Contraseña</label>
            <div className="login-input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            className="login-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </div>

        {/* Credenciales de prueba */}
        <div className="login-demo">
          <p className="demo-titulo">Credenciales de prueba</p>
          <div className="demo-creds">
            <div className="demo-item">
              <span className="demo-rol admin">Admin</span>
              <code>admin@norba.com / admin123</code>
            </div>
            <div className="demo-item">
              <span className="demo-rol mecanico">Mecánico</span>
              <code>mecanico@norba.com / mec123</code>
            </div>
          </div>
        </div>

      </div>

      {/* Fondo decorativo */}
      <div className="login-bg">
        <div className="login-bg-circle c1" />
        <div className="login-bg-circle c2" />
        <div className="login-bg-circle c3" />
      </div>
    </div>
  );
}