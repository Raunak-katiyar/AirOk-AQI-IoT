import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FiLogOut,
  FiCopy,
  FiCheck,
  FiTrash2,
  FiUserPlus,
  FiUserX,
  FiEdit,
  FiSearch,
  FiShield,
} from "react-icons/fi";

function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [deviceId, setDeviceId] = useState("");
  const [location, setLocation] = useState("");
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [newToken, setNewToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "super_admin") {
      navigate("/");
      return;
    }

    Promise.all([fetchDevices(), fetchUsers()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // ================= FETCH =================

  const fetchDevices = async () => {
    try {
      const res = await API.get("/api/device/all");
      setDevices(res.data);
    } catch {
      toast.error("Failed to fetch devices");
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/api/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  // ================= DEVICE =================

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating device...");
    try {
      const res = await API.post("/api/device/create", {
        device_id: deviceId,
        location,
      });
      setNewToken(res.data.device_token);
      setDeviceId("");
      setLocation("");
      await fetchDevices();
      toast.success("Device created!", { id: toastId });
    } catch {
      toast.error("Failed to create device", { id: toastId });
    }
  };

  const handleAssignDevice = async (device_id) => {
    if (!selectedUser) return toast.error("Select user first");
    const toastId = toast.loading("Assigning...");
    try {
      await API.post("/api/device/assign", {
        device_id,
        user_id: selectedUser,
      });
      await fetchDevices();
      toast.success("Assigned!", { id: toastId });
    } catch {
      toast.error("Assign failed", { id: toastId });
    }
  };

  const handleUnassign = async (device_id) => {
    const toastId = toast.loading("Unassigning...");
    try {
      await API.post("/api/device/unassign", { device_id });
      await fetchDevices();
      toast.success("Unassigned!", { id: toastId });
    } catch {
      toast.error("Unassign failed", { id: toastId });
    }
  };

  const handleDeleteDevice = async (device_id) => {
    if (!window.confirm("Delete this device?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      await API.delete(`/api/device/${device_id}`);
      await fetchDevices();
      toast.success("Deleted!", { id: toastId });
    } catch {
      toast.error("Delete failed", { id: toastId });
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(newToken);
    setCopied(true);
    toast.success("Token copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ================= USER =================

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating user...");
    try {
      await API.post("/api/auth/register", {
        email: newEmail,
        password: newPassword,
      });
      setNewEmail("");
      setNewPassword("");
      await fetchUsers();
      toast.success("User created!", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed", {
        id: toastId,
      });
    }
  };

  const handleChangeRole = async (id, role) => {
    const toastId = toast.loading("Updating role...");
    try {
      await API.put(`/api/users/change-role/${id}`, { role });
      await fetchUsers();
      toast.success("Role updated!", { id: toastId });
    } catch {
      toast.error("Role update failed", { id: toastId });
    }
  };

  const handleDeleteUser = async (id, role) => {
    if (role === "super_admin")
      return toast.error("Cannot delete super admin");
    if (!window.confirm("Delete this user?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      await API.delete(`/api/users/${id}`);
      await fetchUsers();
      toast.success("User deleted!", { id: toastId });
    } catch {
      toast.error("Delete failed", { id: toastId });
    }
  };

  const handleChangePassword = async (id) => {
    const newPass = prompt("Enter new password:");
    if (!newPass) return;
    const toastId = toast.loading("Updating password...");
    try {
      await API.put(`/api/users/change-password/${id}`, {
        password: newPass,
      });
      toast.success("Password updated!", { id: toastId });
    } catch {
      toast.error("Update failed", { id: toastId });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const filteredDevices = devices.filter(
    (d) =>
      d.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.location &&
        d.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      <header className="bg-white shadow border-b px-6 py-4 flex justify-between">
        <h1 className="text-xl font-bold">Super Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          <FiLogOut className="inline mr-2" />
          Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">

        {/* CREATE DEVICE */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-4 flex items-center">
            <FiEdit className="mr-2" /> Create Device
          </h2>
          <form onSubmit={handleCreateDevice} className="flex gap-4">
            <input
              type="text"
              placeholder="Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              required
              className="border px-3 py-2 rounded w-1/3"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="border px-3 py-2 rounded w-1/3"
            />
            <button className="bg-blue-600 text-white px-6 rounded">
              Create
            </button>
          </form>

          {newToken && (
            <div className="mt-4 bg-green-50 p-4 rounded">
              <div className="flex justify-between">
                <span className="font-medium">
                  Device Token (Save Securely)
                </span>
                <button
                  onClick={handleCopyToken}
                  className="text-green-700"
                >
                  {copied ? <FiCheck /> : <FiCopy />}
                </button>
              </div>
              <div className="mt-2 font-mono text-sm break-all">
                {newToken}
              </div>
            </div>
          )}
        </section>

        {/* DEVICE TABLE */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-4">Device Management</h2>

          <div className="flex gap-4 mb-4">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search Device"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-3 py-2 rounded flex-1"
            />
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500">
                <th>Device</th>
                <th>Location</th>
                <th>Assigned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((d) => (
                <tr key={d.device_id} className="border-t">
                  <td className="py-2">{d.device_id}</td>
                  <td>{d.location}</td>
                  <td>{d.assigned_to || "Not Assigned"}</td>
                  <td className="space-x-2">
                    <button
                      onClick={() => handleAssignDevice(d.device_id)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => handleUnassign(d.device_id)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Unassign
                    </button>
                    <button
                      onClick={() => handleDeleteDevice(d.device_id)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* USER MANAGEMENT */}
        <section className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-4 flex items-center">
            <FiShield className="mr-2" /> User Management
          </h2>

          <form onSubmit={handleCreateUser} className="flex gap-4 mb-6">
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="border px-3 py-2 rounded w-1/3"
            />
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="border px-3 py-2 rounded w-1/3"
            />
            <button className="bg-indigo-600 text-white px-6 rounded">
              Create
            </button>
          </form>

          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500">
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-2">{u.email}</td>
                  <td>{u.role}</td>
                  <td className="space-x-2">
                    {u.role !== "super_admin" && (
                      <>
                        <button
                          onClick={() =>
                            handleChangeRole(
                              u.id,
                              u.role === "admin" ? "user" : "admin"
                            )
                          }
                          className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Toggle Role
                        </button>
                        <button
                          onClick={() => handleChangePassword(u.id)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Password
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.role)}
                          className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}

export default SuperAdminDashboard;