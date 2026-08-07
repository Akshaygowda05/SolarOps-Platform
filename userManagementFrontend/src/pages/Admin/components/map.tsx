import { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { 
  Box, 
  CircularProgress, 
  Chip,
  Tooltip,
  Typography,
  useTheme
} from "@mui/material";

interface Gateway {
  id: number;
  gatewayId: string;
  gatewayName: string;
  latitude: number;
  longitude: number;
  isOnline: boolean;
  lastSeen: string;
}

interface ApiResponse {
  success: boolean;
  data: Gateway[];
}

const WORLD_TOPO_JSON = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const MAP_SIZE = 600;

const injectPulsingStyles = () => {
  if (typeof window === "undefined" || document.getElementById("vector-marker-styles")) return;
  const style = document.createElement("style");
  style.id = "vector-marker-styles";
  style.innerHTML = `
    @keyframes glow-pulse {
      0% { r: 4px; opacity: 0.9; stroke-width: 1px; }
      50% { r: 10px; opacity: 0.3; stroke-width: 3px; }
      100% { r: 4px; opacity: 0.9; stroke-width: 1px; }
    }
    .pulse-ring {
      animation: glow-pulse 2s infinite ease-in-out;
      transform-origin: center;
    }
  `;
  document.head.appendChild(style);
};

export default function VectorGatewayMap() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    injectPulsingStyles();
    
    fetch("http://localhost:3000/api/dashboard/gateways")
      .then((res) => {
        if (!res.ok) throw new Error("Network response failed");
        return res.json() as Promise<ApiResponse>;
      })
      .then((resData) => {
        if (resData.success) {
          const validCoordinates = resData.data.filter(
            (g) => g.latitude !== 0 && g.longitude !== 0
          );
          setGateways(validCoordinates);
        } else {
          setError("API reported unsuccessful data retrieval.");
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography variant="body2" color="error">Error loading mapping: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Header Panel */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "1.5px", fontWeight: 700, fontSize: 11 }}>
            INFRASTRUCTURE
          </Typography>
          <Typography variant="subtitle1" color="text.primary" sx={{ lineHeight: 1.1, fontWeight: 800 }}>
            Regional Sites
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip 
            label={`${gateways.filter(g => g.isOnline).length} Active`} 
            size="small" 
            sx={{ bgcolor: "rgba(22, 163, 74, 0.12)", color: "#16A34A", fontWeight: 700, borderRadius: "6px" }} 
          />
          <Chip 
            label={`${gateways.filter(g => !g.isOnline).length} Offline`} 
            size="small" 
            sx={{ bgcolor: "rgba(220, 38, 38, 0.12)", color: "#DC2626", fontWeight: 700, borderRadius: "6px" }} 
          />
        </Box>
      </Box>

      {/* Map Frame Container */}
      <Box 
        sx={{ 
          flex: 1,
          minHeight: 300,
          borderRadius: 2, 
          overflow: "hidden",
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          bgcolor: isDark ? "#090D10" : "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ComposableMap
          projection="geoMercator"
          width={MAP_SIZE}
          height={MAP_SIZE}
          projectionConfig={{
            scale: 700, 
            center: [78.9629, 22.5937], // Centered on India
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={WORLD_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: isDark ? "#1C2128" : "#EAECEF",
                      stroke: isDark ? "#2D333B" : "#D1D5DB",
                      strokeWidth: 0.5,
                      outline: "none"
                    },
                    hover: {
                      fill: isDark ? "#2D333B" : "#D1D5DB",
                      stroke: isDark ? "#444C56" : "#9CA3AF",
                      strokeWidth: 0.5,
                      outline: "none"
                    },
                    pressed: { outline: "none" }
                  }}
                />
              ))
            }
          </Geographies>

          {gateways.map((gateway) => {
            const statusColor = gateway.isOnline ? "#16A34A" : "#DC2626";

            return (
              <Marker key={gateway.id} coordinates={[gateway.longitude, gateway.latitude]}>
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{gateway.gatewayName.trim()}</Typography>
                      <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.7)", mb: 0.5 }}>
                        ID: {gateway.gatewayId}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: statusColor }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {gateway.isOnline ? "Operational" : "Offline"}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <g style={{ cursor: "pointer" }}>
                    {gateway.isOnline && (
                      <circle
                        cx={0}
                        cy={0}
                        r={6}
                        fill="none"
                        stroke={statusColor}
                        className="pulse-ring"
                      />
                    )}
                    <circle
                      cx={0}
                      cy={0}
                      r={3.5}
                      fill={statusColor}
                      stroke={isDark ? "#090D10" : "#FFFFFF"}
                      strokeWidth={1}
                    />
                  </g>
                </Tooltip>
              </Marker>
            );
          })}
        </ComposableMap>
      </Box>
    </Box>
  );
}