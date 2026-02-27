import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchDevices();
  }, []);

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.clear(); // token + role remove
    navigate("/");        // redirect to login page
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await API.get("/api/device/all");
      setDevices(res.data);
    } catch (err) {
      console.error("Device fetch error:", err);
    }
  };

  const assignDevice = async (deviceId) => {
    if (!selectedUser) {
      alert("Select a user first");
      return;
    }

    try {
      setLoading(true);
      await API.post("/api/device/assign", {
        user_id: selectedUser,
        device_id: deviceId,
      });

      alert("Device Assigned Successfully");
      fetchDevices();
    } catch (err) {
      console.error("Assign error:", err);
      alert("Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const unassignDevice = async (deviceId, userId) => {
    try {
      await API.post("/api/device/unassign", {
        device_id: deviceId,
        user_id: userId,
      });

      alert("User removed from device");
      fetchDevices();
    } catch (err) {
      alert("Unassign failed");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      
      {/* Header with Logout */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Admin Device Management</h2>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "black",
            color: "white",
            border: "none",
            padding: "8px 14px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* User Select */}
      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>

      {/* Device List */}
      {devices.length === 0 ? (
        <p>No devices available</p>
      ) : (
        devices.map((device) => (
          <div
            key={device.device_id}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "6px",
            }}
          >
            <h4>{device.device_id}</h4>
            <p>Location: {device.location}</p>

            <p>
              Assigned Users:{" "}
              {device.assigned_to ? device.assigned_to : "None"}
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => assignDevice(device.device_id)}
                disabled={loading}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Assign
              </button>

              {device.assigned_to &&
                device.assigned_to.split(",").map((email) => {
                  const user = users.find((u) => u.email === email);
                  return (
                    user && (
                      <button
                        key={user.id}
                        onClick={() =>
                          unassignDevice(device.device_id, user.id)
                        }
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          cursor: "pointer",
                        }}
                      >
                        Remove {email}
                      </button>
                    )
                  );
                })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;