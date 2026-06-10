import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Skeleton,
  Divider,
  useTheme,
  alpha,
  Stack,
} from "@mui/material";

import WifiIcon from "@mui/icons-material/Wifi";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { getGateway } from "../services/User.service";

interface Gateway {
  gatewayId: string;
  name: string;
  description?: string;
  state: "ONLINE" | "OFFLINE";
  lastSeenAt: string;
}

export default function GatewayCard() {
  const theme = useTheme();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const data = await getGateway();
      setGateways(data.filteredGatewayData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const onlineCount = gateways.filter((g) => g.state === "ONLINE").length;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        width: "100%",              // ✅ was maxWidth:500 + mx:auto — removed both
        bgcolor: "background.paper",
        flexGrow: 1,                // ✅ grows to fill remaining left column height
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
  flexWrap: "wrap",
  gap: 1
}}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WifiIcon color="primary" sx={{ fontSize: 22 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, fontSize: "1.1rem", color: "text.primary" }}
            >
              Gateway Health
            </Typography>
          </Box>

          {!loading && (
            <Chip
              label={`${onlineCount}/${gateways.length} Active`}
              variant="filled"
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
              }}
            />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Content */}
        {loading ? (
          <Stack spacing={1.5}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {gateways.map((gw) => {
              const isOnline = gw.state === "ONLINE";
              return (
                <Box
                  key={gw.gatewayId}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.2s ease-in-out",
                    bgcolor: "action.hover",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                 <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    mb: 1,
    flexWrap: "wrap",
    gap: 1,
  }}
>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {gw.name}
                      </Typography>
                      {gw.description && (
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
                        >
                          {gw.description}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: isOnline ? "success.main" : "error.main" }}
                      >
                        {gw.state}
                      </Typography>
                      {isOnline ? (
                        <CheckCircleIcon sx={{ fontSize: 18 }} color="success" />
                      ) : (
                        <ErrorIcon sx={{ fontSize: 18 }} color="error" />
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1, borderStyle: "dashed" }} />

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: 14 }} /> ID: {gw.gatewayId}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                      Seen {getTimeAgo(gw.lastSeenAt)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}