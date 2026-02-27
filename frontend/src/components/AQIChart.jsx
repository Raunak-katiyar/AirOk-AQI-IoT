import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";

/* ================================
   AQI Helper Functions
================================ */

const getAQIColor = (aqi) => {
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#84cc16";
  if (aqi <= 150) return "#facc15";
  if (aqi <= 200) return "#fb923c";
  if (aqi <= 300) return "#ef4444";
  return "#a855f7";
};

const getAQICategory = (aqi) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const formatFullDateTime = (value) => {
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

/* ================================
   Custom Tooltip (Modernized)
================================ */

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const aqi = payload[0].value;
    const color = getAQIColor(aqi);
    const category = getAQICategory(aqi);

    const date = new Date(label);
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const fullDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    return (
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-xl px-5 py-3 border border-gray-100 text-sm">
        <p className="font-semibold text-gray-800">
          {time} <span className="text-gray-400 font-normal">• {fullDate}</span>
        </p>
        <div className="flex items-center gap-3 mt-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: color }}
          >
            {aqi}
          </div>
          <div>
            <p className="font-medium text-gray-700">AQI {aqi}</p>
            <p className="text-xs text-gray-500">{category}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

/* ================================
   MAIN COMPONENT (Modern UI)
================================ */

function AQIChart({ data = [] }) {
  const [activeLabel, setActiveLabel] = React.useState(null);

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-dashed border-gray-200">
        <p className="text-gray-400 text-lg">No historical data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    label: item.time_slot,
    avg_aqi: Number(item.avg_aqi),
  }));

  const minItem = chartData.reduce((prev, curr) =>
    curr.avg_aqi < prev.avg_aqi ? curr : prev
  );

  const maxItem = chartData.reduce((prev, curr) =>
    curr.avg_aqi > prev.avg_aqi ? curr : prev
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">AQI Graph</h2>
        {/* <p className="text-sm text-gray-500">Historical AQI levels over time</p> */}
      </div>

      {/* ===== Summary Cards (Modern) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Minimum Card */}
        <div className="flex items-center gap-4 bg-linear-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            style={{ backgroundColor: getAQIColor(minItem.avg_aqi) }}
          >
            {minItem.avg_aqi}
          </div>
          <div>
            <p className="text-sm uppercase tracking-wider text-gray-500">Minimum AQI</p>
            <p className="text-lg font-semibold text-gray-800">
              {getAQICategory(minItem.avg_aqi)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatFullDateTime(minItem.label)}
            </p>
          </div>
        </div>

        {/* Maximum Card */}
        <div className="flex items-center gap-4 bg-linear-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            style={{ backgroundColor: getAQIColor(maxItem.avg_aqi) }}
          >
            {maxItem.avg_aqi}
          </div>
          <div>
            <p className="text-sm uppercase tracking-wider text-gray-500">Maximum AQI</p>
            <p className="text-lg font-semibold text-gray-800">
              {getAQICategory(maxItem.avg_aqi)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatFullDateTime(maxItem.label)}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Chart Section (with refined styling) ===== */}
      <div className="bg-gray-50/50 rounded-xl p-2">
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              onMouseMove={(state) => {
                if (state?.activeLabel) {
                  setActiveLabel(state.activeLabel);
                }
              }}
              onMouseLeave={() => setActiveLabel(null)}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid stroke="#e5e7eb" vertical={false} strokeDasharray="3 3" />

              <XAxis
                dataKey="label"
                tickFormatter={(value, index) => {
                  const total = chartData.length;
                  const date = new Date(value);
                  const time = date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  });
                  const formattedDate = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  });

                  if (index === 0 || index === total - 1) {
                    return `${time}\n${formattedDate}`;
                  }
                  return time;
                }}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={[0, 300]}
                ticks={[0, 50, 100, 150, 200, 300]}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                allowDecimals={false}
                axisLine={{ stroke: "#d1d5db" }}
                tickLine={false}
                label={{
                  value: "AQI",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { fill: "#9ca3af", fontSize: 12, fontWeight: 500 },
                }}
              />

              <Bar dataKey="avg_aqi" radius={[8, 8, 0, 0]} maxBarSize={30}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={getAQIColor(entry.avg_aqi)}
                    style={{ filter: "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))" }}
                  />
                ))}
              </Bar>

              {/* Dashed hover line with smoother style */}
              {activeLabel && (
                <ReferenceLine
                  x={activeLabel}
                  stroke="#6b7280"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              )}

              <Tooltip content={<CustomTooltip />} cursor={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Optional subtle footer note */}
      <p className="text-xs text-gray-400 mt-4 text-right">
        {/* AQI categories based on EPA standards */}
      </p>
    </div>
  );
}

export default AQIChart;