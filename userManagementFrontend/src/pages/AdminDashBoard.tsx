import { Box, Paper, Typography } from "@mui/material";

import DailyEfficiencyMetrics from "./Admin/components/DailyEfficiencyMetrics";
import RobotStatusBreakdownCard from "./Admin/components/RobotStatusBreakdownCard";
import BestApplicationsDashboard from "./Admin/components/Applicationchart";
import GatewayMapDashboard from "./Admin/components/map";
import PanelsCleanedHistory from "./Admin/components/historyPannelsCleans";
import ApplicationSelector from "./Admin/components/ApplicationSelector";
import CompactCoreHealthCard from "../components/CompactCoreHealthCard"; // 👈 Import new component

export function DashboardCard({
  children,
  minHeight = 260,
}: {
  children: React.ReactNode;
  minHeight?: number;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        minHeight,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {children}
    </Paper>
  );
}

export default function AdminDashboard() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} color="text.primary" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time metrics, solar panel efficiency, and system status overview.
        </Typography>
      </Box>

      {/* Grid container */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: "repeat(12, 1fr)",
        }}
      >
        {/* Row 0: Header Controls - Side by Side */}
        <Box sx={{ gridColumn: "span 12" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Left side selector */}
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <ApplicationSelector />
            </Box>

            {/* Right side compact health badge */}
            <CompactCoreHealthCard />
          </Box>
        </Box>

        {/* Row 1: KPI + status side by side */}
        <Box sx={{ gridColumn: { xs: "span 12", lg: "span 6" } }}>
          <DashboardCard minHeight={220}>
            <DailyEfficiencyMetrics />
          </DashboardCard>
        </Box>

        <Box sx={{ gridColumn: { xs: "span 12", lg: "span 6" } }}>
          <DashboardCard minHeight={220}>
            <RobotStatusBreakdownCard />
          </DashboardCard>
        </Box>

        {/* Row 2: history + analytics */}
        <Box sx={{ gridColumn: { xs: "span 12", md: "span 7" } }}>
          <DashboardCard minHeight={380}>
            <PanelsCleanedHistory />
          </DashboardCard>
        </Box>

        <Box sx={{ gridColumn: { xs: "span 12", md: "span 5" } }}>
          <DashboardCard minHeight={380}>
            <BestApplicationsDashboard />
          </DashboardCard>
        </Box>

        {/* Row 3: full-width map */}
        <Box sx={{ gridColumn: "span 12" }}>
          <DashboardCard minHeight={220}>
            <GatewayMapDashboard />
          </DashboardCard>
        </Box>
      </Box>
    </Box>
  );
}