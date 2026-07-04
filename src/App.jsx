import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <p className="page-loading__text">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {user && <Navbar />}
      <main className={user ? "pt-16" : ""}>
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to={
                  user
                    ? user.role === "admin"
                      ? "/admin"
                      : "/dashboard"
                    : "/login"
                }
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
