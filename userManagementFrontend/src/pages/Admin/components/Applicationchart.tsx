import { useEffect, useMemo, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
} from "recharts";
import { Paper, Typography, Box, Skeleton, useTheme } from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

interface Application {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  tenantId: number;
  chirpstackId: string;
  status: string;
  TotalDeviceCount: number;
}

interface ApiResponse {
  success: boolean;
  data: Application[];
}

const BRAND_GREEN = "#169647";
const BRAND_ORANGE = "#E07B2A";

// Top app gets orange, everything else steps down through green shades so the
// ring reads as "one leader + the pack" rather than a rainbow.
const shadeFor = (idx: number, count: number) => {
  if (idx === 0) return BRAND_ORANGE;
  const lightness = 32 + (idx / Math.max(count - 1, 1)) * 26; // 32%→58%
  return `hsl(147, 62%, ${lightness}%)`;
};

// Only show the top N as individual rings; a 20-app dashboard as 20 rings is unreadable.
const MAX_RINGS = 6;

export default function BestApplicationsRadial() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/active/applications")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch application data");
        return res.json() as Promise<ApiResponse>;
      })
      .then((resData) => {
        if (resData.success) {
          const sorted = [...resData.data].sort(
            (a, b) => b.TotalDeviceCount - a.TotalDeviceCount
          );
          setApps(sorted);
        } else {
          setError("API reported error fetching active applications.");
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const totalDevices = useMemo(
    () => apps.reduce((sum, a) => sum + a.TotalDeviceCount, 0),
    [apps]
  );

  const chartData = useMemo(() => {
    const top = apps.slice(0, MAX_RINGS);
    const maxCount = top.length ? top[0].TotalDeviceCount : 0;
    return top.map((app, idx) => ({
      name: app.name.trim(),
      devices: app.TotalDeviceCount,
      fill: shadeFor(idx, top.length),
      // recharts radial bars are plotted 0-100 against a shared domain
      value: maxCount > 0 ? (app.TotalDeviceCount / maxCount) * 100 : 0,
    }));
  }, [apps]);

  const surface = isDark ? "#12181A" : "#FBFAF8";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(20,30,25,0.08)";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: `1px solid ${border}`,
        bgcolor: surface,
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <Box mb={1}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: "1.6px",
            color: BRAND_GREEN,
            textTransform: "uppercase",
            fontSize: "0.68rem",
          }}
        >
          Fleet Analytics
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", mt: 0.25 }}>
          Top Applications by Device Count
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <Skeleton variant="circular" width={220} height={220} />
        </Box>
      )}

      {!loading && error && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            height: 260,
            textAlign: "center",
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ fontSize: 28, color: "error.main" }} />
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 280 }}>
            Couldn&apos;t load fleet metrics. {error}
          </Typography>
        </Box>
      )}

      {!loading && !error && apps.length === 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            height: 260,
            textAlign: "center",
          }}
        >
          <Inventory2OutlinedIcon sx={{ fontSize: 28, color: "text.disabled" }} />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No active applications yet.
          </Typography>
        </Box>
      )}

      {!loading && !error && apps.length > 0 && (
        <>
          {/* Radial ring, with total devices readout dead center */}
          <Box sx={{ position: "relative", width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="30%"
                outerRadius="100%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
                barCategoryGap={6}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  dataKey="value"
                  background={{ fill: isDark ? "rgba(255,255,255,0.06)" : "rgba(20,30,25,0.05)" }}
                  cornerRadius={8}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <Paper
                          elevation={4}
                          sx={{
                            p: 1.25,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                            {d.name}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: d.fill, mt: 0.25 }}>
                            {d.devices} devices
                          </Typography>
                        </Paper>
                      );
                    }
                    return null;
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Center readout */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                {totalDevices.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                total devices
              </Typography>
            </Box>
          </Box>

          {/* Legend, doubling as the ranked list the rings alone can't convey precisely */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
            {chartData.map((d, idx) => (
              <Box
                key={d.name}
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: d.fill,
                      flexShrink: 0,
                    }}
                  />
                  <Typography noWrap sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.primary" }}>
                    {d.name}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: idx === 0 ? BRAND_ORANGE : "text.secondary",
                    flexShrink: 0,
                    ml: 1,
                  }}
                >
                  {d.devices}
                </Typography>
              </Box>
            ))}
            {apps.length > MAX_RINGS && (
              <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5 }}>
                +{apps.length - MAX_RINGS} more application{apps.length - MAX_RINGS > 1 ? "s" : ""} not shown
              </Typography>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
}