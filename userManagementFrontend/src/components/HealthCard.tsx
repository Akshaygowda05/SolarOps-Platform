import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  CircularProgress,
  useTheme,
} from "@mui/material";

import WifiIcon from "@mui/icons-material/Wifi";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

import { getCoreHealth } from "../services/User.service";

interface HealthState {
  mqtt: boolean;
  status: string;
}

export default function CoreHealthCard() {
  const theme = useTheme();
  const [health, setHealth] = useState<HealthState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await getCoreHealth();
      setHealth(response.data);
    } catch (error) {
      console.error(error);
      setHealth({ mqtt: false, status: "DOWN" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading) {
    return (
      <Card
        sx={{
          width: "100%",            // ✅ was hardcoded 320
          borderRadius: 4,
          p: 4,
          display: "flex",
          justifyContent: "center",
          backgroundColor: "background.paper",
        }}
      >
        <CircularProgress />
      </Card>
    );
  }

  const isHealthy = health?.status === "OK" && health?.mqtt;

  return (
    <Card
      elevation={2}
      sx={{
        width: "100%",              // ✅ was hardcoded 320
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: `1px solid ${theme.palette.divider}`,
        transition: "0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",       // ✅ wraps on very small screens
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              SYSTEM CORE
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ChirpStack Network Server
            </Typography>
          </Box>

          <Chip
            size="small"
            label={isHealthy ? "Operational" : "Down"}
            color={isHealthy ? "success" : "error"}
          />
        </Box>

        {/* Main status row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                backgroundColor: "action.hover",
                display: "flex",
              }}
            >
              <WifiIcon color={isHealthy ? "success" : "error"} />
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {health?.mqtt ? "Connected" : "Disconnected"}
              </Typography>
            </Box>
          </Box>

          {isHealthy ? (
            <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
          ) : (
            <ErrorIcon color="error" sx={{ fontSize: 32 }} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}