import React from 'react'

function StatusBadge({status}) {
  return (
    <span style={{
        padding: "5px 10px",
        borderRadius: "6px",
        backgroundColor: status === "online" ? "green" : "red",
        color: "white",
        fontSize: "12px"
    }}>
      {status}
    </span>
  )
}

export default StatusBadge
