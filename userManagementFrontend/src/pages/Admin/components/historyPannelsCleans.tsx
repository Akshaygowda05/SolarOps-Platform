import { useEffect, useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
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
import { applicationHistoryChart, historyGlobalChart } from "../../../services/User.service";

import { selectedApplicationState } from "../../../store/authState";

interface HistoryData {
  date: string;
  panelsCleaned: number;
  displayDate?: string;
}

interface ApiResponse {
  success: boolean;
  data: HistoryData[];
  message?: string;
}

export default function PanelsCleanedHistory() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const selectedApplicationId = useRecoilValue(selectedApplicationState);

  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatChartData = (data: HistoryData[]): HistoryData[] => {
    return data.map((item) => {
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
  };

  const fetchGlobalHistoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: ApiResponse = await historyGlobalChart();
      
      if (!response.success) {
        throw new Error(response.message || "Something went wrong fetching global trends");
      }
      
      setHistory(formatChartData(response.data));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApplicationsHistory = useCallback(async (applicationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response: ApiResponse = await applicationHistoryChart(applicationId);
      
      if (!response.success) {
        throw new Error(response.message || `Something went wrong fetching logs for ID: ${applicationId}`);
      }
      
      setHistory(formatChartData(response.data));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedApplicationId || selectedApplicationId === "ALL") {
      fetchGlobalHistoryData();
    } else {
      fetchApplicationsHistory(selectedApplicationId);
    }
  }, [selectedApplicationId, fetchGlobalHistoryData, fetchApplicationsHistory]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: 320 }}>
        <CircularProgress size={28} thickness={5} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2.5, borderColor: "error.main", border: "1px solid", bgcolor: "background.paper", borderRadius: 3, maxWidth: "500px", margin: "0 auto" }}>
        <Typography sx={{ typography: "body2", color: "error.main", fontWeight: 600 }}>
          Failed to load historical data: {error}
        </Typography>
      </Paper>
    );
  }

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography 
            sx={{ 
              typography: "caption", 
              fontWeight: 800, 
              color: "primary.main", 
              letterSpacing: "1.5px", 
              textTransform: "uppercase", 
              fontSize: "10px" 
            }}
          >
            CLEANING EFFICIENCY
          </Typography>
          <Typography 
            sx={{ 
              typography: "h6", 
              fontWeight: 900, 
              color: "text.primary", 
              letterSpacing: "-0.5px", 
              mt: 0.5 
            }}
          >
            Panels Cleaned Trend
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography 
            sx={{ 
              typography: "h5", 
              fontWeight: 900, 
              color: "text.primary", 
              fontFamily: "monospace", 
              lineHeight: 1 
            }}
          >
            {totalCleaned.toLocaleString()}
          </Typography>
          <Typography 
            sx={{ 
              typography: "caption", 
              color: "text.secondary", 
              fontWeight: 600 
            }}
          >
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
                      <Typography 
                        sx={{ 
                          typography: "caption", 
                          color: "text.secondary", 
                          fontWeight: 700, 
                          display: "block" 
                        }}
                      >
                        {data.displayDate}
                      </Typography>
                      <Typography 
                        sx={{ 
                          typography: "body2", 
                          color: "primary.main", 
                          fontWeight: 900, 
                          mt: 0.5 
                        }}
                      >
                        {data.panelsCleaned.toLocaleString()} Panels
                      </Typography>
                    </Paper>
                  );
                }
                return null;
              }}
            />

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