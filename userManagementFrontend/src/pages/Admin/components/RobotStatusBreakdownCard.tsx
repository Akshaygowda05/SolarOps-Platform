import { useEffect, useState } from "react";
import { 
  Paper, 
  Typography, 
  Box, 
  Grid,
  Skeleton,
  useTheme 
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

  // Checks if the "View All" element should be displayed
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
    
    setSelectedApplication(applicationId);
    localStorage.setItem("selectedApplicationId", applicationId);

    setNavigating(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  };

  if (error) {
    return (
      <Paper sx={{ p: 2.5, borderColor: "error.main", border: "1px solid", borderRadius: "8px", maxWidth: "520px", margin: "0 auto" }}>
        <Typography variant="body2" color="error" fontWeight={600}>
          Error: {error}
        </Typography>
      </Paper>
    );
  }

  // Fallback map data layout helper
  const statusItems = counts ? [
    { label: "ONLINE", value: counts.onlineDevices, dotColor: "#10B981" },
    { label: "OFFLINE", value: counts.offlineDevices, dotColor: "#EF4444" },
    { label: "TOTAL", value: counts.totalDevices, dotColor: "#3B82F6" },
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} sx={{ minHeight: "24px" }}>
          <Typography 
            variant="subtitle2" 
            fontWeight={800} 
            color={isDark ? "text.primary" : "#1E293B"} 
            sx={{ letterSpacing: "0.5px", fontSize: "12.5px" }}
          >
            ROBOT STATUS BREAKDOWN
          </Typography>
          
          {/* Only render "View All" actions when no specific appId is targeted */}
          {!showViewAll ? (
            <Box 
              onClick={handleApplicationClick}
              display="flex" 
              alignItems="center" 
              gap={0.5} 
              sx={{ 
                cursor: "pointer", 
                color: theme.palette.primary.main,
                "&:hover": { opacity: 0.8 } 
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: "12px" }}>
                View All
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: "14px", fontWeight: 700 }} />
            </Box>
          ) : (
            // Empty spacer block when hidden to prevent card height collapse
            <Box sx={{ width: 14, height: 14 }} />
          )}
        </Box>

        {/* Dynamic Display Area: Loading Skeletons vs Data Panels */}
        <Grid container spacing={1.5}>
          {loading ? (
            // Skeleton Layout Blocks
            Array.from(new Array(3)).map((_, idx) => (
              <Grid item xs={4} key={idx}>
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
            // Actual Metrics Data Grid
            statusItems.map((item, idx) => (
              <Grid item xs={4} key={idx}>
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

                  <Typography 
                    variant="h4" 
                    color={isDark ? "text.primary" : "#0F172A"}
                    sx={{ lineHeight: 1, letterSpacing: "-0.5px",fontWeight:800 }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </Paper>

      {/* Screen blocker navigation overlay */}
      {navigating && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "background.default",
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Typography variant="body2" color="text.secondary">
            Loading dashboard context...
          </Typography>
        </Box>
      )}
    </Box>
  );
}