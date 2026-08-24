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

export default function CompactCoreHealthCard() {
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

  const handleCardClick = () => {
    window.open("http://103.161.75.85:8082/#/login", "_blank");
  };

  const isHealthy = health?.status === "OK" && health?.mqtt;

  if (loading) {
    return (
      <Card
        variant="outlined"
        sx={{
          minWidth: 260,
          borderRadius: 2,
          p: 1.5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.paper",
        }}
      >
        <CircularProgress size={20} />
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      onClick={handleCardClick}
      sx={{
        width: "fit-content",
        minWidth: 280,
        borderRadius: 2,
        backgroundColor: "background.paper",
        borderColor: theme.palette.divider,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: isHealthy ? theme.palette.success.main : theme.palette.error.main,
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <CardContent sx={{ p: "12px 16px !important" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Icon Box */}
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              backgroundColor: "action.hover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WifiIcon
              fontSize="small"
              color={isHealthy ? "success" : "error"}
            />
          </Box>

          {/* Details */}
          <Box sx={{ flexGrow: 1, pr: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700, fontSize: 10, letterSpacing: 0.5, display: "block", lineHeight: 1 }}
            >
              CHIRPSTACK CORE
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {health?.mqtt ? "Connected" : "Disconnected"}
            </Typography>
          </Box>

          {/* Status Indicator Chip & Icon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              size="small"
              label={isHealthy ? "OK" : "DOWN"}
              color={isHealthy ? "success" : "error"}
              sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
            />
            {isHealthy ? (
              <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
            ) : (
              <ErrorIcon color="error" sx={{ fontSize: 20 }} />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}