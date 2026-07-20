import { Box, Grid as Grid, Typography } from "@mui/material"; 



// Standardized import paths relative to this file's location
import DailyEfficiencyMetrics from "./Admin/components/DailyEfficiencyMetrics";
import RobotStatusBreakdownCard from "./Admin/components/RobotStatusBreakdownCard";
import BestApplicationsDashboard from "./Admin/components/Applicationchart";
import GatewayMapDashboard from "./Admin/components/map";
import PanelsCleanedHistory from "./Admin/components/historyPannelsCleans";
import ApplicationSelector from "./Admin/components/ApplicationSelector";

export default function AdminDashboard() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} color="text.primary" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time metrics, solar panel efficiency, and system status overview.
        </Typography>
      </Box>

      {/* Structured Layout Grid */}
      <Grid container spacing={3}>
        
        {/* FIX 1: Properly wrap the Selector in a full-width Grid item */}
        <Grid size={12}>
          <ApplicationSelector />
        </Grid>

        {/* Row 1: Key Performance Metrics (Top Row) */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <DailyEfficiencyMetrics />
        </Grid>
        
        <Grid size={{ xs: 12, lg: 6 }}>
          <RobotStatusBreakdownCard />
        </Grid>

        {/* Row 2: Deep Dive Analytics & Historical Data */}
        <Grid size={{ xs: 12, md: 7 }}>
          <PanelsCleanedHistory />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <BestApplicationsDashboard />
        </Grid>

        {/* Row 3: Geospatial / Map View (Full Width) */}
        <Grid size={12}>
          <GatewayMapDashboard />
        </Grid>

      </Grid>
    </Box>
  );
}