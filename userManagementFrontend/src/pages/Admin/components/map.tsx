import { useEffect, useState } from "react";
// Import "Geographies" and "Geography" along with "Marker" from react-simple-maps
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Chip,
  Tooltip,
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

// 100% Reliable public CDN for world atlas map shapes
const WORLD_TOPO_JSON = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: "100%", aspectRatio: "1/1" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, borderColor: "error.main", border: "1px solid", bgcolor: "background.paper", width: "100%", aspectRatio: "1/1" }}>
        <Typography variant="body2" color="error">Error loading mapping: {error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: isDark ? "#0D1117" : "#F8F9FA",
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      {/* Header Panel */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "1.5px" }}>
            INFRASTRUCTURE
          </Typography>
          <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.1 }}>
            Regional Sites
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
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

      {/* Perfect Square Map Container */}
      <Box 
        sx={{ 
          width: "100%", 
          aspectRatio: "1/1",
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
          // Tightly focused coordinates zooming directly over India / South Asia
          projectionConfig={{
            scale: 700,
            center: [78.9629, 21.5937] 
          }}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Read from the TopoJSON features array */}
          <Geographies geography={WORLD_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: isDark ? "#1C2128" : "#EAECEF", // Visible landmass gray
                      stroke: isDark ? "#2D333B" : "#D1D5DB", // Boarder colors
                      strokeWidth: 0.5,
                      outline: "none"
                    },
                    hover: {
                      fill: isDark ? "#2D333B" : "#D1D5DB",
                      stroke: isDark ? "#444C56" : "#9CA3AF",
                      strokeWidth: 0.5,
                      outline: "none"
                    },
                    pressed: {
                      outline: "none"
                    }
                  }}
                />
              ))
            }
          </Geographies>

          {/* Device Nodes Layer */}
          {gateways.map((gateway) => {
            const statusColor = gateway.isOnline ? "#16A34A" : "#DC2626";

            return (
              <Marker key={gateway.id} coordinates={[gateway.longitude, gateway.latitude]}>
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" fontWeight={800}>{gateway.gatewayName.trim()}</Typography>
                      <Typography variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.7)", mb: 0.5 }}>
                        ID: {gateway.gatewayId}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: statusColor }} />
                        <Typography variant="caption" fontWeight={700}>
                          {gateway.isOnline ? "Operational" : "Offline"}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <g style={{ cursor: "pointer" }}>
                    {/* Ripple Ring Effect for active units */}
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
                    {/* Core Point marker */}
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
    </Paper>
  );
}