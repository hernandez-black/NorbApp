import { Link } from "react-router-dom";
import "../../css/Sindebar/Sindebar.css";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const handleClose = () => onClose?.();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-mobile-top">
        <Link to="/" className="sidebar-logo" onClick={handleClose}>
          NorbApp
        </Link>
        <button type="button" className="sidebar-close" onClick={handleClose}>
          ×
        </button>
      </div>

      <nav>
        <ul className="sidebar-menu">
          <li><Link to="/" onClick={handleClose}>Inicio</Link></li>
          <li><Link to="/vehiculos" onClick={handleClose}>Vehículos</Link></li>
          <li><Link to="/clientes" onClick={handleClose}>Clientes</Link></li>
          <li><Link to="/ordenes" onClick={handleClose}>Órdenes</Link></li>
          <li><Link to="/administracion" onClick={handleClose}>Administración</Link></li>
        </ul>
      </nav>
    </aside>
  );
}