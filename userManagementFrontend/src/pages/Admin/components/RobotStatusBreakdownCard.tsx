import { useEffect, useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Grid,
  useTheme 
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";


interface CountData {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
}

interface ApiResponse {
  success: boolean;
  data: CountData;
}

export default function RobotStatusBreakdownCard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [counts, setCounts] = useState<CountData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/counts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch fleet counts");
        return res.json() as Promise<ApiResponse>;
      })
      .then((resData) => {
        if (resData.success) {
          setCounts(resData.data);
        } else {
          setError("API reported error fetching device breakdown.");
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: "100%", height: 160 }}>
        <CircularProgress size={24} thickness={5} />
      </Box>
    );
  }

  if (error || !counts) {
    return (
      <Paper sx={{ p: 2.5, borderColor: "error.main", border: "1px solid", borderRadius: "8px" }}>
        <Typography variant="body2" color="error" fontWeight={600}>Error: {error || "No data available"}</Typography>
      </Paper>
    );
  }

  // Define metric blocks to match the layout image format
  const statusItems = [
    {
      label: "ONLINE",
      value: counts.onlineDevices,
      dotColor: "#10B981", // Premium emerald green
    },
    {
      label: "OFFLINE",
      value: counts.offlineDevices,
      dotColor: "#EF4444", // Bright dashboard red
    },
    {
      label: "TOTAL",
      value: counts.totalDevices,
      dotColor: "#3B82F6", // System blue 
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
        bgcolor: isDark ? "#0D1117" : "#FFFFFF",
        width: "100%",
        maxWidth: "520px",
        margin: "0 auto",
        boxSizing: "border-box"
      }}
    >
      {/* Header Segment */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Typography 
          variant="subtitle2" 
          fontWeight={800} 
          color={isDark ? "text.primary" : "#1E293B"} 
          sx={{ letterSpacing: "0.5px", fontSize: "12.5px" }}
        >
          ROBOT STATUS BREAKDOWN
        </Typography>
        
        <Box 
          display="flex" 
          alignItems="center" 
          gap={0.5} 
          sx={{ 
            cursor: "pointer", 
            color: "#0066CC",
            "&:hover": { opacity: 0.8 } 
          }}
        >
          <Typography variant="caption" fontWeight={700} sx={{ fontSize: "12px" }}>
            View All
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: "14px", fontWeight: 700 }} />
        </Box>
      </Box>

      {/* Grid Sub-panels Row */}
      <Grid container spacing={1.5}>
        {statusItems.map((item, idx) => (
          <Grid size={4} key={idx}>
            <Box
              sx={{
                p: 2,
                borderRadius: "4px",
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                bgcolor: isDark ? "#161B22" : "#F4F6F8",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
                minHeight: "75px",
                boxSizing: "border-box"
              }}
            >
              {/* Dot indicator and label header */}
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Box 
                  sx={{ 
                    width: 7, 
                    height: 7, 
                    borderRadius: "50%", 
                    bgcolor: item.dotColor,
                    flexShrink: 0
                  }} 
                />
                <Typography 
                  variant="caption" 
                  fontWeight={800} 
                  color={isDark ? "text.secondary" : "#334155"}
                  sx={{ letterSpacing: "0.5px", fontSize: "10.5px" }}
                >
                  {item.label}
                </Typography>
              </Box>

              {/* Bold count typography scaling */}
              <Typography 
                variant="h4" 
                fontWeight={800} 
                color={isDark ? "text.primary" : "#0F172A"}
                sx={{ lineHeight: 1, letterSpacing: "-0.5px" }}
              >
                {item.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}