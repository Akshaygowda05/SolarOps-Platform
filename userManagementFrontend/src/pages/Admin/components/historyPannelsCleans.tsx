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
  ToggleButtonGroup,
  ToggleButton,
  Fade,
} from "@mui/material";
import {
  getGlobalDailyPanels,
  getGlobalMonthlyPanels,
  getGlobalYearlyPanels,
  getApplicationDailyPanels,
  getApplicationMonthlyPanels,
  getApplicationYearlyPanels,
} from "../../../services/User.service";

// 🔴 FIX 1: Import the exact same Recoil state as DailyEfficiencyMetrics
import { selectedApplicationStateForAdmin } from "../../../store/authState";

type TimeFrame = "daily" | "monthly" | "yearly";

interface HistoryData {
  date?: string;
  month?: string;
  year?: string;
  panelsCleaned: number;
  displayDate?: string;
}

export default function PanelsCleanedHistory() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // 🔴 FIX 2: Use selectedApplicationStateForAdmin instead of selectedApplicationState
  const applicationId = useRecoilValue(selectedApplicationStateForAdmin);

  const [timeFrame, setTimeFrame] = useState<TimeFrame>("daily");
  const [history, setHistory] = useState<HistoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format dates for display
  const formatChartData = (data: HistoryData[], frame: TimeFrame): HistoryData[] => {
    if (!Array.isArray(data)) return [];

    return data.map((item) => {
      let formattedDate = "";

      if (frame === "daily" && item.date) {
        const dateObj = new Date(item.date);
        formattedDate = dateObj.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });
      } else if (frame === "monthly" && (item.month || item.date)) {
        const dateObj = new Date(item.month || item.date || "");
        formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
      } else if (frame === "yearly" && (item.year || item.date)) {
        const dateObj = new Date(item.year || item.date || "");
        formattedDate = dateObj.getFullYear().toString();
      } else {
        formattedDate = String(item.date || item.month || item.year || "");
      }

      return {
        ...item,
        displayDate: formattedDate,
      };
    });
  };

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!applicationId) {
      setError("No application selected");
      setLoading(false);
      return;
    }

    try {
      let response;
      const isGlobal = applicationId === "ALL";

      if (isGlobal) {
        switch (timeFrame) {
          case "monthly":
            response = await getGlobalMonthlyPanels();
            break;
          case "yearly":
            response = await getGlobalYearlyPanels();
            break;
          case "daily":
          default:
            response = await getGlobalDailyPanels();
            break;
        }
      } else {
        switch (timeFrame) {
          case "monthly":
            response = await getApplicationMonthlyPanels(applicationId);
            break;
          case "yearly":
            response = await getApplicationYearlyPanels(applicationId);
            break;
          case "daily":
          default:
            response = await getApplicationDailyPanels(applicationId);
            console.log("Fetched daily panels for application:", applicationId, response.data.data);
            break;
        }
      }

      if (response && response.data) {
        // Handle array payload safely
        const rawData = Array.isArray(response.data) ? response.data : [response.data];
        setHistory(formatChartData(rawData, timeFrame));
      } else {
        setError("No historical logs available");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch cleaning metrics");
    } finally {
      setLoading(false);
    }
  }, [applicationId, timeFrame]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const handleTimeFrameChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTimeFrame: TimeFrame | null
  ) => {
    if (newTimeFrame !== null) {
      setTimeFrame(newTimeFrame);
    }
  };

  const totalCleaned = history.reduce(
    (sum, current) => sum + (current.panelsCleaned || 0),
    0
  );

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
    height: "100%", 
        margin: "0 auto",
        boxShadow: isDark
          ? "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          : "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
        boxSizing: "border-box",
      }}
    >
      {/* Header Metric & Timeframe Selector */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              typography: "caption",
              fontWeight: 800,
              color: "primary.main",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontSize: "10px",
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
              mt: 0.5,
            }}
          >
            Panels Cleaned Trend
          </Typography>
        </Box>

        {/* Dynamic Timeframe Selector */}
        <ToggleButtonGroup
          value={timeFrame}
          exclusive
          onChange={handleTimeFrameChange}
          size="small"
          sx={{
            bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            p: "3px",
            borderRadius: "12px",
            border: "none",
            "& .MuiToggleButtonGroup-grouped": {
              border: 0,
              borderRadius: "9px !important",
              px: 1.5,
              py: 0.5,
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "capitalize",
              color: "text.secondary",
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              },
            },
          }}
        >
          <ToggleButton value="daily">Daily</ToggleButton>
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="yearly">Yearly</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Metric Summary */}
      <Box sx={{ mb: 3, textAlign: "left" }}>
        <Typography
          sx={{
            typography: "h4",
            fontWeight: 900,
            color: "text.primary",
            fontFamily: "monospace",
            lineHeight: 1,
          }}
        >
          {totalCleaned.toLocaleString()}
        </Typography>
        <Typography
          sx={{
            typography: "caption",
            color: "text.secondary",
            fontWeight: 600,
            mt: 0.5,
            display: "block",
          }}
        >
          Total Panels ({timeFrame})
        </Typography>
      </Box>

      {/* Chart Canvas */}
      <Box sx={{ width: "100%", height: 220, position: "relative" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <CircularProgress size={28} thickness={5} sx={{ color: "primary.main" }} />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 2,
            }}
          >
            <Typography sx={{ typography: "body2", color: "error.main", fontWeight: 600, textAlign: "center" }}>
              {error}
            </Typography>
          </Box>
        ) : (
          <Fade in={!loading} timeout={400}>
            <Box sx={{ width: "100%", height: "100%" }}>
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
                    stroke={
                      isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)"
                    }
                  />

                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: isDark ? "#8C9BA5" : "#5C6E7E",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                    dy={10}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: isDark ? "#8C9BA5" : "#5C6E7E",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                    dx={-5}
                  />

                  <ChartTooltip
                    cursor={{
                      stroke: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                      strokeWidth: 1.5,
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as HistoryData;
                        return (
                          <Paper
                            elevation={8}
                            sx={{
                              p: 1.5,
                              border: "1px solid",
                              borderColor: isDark
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(0,0,0,0.06)",
                              bgcolor: "background.paper",
                              borderRadius: "12px",
                              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                            }}
                          >
                            <Typography
                              sx={{
                                typography: "caption",
                                color: "text.secondary",
                                fontWeight: 700,
                                display: "block",
                              }}
                            >
                              {data.displayDate}
                            </Typography>
                            <Typography
                              sx={{
                                typography: "body2",
                                color: "primary.main",
                                fontWeight: 900,
                                mt: 0.5,
                              }}
                            >
                              {(data.panelsCleaned || 0).toLocaleString()} Panels
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
                      style: {
                        filter: "drop-shadow(0px 0px 5px rgba(56, 189, 248, 0.6))",
                      },
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Fade>
        )}
      </Box>
    </Paper>
  );
}