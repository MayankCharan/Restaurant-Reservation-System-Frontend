import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link
          to={user?.role === "admin" ? "/admin" : "/dashboard"}
          className="navbar__brand"
        >
          Table Reserve
        </Link>

        <div className="navbar__nav">
          {user?.role === "admin" ? (
            <span className="badge badge--admin">Admin Panel</span>
          ) : (
            <Link to="/dashboard" className="navbar__link">
              My Reservations
            </Link>
          )}
        </div>

        <div className="navbar__user">
          <div className="navbar__user-info">
            <p className="navbar__user-name">{user?.name}</p>
            <p className="navbar__user-role">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
