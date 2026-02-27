import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import DeviceDetails from "./pages/DeviceDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  

  // Auto redirect logic for "/"
  const getHomeRoute = () => {
    if (!token) return "/login";
    if (role === "user") return "/dashboard";
    if (role === "admin") return "/admin";
    if (role === "super_admin") return "/super-admin";
    return "/login";
  };

  return (
    <Routes>

      {/* Root Auto Redirect */}
      <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["user"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Dashboard */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Device Details */}
      <Route
        path="/device/:deviceId"
        element={
          <ProtectedRoute allowedRoles={["user", "admin", "super_admin"]}>
            <DeviceDetails />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;