import { Link } from "react-router-dom";
import {
  FaCarAlt,
  FaClipboardCheck,
  FaTools,
  FaCamera,
  FaFileInvoiceDollar,
  FaUserShield,
} from "react-icons/fa";
import "../css/Home.css";

const features = [
  {
    icon: <FaCarAlt />,
    titulo: "Recepción de vehículos",
    desc: "Registra clientes, vehículos y captura el estado físico con fotografías al momento del ingreso.",
  },
  {
    icon: <FaClipboardCheck />,
    titulo: "Órdenes de servicio",
    desc: "Genera órdenes automáticamente y da seguimiento a cada etapa: diagnóstico, reparación y entrega.",
  },
  {
    icon: <FaTools />,
    titulo: "Gestión de refacciones",
    desc: "Controla el inventario de piezas, proveedores, costos y tiempos de llegada en tiempo real.",
  },
  {
    icon: <FaCamera />,
    titulo: "Evidencias fotográficas",
    desc: "Documenta cada etapa del proceso con fotografías: recepción, diagnóstico, reparación y entrega.",
  },
  {
    icon: <FaFileInvoiceDollar />,
    titulo: "Cotizaciones y pagos",
    desc: "Genera cotizaciones, registra anticipos y controla el saldo restante de cada servicio.",
  },
  {
    icon: <FaUserShield />,
    titulo: "Control de acceso por roles",
    desc: "Administradores y mecánicos con permisos diferenciados para mantener la información segura.",
  },
];

export default function Home() {
  return (
    <div className="home">

      {/* Navbar simple */}
      <header className="home-header">
        <span className="home-logo">NorbApp</span>
        <Link to="/login" className="home-btn-login">
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <section className="home-hero">
        <div className="hero-content">
          <span className="hero-badge">Sistema de gestión automotriz</span>
          <h1 className="hero-titulo">
            Administra tu taller <br />
            <span className="hero-titulo-acento">de forma inteligente</span>
          </h1>
          <p className="hero-desc">
            NorbApp centraliza todo el proceso de tu taller: desde la recepción
            del vehículo hasta su entrega, con trazabilidad completa en cada etapa.
          </p>
          <Link to="/login" className="hero-cta">
            Comenzar ahora
          </Link>
        </div>

        {/* Card decorativa */}
        <div className="hero-card-demo">
          <div className="demo-orden">
            <div className="demo-orden-header">
              <span className="demo-id">ORD-024</span>
              <span className="demo-badge-estado">En reparación</span>
            </div>
            <div className="demo-orden-info">
              <p><span>Cliente</span> Carlos Ramírez</p>
              <p><span>Vehículo</span> Toyota Corolla 2020</p>
              <p><span>Mecánico</span> Juan Pérez</p>
              <p><span>Ingreso</span> 08/06/2025</p>
            </div>
            <div className="demo-progreso">
              <div className="demo-paso completado">Ingresado</div>
              <div className="demo-paso completado">Diagnosticado</div>
              <div className="demo-paso activo">Autorizado</div>
              <div className="demo-paso">Terminado</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <h2 className="features-titulo">Todo lo que necesita tu taller</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.titulo}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="home-cta-final">
        <h2>¿Listo para digitalizar tu taller?</h2>
        <p>Accede al sistema y empieza a gestionar tus órdenes hoy mismo.</p>
        <Link to="/login" className="hero-cta">
          Iniciar sesión
        </Link>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>© 2025 NorbApp — Grupo Norba & RSA</p>
        <p className="footer-note">Sistema de Gestión de Taller Automotriz</p>
      </footer>

    </div>
  );
}