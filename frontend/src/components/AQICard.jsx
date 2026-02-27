import React from 'react'
import "../styles/AQICard.css";

function AQICard({data}) {
    if(!data) return null;

    const getAQIClass = (aqi) =>{
        if(aqi <= 50) return "good";
        if(aqi <= 100) return "moderate";
        if(aqi <= 150) return "unhealthy";
        return "hazardous";
    };

  return (
    <div className={`aqi-card ${getAQIClass(data.aqi)}`}>
      <h2>Latest AQI</h2>
      <h1>{data.aqi}</h1>

      <p><strong>Category:</strong>{data.category}</p>
      <p><strong>PM2.5:</strong>{data.pm25}</p>
      <p>
      <strong>Status:</strong>{" "}
      <span className={data.status === "online" ? "online" : "offline"}>{data.status}</span>
      </p>
      <p>
        <strong>Last Updated:</strong>{" "}
        {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
}

export default AQICard
