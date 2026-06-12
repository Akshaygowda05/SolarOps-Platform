import StatCard from "../components/StatCard";
import DeviceModal from "../components/DeviceList";
import { useEffect, useState } from "react";
import { useAuthInit } from "../hooks/useAuthInit";
import {
  Box, Typography, Container, Skeleton, Divider, useTheme,
} from "@mui/material";
import { fetchDevicesV1, fetchMulticastGroups } from "../services/User.service";
import DeviceStatusChart from "../components/piechart";

import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import HubIcon from "@mui/icons-material/Hub";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CleaningHistoryChart from "../components/PannelsCleand";
import ActiveInactiveStatusChart from "../components/ActiveInactive";
import { ApplicationEvents } from "../components/ApplicationEvents";

const BRAND_GREEN = "#169647";
const BRAND_ORANGE = "#E07B2A";

function Dashboard() {
  const user = useAuthInit();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState<"active" | "inactive" | "">("");

  const [activeDevices, setActiveDevices] = useState<any[]>([]);
  const [inactiveDevices, setInactiveDevices] = useState<any[]>([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [multicastCount, setMulticastCount] = useState(0);

  const handleOpen = (type: "active" | "inactive") => {
    setModalType(type);
    setOpenModal(true);
  };
  const handleClose = () => {
    setOpenModal(false);
    setModalType("");
  };

  const fetchMulticast = async () => {
    try {
      const res = await fetchMulticastGroups();
      setMulticastCount(res.data.totalCount);
    } catch {
      console.error("Error fetching multicast groups");
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetchDevicesV1();
      const devices = res.data || {};
      setActiveDevices(devices.onlineDevices || []);
      setInactiveDevices(devices.offlineDevices || []);
      setActiveCount(devices.onlineCount || 0);
      setInactiveCount(devices.offlineCount || 0);
      setTotalDevices(devices.totalCount || 0);
    } catch {
      console.error("Error fetching devices");
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchDevices(), fetchMulticast()]).finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: { xs: 3, md: 4 } }}>
        <Container maxWidth="xl">
          <Skeleton width={200} height={32} sx={{ mb: 0.5 }} />
          <Skeleton width={300} height={20} sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" sx={{ flex: "1 1 180px", minWidth: 160, height: 100, borderRadius: 2 }} />
            ))}
          </Box>
          <Skeleton variant="rounded" sx={{ width: "100%", height: 280, borderRadius: 2 }} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", transition: "background 0.3s ease" }}>
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>

        {/* ── Page header ── */}
        <Box sx={{
          display: "flex",
          alignItems: { sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          gap: 1, mb: 3,
        }}>
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: { xs: "1.2rem", sm: "1.35rem" }, color: "text.primary" }}>
              Robots Overview
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.3 }}>
              Real-time telemetry and device health metrics.
            </Typography>
          </Box>
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.8,
            px: 1.6, py: 0.7, borderRadius: 1.5,
            border: "1px solid", borderColor: "divider",
            bgcolor: "background.paper",
          }}>
            <CalendarTodayIcon sx={{ fontSize: 13, color: "text.secondary" }} />
            <Typography sx={{ fontSize: "0.76rem", color: "text.primary", fontWeight: 500 }}>
              Last 24 Hours
            </Typography>
          </Box>
        </Box>

        {/* ── Stat cards ── */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 2 }, mb: { xs: 3, md: 4 } }}>
          <StatCard
            title="Total Devices"
            count={totalDevices}
            icon={DevicesOtherIcon}
            iconColor={BRAND_GREEN}
            trendValue="+0"
            trendColor={BRAND_GREEN}
            subtitle="vs last month"
          />
          <StatCard
            title="Online Now"
            count={activeCount}
            icon={WifiIcon}
            iconColor={BRAND_GREEN}
            trendValue={`${totalDevices ? ((activeCount / totalDevices) * 100).toFixed(1) : 0}%`}
            trendColor={BRAND_GREEN}
            subtitle="uptime active"
            onClick={() => handleOpen("active")}
          />
          <StatCard
            title="Offline"
            count={inactiveCount}
            icon={WifiOffIcon}
            iconColor={BRAND_ORANGE}
            subtitle="Click to view devices"
            onClick={() => handleOpen("inactive")}
          />
          <StatCard
            title="Total Groups"
            count={multicastCount}
            icon={HubIcon}
            iconColor={BRAND_GREEN}
            subtitle="Multicast groups"
          />
        </Box>

        {/* ── Top grid: Cleaning + Device Distribution ── */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" },
          gap: { xs: 2, md: 2.5 },
          alignItems: "start",
          mb: 2.5,
        }}>
          {/* Cleaning History */}
          <Box sx={{
            bgcolor: "background.paper", borderRadius: 2,
            border: "1px solid", borderColor: "divider",
            p: { xs: 2, sm: 2.5 },
            display: "flex", flexDirection: "column",
          }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary", mb: 0.3 }}>
              Cleaning Performance
            </Typography>
            <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", mb: 1.5 }}>
              Panels cleaned over the last 5 days
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ width: "100%", overflow: "hidden", maxHeight: 300 }}>
              <CleaningHistoryChart />
            </Box>
          </Box>

          {/* Device Distribution */}
          <Box sx={{
            bgcolor: "background.paper", borderRadius: 2,
            border: "1px solid", borderColor: "divider",
            p: { xs: 2, sm: 2.5 },
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary", mb: 0.3, alignSelf: "flex-start" }}>
              Device Distribution
            </Typography>
            <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", mb: 1.5, alignSelf: "flex-start" }}>
              Online vs offline breakdown
            </Typography>
            <Divider sx={{ mb: 2, alignSelf: "stretch" }} />
            <DeviceStatusChart activeCount={activeCount} inactiveCount={inactiveCount} />
          </Box>
        </Box>

        {/* ── Bottom grid: Trends + Live Events ── */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" },
          gap: { xs: 2, md: 2.5 },
          alignItems: "start",
        }}>
          {/* Battery / Active-Inactive Trends */}
          <Box sx={{
            bgcolor: "background.paper", borderRadius: 2,
            border: "1px solid", borderColor: "divider",
            p: { xs: 2, sm: 2.5 },
            display: "flex", flexDirection: "column",
          }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary", mb: 0.3 }}>
              Device Status Trends
            </Typography>
            <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", mb: 1.5 }}>
              Active vs inactive devices for the last 5 days
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ width: "100%", overflow: "hidden", maxHeight: 300 }}>
              <ActiveInactiveStatusChart />
            </Box>
          </Box>

          {/* Live System Events */}
          <Box sx={{
            bgcolor: "background.paper", borderRadius: 2,
            border: "1px solid", borderColor: "divider",
            display: "flex", flexDirection: "column",
            height: 420, overflow: "hidden",
          }}>
            <Box sx={{
              px: 2, py: 1.5,
              borderBottom: "1px solid", borderColor: "divider",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}>
                Live System Events
              </Typography>
              <Box sx={{
                width: 7, height: 7, borderRadius: "50%",
                bgcolor: BRAND_GREEN,
                boxShadow: `0 0 0 3px rgba(22,150,71,0.2)`,
              }} />
            </Box>
            <Box sx={{
              flexGrow: 1, overflowY: "auto", p: 1.5,
              "&::-webkit-scrollbar": { width: "4px" },
              "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: "4px" },
            }}>
              <ApplicationEvents />
            </Box>
          </Box>
        </Box>

      </Container>

      <DeviceModal
        open={openModal}
        onClose={handleClose}
        title={modalType === "active" ? "Online Devices" : "Offline Devices"}
        devices={modalType === "active" ? activeDevices : inactiveDevices}
      />
    </Box>
  );
}

export default Dashboard;