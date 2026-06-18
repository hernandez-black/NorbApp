import "../../css/Navbar/Navbar.css";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="navbar">
      <button type="button" className="navbar-brand" onClick={onMenuClick}>
        <span className="navbar-burger">☰</span>
        <span>NorbApp</span>
      </button>

      <h3>Sistema de Gestión de Taller</h3>
    </header>
  );
}