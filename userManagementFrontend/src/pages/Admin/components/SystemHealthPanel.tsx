import { Box, LinearProgress, Typography, useTheme } from "@mui/material";

interface ServiceStatus {
  label: string;
  status: "online" | "warning" | "critical";
  detail?: string;
}

const SERVICES: ServiceStatus[] = [
  { label: "PostgreSQL", status: "online" },
  { label: "Redis", status: "online" },
  { label: "ChirpStack", status: "online" },
  { label: "MQTT", status: "online" },
  { label: "Backend Workers", status: "online" },
];

const STATUS_COLOR: Record<ServiceStatus["status"], string> = {
  online: "#169647",
  warning: "#E07B2A",
  critical: "#DC2626",
};

function StatusDot({ status }: { status: ServiceStatus["status"] }) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: STATUS_COLOR[status],
        boxShadow: `0 0 6px ${STATUS_COLOR[status]}`,
        flexShrink: 0,
      }}
    />
  );
}

export default function SystemHealthPanel() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const overallHealth = 96;
  const storageUsage = 82;
  const queueFailures = 5;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "1.5px", fontWeight: 700, fontSize: 11 }}>
            SYSTEM HEALTH
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, color: "#169647" }}>
            {overallHealth}%
          </Typography>
        </Box>
        <StatusDot status="online" />
      </Box>

      {/* Service list */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
          p: 1.5,
          borderRadius: 2,
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          bgcolor: isDark ? "#090D10" : "#FAFBFC",
        }}
      >
        {SERVICES.map((service) => (
          <Box key={service.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StatusDot status={service.status} />
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, fontFamily: "IBM Plex Mono, monospace" }}>
              {service.label}
            </Typography>
          </Box>
        ))}

        {/* Storage — warning */}
        <Box sx={{ mt: 0.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StatusDot status="warning" />
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                Storage
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#E07B2A" }}>
              {storageUsage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={storageUsage}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: isDark ? "rgba(224,123,42,0.15)" : "rgba(224,123,42,0.12)",
              "& .MuiLinearProgress-bar": { bgcolor: "#E07B2A", borderRadius: 3 },
            }}
          />
        </Box>

        {/* Queue failures — critical */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 0.75,
            px: 1,
            py: 0.75,
            borderRadius: 1.5,
            bgcolor: isDark ? "rgba(220,38,38,0.1)" : "rgba(220,38,38,0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StatusDot status="critical" />
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#DC2626" }}>
              Queue failures
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 800, color: "#DC2626" }}>
            {queueFailures}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}