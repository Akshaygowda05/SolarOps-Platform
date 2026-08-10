import { useEffect, useState, useCallback } from "react";
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
import { selectedApplicationStateForAdmin } from "../../../store/authState";
import { useRecoilValue } from "recoil";
import { applicationPannleCleaned, GlobalCleanedPannles } from "../../../services/User.service";

interface CleaningData {
  date: string;
  panelsCleaned: number;
}

const WATER_PER_PANEL_LITERS = 1.5;

export default function DailyEfficiencyMetrics() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const applicationId = useRecoilValue(selectedApplicationStateForAdmin);

  const [metrics, setMetrics] = useState<CleaningData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!applicationId) {
      setError("No application selected");
      setLoading(false);
      return;
    }

    try {
      let response;
      if (applicationId === "ALL") {
        response = await GlobalCleanedPannles();
      } else {
        response = await applicationPannleCleaned(applicationId);
      }

      if (response && response.data) {
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

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: 140 }}>
        <CircularProgress size={24} thickness={5} />
      </Box>
    );
  }

  if (error || !metrics) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderColor: "error.main", borderRadius: 2 }}>
        <Typography
          sx={{
            typography: "body2",
            color: "error.main",
            fontWeight: 600,
          }}
        >
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

  return (
    <Box sx={{ width: "100%", maxWidth: 560, mx: "auto" }}>
      <Grid container spacing={2.5}>
        <Grid size={6}>
          <Paper
            elevation={0}
            sx={{
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
            }}
          >
            <Typography
              sx={{
                typography: "caption",
                fontWeight: 800,
                color: "text.secondary",
                letterSpacing: "0.5px",
                fontSize: "11.5px",
              }}
            >
              PANELS CLEANED
            </Typography>

            <Typography
              sx={{
                typography: "h3",
                fontWeight: 800,
                color: isDark ? "text.primary" : "grey.900",
                my: 1.5,
                lineHeight: 1,
                letterSpacing: "-1px",
              }}
            >
              {panelsCount.toLocaleString()}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "success.main" }}>
              <TrendingUpIcon sx={{ fontSize: 16 }} />
              <Typography
                sx={{
                  typography: "caption",
                  fontWeight: 700,
                  fontSize: "11.5px",
                }}
              >
                Active Today
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={6}>
          <Paper
            elevation={0}
            sx={{
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
            }}
          >
            <Typography
              sx={{
                typography: "caption",
                fontWeight: 800,
                color: "text.secondary",
                letterSpacing: "0.5px",
                fontSize: "11.5px",
              }}
            >
              WATER SAVED (LTR)
            </Typography>

            <Typography
              sx={{
                typography: "h3",
                fontWeight: 800,
                color: isDark ? "info.main" : "#0066CC",
                my: 1.5,
                lineHeight: 1,
                letterSpacing: "-1px",
              }}
            >
              {formatWaterMetric(waterUsedLiters)}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "success.dark" }}>
              <EnergySavingsLeafOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography
                sx={{
                  typography: "caption",
                  fontWeight: 700,
                  fontSize: "11.5px",
                }}
              >
                Eco-Optimized
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}