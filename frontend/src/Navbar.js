import { Link, useLocation } from "react-router-dom";

const Navbar = ({ userName, onLogout }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-logo">Timetable Manager</div>

      <div className="navbar-buttons">
        <Link
          to="/session"
          className={`navbar-button ${isActive("/session") ? "active" : ""}`}
        >
          Session
        </Link>
        <Link
          to="/Timetable"
          className={`navbar-button ${isActive("/Timetable") ? "active" : ""}`}
        >
          Timetable
        </Link>
        <Link
          to="/subject"
          className={`navbar-button ${isActive("/subject") ? "active" : ""}`}
        >
          Subjects
        </Link>
      </div>

      <div className="navbar-user">
        <span className="username">Hello, {userName}</span>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
