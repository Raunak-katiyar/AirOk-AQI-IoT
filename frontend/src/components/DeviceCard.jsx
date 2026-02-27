import React from "react";

function DeviceCard({ device, onOpen }) {
  return (
    <div
      onClick={() => onOpen(device.device_id)}
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        marginBottom: "10px",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      <h3>{device.device_id}</h3>
      <p>Location: {device.location}</p>
    </div>
  );
}

export default DeviceCard;