import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from "@mui/material";

interface HistoryData {
  date: string;
  panelsCleaned: number;
}

interface ApiResponse {
  success: boolean;
  data: HistoryData[];
}

export default function PanelsCleanedHistory() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/history-panels-cleaned")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch historical data");
        return res.json() as Promise<ApiResponse>;
      })
      .then((resData) => {
        if (resData.success) {
          // Format raw date strings into highly readable labels (e.g., "13 Jul")
          const formattedData = resData.data.map((item) => {
            const dateObj = new Date(item.date);
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            });
            return {
              ...item,
              displayDate: formattedDate,
            };
          });
          setHistory(formattedData);
        } else {
          setError("API reported error fetching cleaning logs.");
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
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: "100%", height: 320 }}>
        <CircularProgress size={28} thickness={5} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2.5, borderColor: "error.main", border: "1px solid", bgcolor: "background.paper", borderRadius: 3 }}>
        <Typography variant="body2" color="error" fontWeight={600}>Failed to load historical data: {error}</Typography>
      </Paper>
    );
  }

  // Calculate sum total panels cleaned in this window
  const totalCleaned = history.reduce((sum, current) => sum + current.panelsCleaned, 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "20px",
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
        bgcolor: isDark ? "rgba(13, 17, 23, 0.7)" : "#FFFFFF",
        backdropFilter: "blur(12px)",
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        boxShadow: isDark ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)" : "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
        boxSizing: "border-box"
      }}
    >
      {/* Header Metric */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography 
            variant="caption" 
            fontWeight={800} 
            color="primary.main" 
            sx={{ letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "10px" }}
          >
            CLEANING EFFICIENCY
          </Typography>
          <Typography variant="h6" fontWeight={900} color="text.primary" sx={{ letterSpacing: "-0.5px", mt: 0.5 }}>
            Panels Cleaned Trend
          </Typography>
        </Box>
        <Box textAlign="right">
          <Typography variant="h5" fontWeight={900} color="text.primary" sx={{ fontFamily: "monospace", lineHeight: 1 }}>
            {totalCleaned.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Total Cleaned
          </Typography>
        </Box>
      </Box>

      {/* Chart Canvas */}
      <Box sx={{ width: "100%", height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={history}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            {/* SVG Defs block generates our smooth neon background gradient */}
            <defs>
              <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={isDark ? "#38bdf8" : "#0284c7"} 
                  stopOpacity={isDark ? 0.4 : 0.25} 
                />
                <stop 
                  offset="95%" 
                  stopColor={isDark ? "#38bdf8" : "#0284c7"} 
                  stopOpacity={0} 
                />
              </linearGradient>
            </defs>

            {/* Subtle Gridlines */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)"} 
            />

            <XAxis 
              dataKey="displayDate" 
              tickLine={false}
              axisLine={false}
              tick={{ fill: isDark ? "#8C9BA5" : "#5C6E7E", fontSize: 11, fontWeight: 600 }}
              dy={10}
            />

            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fill: isDark ? "#8C9BA5" : "#5C6E7E", fontSize: 11, fontWeight: 600 }}
              dx={-5}
            />

            {/* Beautiful Custom Hover Popup */}
            <ChartTooltip
              cursor={{ stroke: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", strokeWidth: 1.5 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as HistoryData & { displayDate: string };
                  return (
                    <Paper 
                      elevation={8} 
                      sx={{ 
                        p: 1.5, 
                        border: "1px solid", 
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                        bgcolor: "background.paper",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                        {data.displayDate}
                      </Typography>
                      <Typography variant="body2" color="primary.main" fontWeight={900} sx={{ mt: 0.5 }}>
                        {data.panelsCleaned.toLocaleString()} Panels
                      </Typography>
                    </Paper>
                  );
                }
                return null;
              }}
            />

            {/* Glowing Gradient Area Line */}
            <Area
              type="monotone"
              dataKey="panelsCleaned"
              stroke={isDark ? "#38bdf8" : "#0284c7"}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#glowGradient)"
              activeDot={{
                r: 6,
                stroke: isDark ? "#0D1117" : "#FFFFFF",
                strokeWidth: 2,
                fill: isDark ? "#38bdf8" : "#0284c7",
                style: { filter: "drop-shadow(0px 0px 5px rgba(56, 189, 248, 0.6))" }
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}