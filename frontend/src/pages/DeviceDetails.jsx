import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import AQIChart from "../components/AQIChart";
import { FiRefreshCw, FiClock } from "react-icons/fi";

import { FaSmog } from "react-icons/fa";
import { TbCategory } from "react-icons/tb";
import { MdSensors } from "react-icons/md";

function DeviceDetails() {
  const { deviceId } = useParams();

  const [aqiData, setAqiData] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [range, setRange] = useState("24h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const getAQIBackground = (aqi) => {
    if (aqi <= 50) return "from-green-50 to-white";
    if (aqi <= 100) return "from-yellow-50 to-white";
    if (aqi <= 200) return "from-orange-50 to-white";
    if (aqi <= 300) return "from-red-50 to-white";
    if (aqi <= 400) return "from-purple-50 to-white";
    return "from-rose-100 to-white";
  };

  const fetchAQI = async () => {
    try {
      const res = await API.get(
        `/api/device/latest/${deviceId}?t=${Date.now()}`
      );
      setAqiData(res.data);
    } catch (err) {
  if (err.response && err.response.status === 404) {
    setAqiData(null); // no data yet
  } else {
    setError("Failed to fetch AQI data");
  }
}
  };

  const fetchGraph = async () => {
    try {
      const res = await API.get(
  `/api/device/graph/${deviceId}?range=${range}&t=${Date.now()}`
);
      setGraphData(res.data);
    } catch (err) {
      setError("Failed to fetch graph data");
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    await Promise.all([fetchAQI(), fetchGraph()]);
    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [deviceId, range]);

  const getStatusConfig = (status) => {
    const configs = {
      online: { text: "text-green-700", dot: "bg-green-500" },
      offline: { text: "text-red-700", dot: "bg-red-500" },
      warning: { text: "text-yellow-700", dot: "bg-yellow-500" },
    };
    return configs[status] || configs.offline;
  };

  const getMarkerPosition = (aqi) => {
    const maxAQI = 500;
    const percentage = Math.min((aqi / maxAQI) * 100, 100);
    return `${percentage}%`;
  };

  const handleRefresh = () => loadData();

  return (
    <div className="min-h-screen bg-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-light text-gray-800 mb-4 sm:mb-0">
            Device{" "}
            <span className="font-semibold text-blue-600">{deviceId}</span>
          </h1>

          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <div className="flex items-center text-sm text-gray-500">
                <FiClock className="mr-1" />
                Last update: {lastUpdated}
              </div>
            )}

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition disabled:opacity-50"
            >
              <FiRefreshCw
                className={`mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        {loading && !aqiData ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* ================= LIVE AQI ================= */}
            {aqiData && (
              <div
                className={`rounded-2xl shadow-xl p-6 mb-8 transition-all duration-500 bg-linear-to-b ${
                  aqiData.aqi <= 50
                    ? "from-green-100 to-white"
                    : aqiData.aqi <= 100
                      ? "from-yellow-100 to-white"
                      : aqiData.aqi <= 200
                        ? "from-orange-100 to-white"
                        : aqiData.aqi <= 300
                          ? "from-red-100 to-white"
                          : aqiData.aqi <= 400
                            ? "from-purple-100 to-white"
                            : "from-rose-200 to-white"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="relative flex h-3 w-3">
                    {aqiData.status === "online" ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    )}
                  </span>

                  <h2
                    className={`text-lg font-semibold ${
                      aqiData.status === "online"
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {aqiData.status === "online"
                      ? "Live AQI"
                      : "Device Offline"}
                  </h2>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  {/* AQI Number */}
                  <div className="flex-1">
                    <div
                      className={`text-7xl font-bold ${
                        aqiData.status === "offline"
                          ? "text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {aqiData.aqi ?? "--"}
                    </div>
                    <div className="text-xl text-gray-600 mt-2">
                      Air Quality is{" "}
                      <span className="font-semibold">
                        {aqiData.category ?? "--"}
                      </span>
                    </div>
                  </div>

                  {/* AQI Scale */}
                  <div className="flex-1">
                    {/* Category Labels */}
                    <div className="flex justify-between text-xs font-medium mb-1 tracking-wide">
                      <span className="text-green-600">Good</span>
                      <span className="text-yellow-600">Moderate</span>
                      <span className="text-orange-600">Poor</span>
                      <span className="text-red-600">Unhealthy</span>
                      <span className="text-purple-800">Severe</span>
                      <span className="text-red-900">Hazardous</span>
                    </div>

                    {/* Gradient Bar */}
                    <div className="relative h-3 w-full bg-[linear-gradient(to_right,#22c55e,#eab308,#f97316,#ef4444,#6b21a5)] rounded-full overflow-hidden">
                      <div
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
                        style={{ left: getMarkerPosition(aqiData.aqi) }}
                      >
                        <span className="relative flex h-4 w-4">
                          {/* <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-50"></span> */}
                          <span className=" absolute inline-flex h-full w-full rounded-full bg-black opacity-50"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-4 border-black"></span>
                        </span>
                      </div>
                    </div>

                    {/* Numeric Scale */}
                    <div className="flex justify-between text-xs text-gray-700 mt-1">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                      <span>150</span>
                      <span>200</span>
                      <span>300</span>
                      <span>301+</span>
                    </div>
                  </div>
                </div>

                {/* ================= Bottom Metrics ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
                  {/* PM2.5 Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-5 border border-gray-200 hover:shadow-lg transition">
                    <div className="bg-gray-100 p-4 rounded-xl text-gray-700 text-3xl">
                      <FaSmog />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">
                        PM2.5
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {aqiData.status === "offline" ? "--" : aqiData.pm25}
                        <span className="text-sm text-gray-400 ml-1">
                          µg/m³
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Category Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-5 border border-gray-200 hover:shadow-lg transition">
                    <div className="bg-gray-100 p-4 rounded-xl text-gray-700 text-3xl">
                      <TbCategory />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">
                        Category
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {aqiData.status === "offline" ? "--" : aqiData.category}
                      </p>
                    </div>
                  </div>

                  {/* Status Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-5 border border-gray-200 hover:shadow-lg transition">
                    <div className="bg-gray-100 p-4 rounded-xl text-gray-700 text-3xl">
                      <MdSensors />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">
                        Device Status
                      </p>

                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            aqiData.status === "online"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></span>

                        <p
                          className={`text-2xl font-bold ${
                            aqiData.status === "online"
                              ? "text-green-700"
                              : "text-red-600"
                          }`}
                        >
                          {aqiData.status?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

{/* ================= GRAPH ================= */}
<div className="bg-white rounded-2xl shadow-xl p-6">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
      Historical Air Quality Data
    </h2>

    <select
      value={range}
      onChange={(e) => setRange(e.target.value)}
      className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="12h">Last 12 hours</option>
      <option value="24h">Last 24 hours</option>
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
    </select>
  </div>

  {graphData.length === 0 ? (
    <div className="text-center py-16 text-gray-400">
      No historical data available for this period.
    </div>
  ) : (
    <AQIChart data={graphData} range={range} />
  )}
</div>
          </>
        )}
      </div>
    </div>
  );
}

export default DeviceDetails;
