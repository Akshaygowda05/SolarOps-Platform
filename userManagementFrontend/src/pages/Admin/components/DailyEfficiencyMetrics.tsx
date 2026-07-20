import { useEffect, useState, useCallback } from "react";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid"; // If using MUI v6, 'size' is correct. If v5, use xs={6}
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EnergySavingsLeafOutlinedIcon from "@mui/icons-material/EnergySavingsLeafOutlined";
import { selectedApplicationState, selectedApplicationStateForAdmin } from "../../../store/authState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { applicationPannleCleaned, GlobalCleanedPannles } from "../../../services/User.service";

interface CleaningData {
  date: string;
  panelsCleaned: number;
}

const WATER_PER_PANEL_LITERS = 1.5;

export default function DailyEfficiencyMetrics() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // FIX 1: Moved Recoil hooks inside the component
  const applicationId = useRecoilValue(selectedApplicationStateForAdmin);


  // If you are getting an array from the API, we will just grab the latest or sum it. 
  // Assuming metrics holds a single object here based on your panelsCount logic.
  const [metrics, setMetrics] = useState<CleaningData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // FIX 2: Properly handle async data fetching, state updates, and errors
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (applicationId === "ALL") {
        response = await GlobalCleanedPannles();
      } else {
        response = await applicationPannleCleaned(applicationId);
      }

      // Adjust this condition based on your exact API response shape
      if (response && response.data) {
        // If API returns an array, take the first/latest item to match your interface
        const dataItem = Array.isArray(response.data) ? response.data[0] : response.data;
        setMetrics(dataItem || { date: "", panelsCleaned: 0 });
      } else {
        setError("No logs captured");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch cleaning metrics");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // FIX 3: Added applicationId to dependency array so it updates when switching views
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

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
          Error: {error || "No data available"}
        </Typography>
      </Paper>
    );
  }

  const panelsCount = metrics.panelsCleaned || 0;
  const waterUsedLiters = panelsCount * WATER_PER_PANEL_LITERS;

  const formatWaterMetric = (liters: number): string => {
    if (liters >= 1000) {
      return `${(liters / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
    }
    return liters.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  const cardStyles = {
    p: 3,
    borderRadius: 1.5,
    border: "1px solid",
    borderColor: isDark ? "divider" : "grey.200",
    bgcolor: isDark ? "background.paper" : "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 140,
    boxSizing: "border-box",
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 560, mx: "auto" }}>
      {/* 
        Note on Grid: If you are using Material UI v5, replace size={6} with xs={6}.
        If you are on Material UI v6, size={6} is correct.
      */}
      <Grid container spacing={2.5}>
        <Grid size={6}>
          <Paper elevation={0} sx={cardStyles}>
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
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

        <Grid size={6}>
          <Paper elevation={0} sx={cardStyles}>
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
              sx={{ letterSpacing: "0.5px", fontSize: "11.5px" }}
            >
              WATER SAVED (LTR)
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