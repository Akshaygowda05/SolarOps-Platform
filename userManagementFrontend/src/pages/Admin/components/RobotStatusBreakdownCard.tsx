import { useEffect, useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  Grid,
  Skeleton,
  useTheme,
  Backdrop,
  CircularProgress
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { fetchCountOfApplication, fetchDashBoardCount } from "../../../services/User.service";
import { selectedApplicationState, selectedApplicationStateForAdmin } from "../../../store/authState";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";

interface CountData {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
}

export default function RobotStatusBreakdownCard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const applicationId = useRecoilValue(selectedApplicationStateForAdmin);
  const setSelectedApplication = useSetRecoilState(selectedApplicationState);

  const [counts, setCounts] = useState<CountData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);

  const showViewAll = !applicationId || applicationId === "ALL";

  useEffect(() => {
    localStorage.removeItem("selectedApplicationId");
    if (applicationId === "ALL" || !applicationId) {
      fetchGlobalCount();
    } else {
      applicationCount(applicationId);
    }
  }, [applicationId]);

  const fetchGlobalCount = async () => {
    try {
      setLoading(true);
      const response = await fetchDashBoardCount();
      if (response.success) {
        setCounts(response.data);
      } else {
        setError("API reported error fetching device breakdown.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const applicationCount = async (app: string) => {
    try {
      setLoading(true);
      const response = await fetchCountOfApplication(app);
      if (response.success) {
        setCounts(response.data);
      } else {
        setError("API reported error fetching device breakdown.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationClick = () => {
    if (!applicationId) return;

    // Immediately start navigation transition
    setNavigating(true);

    // Save application context
    setSelectedApplication(applicationId);
    localStorage.setItem("selectedApplicationId", applicationId);

    // Smooth navigation delay
    setTimeout(() => {
      navigate("/dashboard");
    }, 800); // 800ms gives a responsive yet smooth transition feel
  };

  if (error) {
    return (
      <Paper sx={{ p: 2.5, borderColor: "error.main", border: "1px solid", borderRadius: "8px", maxWidth: "520px", margin: "0 auto" }}>
        <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600 }}>
          ⚠️ Error: {error}
        </Typography>
      </Paper>
    );
  }

  const statusItems = counts ? [
    { label: "ONLINE", value: counts.onlineDevices, dotColor: "#10B981", emoji: "🟢" },
    { label: "OFFLINE", value: counts.offlineDevices, dotColor: "#EF4444", emoji: "🔴" },
    { label: "TOTAL", value: counts.totalDevices, dotColor: "#3B82F6", emoji: "🤖" },
  ] : [];

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
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
        <Box sx={{ minHeight: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
          <Typography
            variant="subtitle2"
            color={isDark ? "text.primary" : "#1E293B"}
            sx={{ letterSpacing: "0.5px", fontSize: "12.5px", fontWeight: 800, display: "flex", alignItems: "center", gap: 0.75 }}
          >
            <span role="img" aria-label="robot">🤖</span> ROBOT STATUS BREAKDOWN
          </Typography>

          {!showViewAll ? (
            <Box
              onClick={handleApplicationClick}
              sx={{
                cursor: "pointer",
                color: theme.palette.primary.main,
                "&:hover": { opacity: 0.8 },
                display: "flex",
                alignItems: "center",
                gap: 0.5
              }}
            >
              <Typography variant="caption" sx={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px" }}>
                View All
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: "14px", fontWeight: 700 }} />
            </Box>
          ) : (
            <Box sx={{ width: 14, height: 14 }} />
          )}
        </Box>

        {/* Dynamic Display Area */}
        <Grid container spacing={1.5}>
          {loading ? (
            Array.from(new Array(3)).map((_, idx) => (
              <Grid size={{ xs: 4 }} key={idx}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "4px",
                    border: "1px solid",
                    borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                    bgcolor: isDark ? "#161B22" : "#F4F6F8",
                    height: "75px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center"
                  }}
                >
                  <Skeleton variant="text" width="60%" height={15} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={32} />
                </Box>
              </Grid>
            ))
          ) : (
            statusItems.map((item, idx) => (
              <Grid size={{ xs: 4 }} key={idx}>
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
                    boxSizing: "border-box",
                    transition: "transform 0.15s ease, border-color 0.15s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: item.dotColor,
                    }
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
                    <Typography sx={{ fontSize: "11px", lineHeight: 1 }}>{item.emoji}</Typography>
                    <Typography
                      color={isDark ? "text.secondary" : "#334155"}
                      sx={{ letterSpacing: "0.5px", fontSize: "10.5px", fontWeight: 800 }}
                    >
                      {item.label}
                    </Typography>
                  </Box>

                  <Typography
                    variant="h4"
                    color={isDark ? "text.primary" : "#0F172A"}
                    sx={{ lineHeight: 1, letterSpacing: "-0.5px", fontWeight: 800 }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>

      {/* Full-screen Backdrop Loading Overlay */}
      <Backdrop
        open={navigating}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 999,
          bgcolor: isDark ? "rgba(13, 17, 23, 0.85)" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(4px)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" size={44} thickness={4} />
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600, 
            color: isDark ? "text.primary" : "text.secondary",
            letterSpacing: "0.5px"
          }}
        >
          Loading dashboard context...
        </Typography>
      </Backdrop>
    </Box>
  );
}