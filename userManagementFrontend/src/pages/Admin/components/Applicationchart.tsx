import { useEffect, useMemo, useState } from "react";
import { Paper, Typography, Box, Skeleton } from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { activeApplicationChart } from "../../../services/User.service";

// Standard hook import path layer
import { useChartTheme } from "../../../hooks/useChartTheme";

interface Application {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  tenantId: number;
  chirpstackId: string;
  status: string;
  TotalDeviceCount: number;
}

// Custom clean Tooltip matching dynamic theme context styles
const CustomTooltip = ({ active, payload, themeVars }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: "8px 12px",
          border: "1px solid",
          borderColor: themeVars.borderColor,
          bgcolor: themeVars.bgColor,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, color: themeVars.secondaryText, display: "block", mb: 0.5 }}>
          {payload[0].payload.name}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 900, color: themeVars.brandColor }}>
          {payload[0].value.toLocaleString()} Devices
        </Typography>
      </Paper>
    );
  }
  return null;
};

export default function BestApplicationsRadial() {
  // 1. Pull dynamic colors straight out of your reusable theme hook
  const { brandColor, textColor, secondaryText, bgColor, borderColor, cursorFill } = useChartTheme();

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    applicationChart().finally(() => setLoading(false));
  }, []);

  const applicationChart = async () => {
    try {
      const response = await activeApplicationChart();
      const rawData = Array.isArray(response) ? response : response?.data || [];
      setApps(rawData);
    } catch (err) {
      setError("Failed to fetch application data.");
    }
  };

  const chartData = useMemo(() => {
    return [...apps]
      .sort((a, b) => b.TotalDeviceCount - a.TotalDeviceCount)
      .map(app => ({
        name: app.name.trim(),
        devices: app.TotalDeviceCount,
      }));
  }, [apps]);

  const totalDevices = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.devices, 0);
  }, [chartData]);

  const dynamicHeight = useMemo(() => {
    const minHeight = 200;
    const itemHeight = 45; 
    return Math.max(minHeight, chartData.length * itemHeight);
  }, [chartData]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: borderColor, // Synchronized border
        bgcolor: bgColor,         // Synchronized card background
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Modern Top Header Analytics Summary bar */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: "1.5px",
              color: brandColor, // Uses the dynamic theme primary accent
              textTransform: "uppercase",
              fontSize: "10.5px",
            }}
          >
            Fleet Analytics
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textColor, mt: 0.25, fontSize: "15px" }}>
            Top Active Deployments
          </Typography>
        </Box>
        
        {!loading && !error && apps.length > 0 && (
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: brandColor, lineHeight: 1, fontSize: "18px" }}>
              {totalDevices.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: "10px", textTransform: "uppercase" }}>
              Active Robots
            </Typography>
          </Box>
        )}
      </Box>

      {/* Loading Skeleton Elements */}
      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {Array.from(new Array(4)).map((_, idx) => (
            <Box key={idx}>
              <Skeleton variant="text" width="30%" height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="rectangular" width="100%" height={16} sx={{ borderRadius: "4px" }} />
            </Box>
          ))}
        </Box>
      )}

      {/* Error Interface View */}
      {!loading && error && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, height: 240 }}>
          <ErrorOutlineRoundedIcon sx={{ fontSize: 26, color: "error.main" }} />
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>{error}</Typography>
        </Box>
      )}

      {/* Empty State Interface View */}
      {!loading && !error && chartData.length === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, height: 240 }}>
          <Inventory2OutlinedIcon sx={{ fontSize: 26, color: "text.disabled" }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>No active deployments found.</Typography>
        </Box>
      )}

      {/* Pure Custom Chart Graphics Canvas Layer */}
      {!loading && !error && chartData.length > 0 && (
        <Box 
          sx={{ 
            maxHeight: "380px", 
            overflowY: "auto",
            pr: chartData.length > 6 ? 1 : 0,
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-thumb": { bgcolor: borderColor, borderRadius: "4px" } // Clean scrollbar tracker matches borders
          }}
        >
          <Box sx={{ width: "100%", height: dynamicHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                
                {/* 2. Custom components need theme values passed into them as variables */}
                <Tooltip 
                  cursor={{ fill: cursorFill }} 
                  content={<CustomTooltip themeVars={{ bgColor, borderColor, textColor, secondaryText, brandColor }} />} 
                />
                
                <Bar 
                  dataKey="devices" 
                  fill={brandColor} // Injects dynamic color mapping configurations natively
                  radius={[0, 4, 4, 0]} 
                  barSize={14}
                  label={(props) => {
                    const { x, y, width, value, index } = props;
                    return (
                      <g>
                        <text 
                          x={0} 
                          y={y - 6} 
                          fill={secondaryText} // Dynamically handles secondary subtext colors
                          fontSize="11.5px" 
                          fontWeight={700}
                        >
                          {chartData[index]?.name}
                        </text>
                        <text 
                          x={width + 8} 
                          y={y + 7} 
                          fill={textColor} // Dominant core text tracking match
                          fontSize="11.5px" 
                          fontWeight={800}
                        >
                          {value}
                        </text>
                      </g>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}
    </Paper>
  );
}