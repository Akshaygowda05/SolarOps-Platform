import { useState, useEffect, useCallback } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";

import DailyEfficiencyMetrics from "./Admin/components/DailyEfficiencyMetrics";
import RobotStatusBreakdownCard from "./Admin/components/RobotStatusBreakdownCard";
import BestApplicationsDashboard from "./Admin/components/Applicationchart";
import GatewayMapDashboard from "./Admin/components/map";
import PanelsCleanedHistory from "./Admin/components/historyPannelsCleans";
import ApplicationSelector from "./Admin/components/ApplicationSelector";
import CompactCoreHealthCard from "../components/CompactCoreHealthCard";
import SystemHealthPanel from "./Admin/components/SystemHealthPanel";
import { syncAllTenants } from "../services/User.service";

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
  const [isSyncing, setIsSyncing] = useState(false);

  // Memoized sync handler to support both auto-sync and manual click
  const handleSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      await syncAllTenants();
    } catch (error) {
      console.error("Failed to sync tenants:", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial sync on mount
    handleSync();

    // 2. Set interval for every 1 hour (1000ms * 60s * 60m)
    const ONE_HOUR = 1000 * 60 * 60;
    const intervalId = setInterval(() => {
      handleSync();
    }, ONE_HOUR);

    // 3. Clean up timer on component unmount
    return () => clearInterval(intervalId);
  }, [handleSync]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          mb: 4, 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2 
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }} color="text.primary" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time metrics, solar panel efficiency, and system status overview.
          </Typography>
        </Box>

        {/* Sync / Refresh Button */}
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSync}
          disabled={isSyncing}
          startIcon={
            isSyncing ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />
          }
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          {isSyncing ? "Syncing..." : "Sync Tenants"}
        </Button>
      </Box>

      <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(12, 1fr)" }}>
        {/* Row 0: header controls */}
        <Box sx={{ gridColumn: "span 12" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <ApplicationSelector />
            </Box>
            <CompactCoreHealthCard />
          </Box>
        </Box>

        {/* Row 1: KPI + status */}
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

        {/* Row 3: map + system health */}
        <Box sx={{ gridColumn: { xs: "span 12", md: "span 7" } }}>
          <DashboardCard minHeight={380}>
            <GatewayMapDashboard />
          </DashboardCard>
        </Box>

        <Box sx={{ gridColumn: { xs: "span 12", md: "span 5" } }}>
          <DashboardCard minHeight={380}>
            <SystemHealthPanel />
          </DashboardCard>
        </Box>
      </Box>
    </Box>
  );
}