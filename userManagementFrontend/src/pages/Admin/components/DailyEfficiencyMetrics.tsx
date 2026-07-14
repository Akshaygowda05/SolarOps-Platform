import { useEffect, useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  useTheme 
} from "@mui/material";
import Grid from "@mui/material/Grid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EnergySavingsLeafOutlinedIcon from "@mui/icons-material/EnergySavingsLeafOutlined";

interface CleaningData {
  date: string;
  panelsCleaned: number;
}

interface ApiResponse {
  success: boolean;
  data: CleaningData[];
}

// Extracted constant calculation logic out of the render loop
const WATER_PER_PANEL_LITERS = 1.5;

export default function DailyEfficiencyMetrics() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [metrics, setMetrics] = useState<CleaningData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Used AbortController to prevent memory leaks / state updates if component unmounts
    const controller = new AbortController();

    fetch("http://localhost:3000/api/today-panels-cleaned", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch today's efficiency data");
        return res.json() as Promise<ApiResponse>;
      })
      .then((resData) => {
        if (resData.success && resData.data?.length > 0) {
          setMetrics(resData.data[0]);
        } else {
          setMetrics({ date: new Date().toISOString(), panelsCleaned: 0 });
        }
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: "100%", height: 140 }}>
        <CircularProgress size={24} thickness={5} />
      </Box>
    );
  }

  if (error || !metrics) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderColor: "error.main", borderRadius: 2 }}>
        <Typography variant="body2" color="error" fontWeight={600}>
          Error: {error || "No logs captured"}
        </Typography>
      </Paper>
    );
  }

  const panelsCount = metrics.panelsCleaned;
  const waterUsedLiters = panelsCount * WATER_PER_PANEL_LITERS;

  // Formatting helper for the water metrics
  const formatWaterMetric = (liters: number): string => {
    if (liters >= 1000) {
      return `${(liters / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
    }
    return liters.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  // Shared card styles to keep SX props DRY
  const cardStyles = {
    p: 3,
    borderRadius: 1.5, // 1.5 * 8px = 12px (more modern than rigid 6px)
    border: "1px solid",
    borderColor: isDark ? "divider" : "grey.200", // Utilizes MUI theme tokens directly
    bgcolor: isDark ? "background.paper" : "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 140,
    boxSizing: "border-box",
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 560, mx: "auto" }}>
      <Grid container spacing={2.5}>
        
        {/* Left Panel: Panels Cleaned */}
        <Grid size={6}>
          <Paper elevation={0} sx={cardStyles}>
            <Typography 
              variant="caption" 
              fontWeight={800} 
              color={isDark ? "text.secondary" : "text.secondary"}
              sx={{ letterSpacing: "0.5px", fontSize: "11.5px" }}
            >
              PANELS CLEANED
            </Typography>

            <Typography 
              variant="h3" 
              fontWeight={800} 
              color={isDark ? "text.primary" : "grey.900"}
              sx={{ my: 1.5, lineHeight: 1, letterSpacing: "-1px" }}
            >
              {panelsCount.toLocaleString()}
            </Typography>

            <Box display="flex" alignItems="center" gap={0.5} color="success.main">
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: "11.5px" }}>
                Active Today
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel: Water Track Metric */}
        <Grid size={6}>
          <Paper elevation={0} sx={cardStyles}>
            <Typography 
              variant="caption" 
              fontWeight={800} 
              color={isDark ? "text.secondary" : "text.secondary"}
              sx={{ letterSpacing: "0.5px", fontSize: "11.5px" }}
            >
              WATER USED (LTR)
            </Typography>

            <Typography 
              variant="h3" 
              fontWeight={800} 
              color={isDark ? "info.main" : "#0066CC"} 
              sx={{ my: 1.5, lineHeight: 1, letterSpacing: "-1px" }}
            >
              {formatWaterMetric(waterUsedLiters)}
            </Typography>

            <Box display="flex" alignItems="center" gap={0.5} color="success.dark">
              <EnergySavingsLeafOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: "11.5px" }}>
                Eco-Optimized
              </Typography>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}