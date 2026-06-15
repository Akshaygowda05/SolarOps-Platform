import StatCard from "../components/StatCard";
import DeviceModal from "../components/DeviceList";
import { useEffect, useState } from "react";
import { useAuthInit } from "../hooks/useAuthInit";
import { Box, Typography, Container, Skeleton, Divider, useTheme } from "@mui/material";
import { fetchDevicesV1, fetchMulticastGroups } from "../services/User.service";
import DeviceStatusChart from "../components/piechart";

// Icons
import DevicesOtherIcon from "@mui/icons-material/DevicesOther";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import HubIcon from "@mui/icons-material/Hub";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CleaningHistoryChart from "../components/PannelsCleand";
import ActiveInactiveStatusChart from "../components/ActiveInactive";
import { ApplicationEvents } from "../components/ApplicationEvents";

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
              <Skeleton
                key={i}
                variant="rounded"
                sx={{ flex: "1 1 180px", minWidth: 160, height: 110, borderRadius: 2 }}
              />
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
        <Box sx={{ display: "flex", alignItems: { sm: "center" }, flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", gap: 1, mb: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" }, color: "text.primary" }}>
              Robots Overview
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", mt: 0.3 }}>
              Real-time telemetry and device health metrics.
            </Typography>
          </Box>

          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8, px: 1.8, py: 0.8, borderRadius: 1.5, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography sx={{ fontSize: "0.78rem", color: "text.primary", fontWeight: 500 }}>
              Last 24 Hours
            </Typography>
          </Box>
        </Box>

        {/* ── Stat cards ── */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 2 }, mb: { xs: 3, md: 4 } }}>
          <StatCard title="Total Devices" count={totalDevices} icon={DevicesOtherIcon} iconColor={theme.palette.primary.main} subtitle={`+0 vs last month`} />
          <StatCard title="Online Now" count={activeCount} icon={WifiIcon} iconColor="#22c55e" subtitle={`${totalDevices ? ((activeCount / totalDevices) * 100).toFixed(1) : 0}% uptime active`} onClick={() => handleOpen("active")} />
          <StatCard title="Offline" count={inactiveCount} icon={WifiOffIcon} iconColor="#f59e0b" subtitle="Click to view devices" onClick={() => handleOpen("inactive")} />
          <StatCard title="Total Groups" count={multicastCount} icon={HubIcon} iconColor="#06b6d4" />
        </Box>

        {/* ── Top Grid Panel ── */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 350px" }, gap: { xs: 2, md: 2.5 }, alignItems: "start", mb: 2.5 }}>
         {/* Cleaning Performance */}
<Box sx={{ 
  bgcolor: "background.paper", 
  borderRadius: 2, 
  border: "1px solid", 
  borderColor: "divider", 
  p: { xs: 2, sm: 3 }, 
  minHeight: 400, 
  display: "flex", 
  flexDirection: "column" 
}}>
  <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary", mb: 0.4 }}>
    Cleaning Performance
  </Typography>
  <Typography sx={{ fontSize: "0.76rem", color: "text.secondary", mb: 2 }}>
    History of panels cleaned over the last 5 days
  </Typography>
  <Divider sx={{ mb: 3 }} />
  
  {/* Flexgrow container captures the remaining space perfectly */}
  <Box sx={{ flexGrow: 1, width: "100%", display: "flex", flexDirection: "column" }}>
    <CleaningHistoryChart />
  </Box>
</Box>

          {/* Device Distribution */}
          <Box sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider", p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", alignItems: "center" ,  minHeight: "480px"}}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary", mb: 0.4, alignSelf: "flex-start" }}>Device Distribution</Typography>
            <Typography sx={{ fontSize: "0.76rem", color: "text.secondary", mb: 2, alignSelf: "flex-start" }}>Active vs offline breakdown</Typography>
            <Divider sx={{ mb: 2, alignSelf: "stretch" }} />
            <Box sx={{ width: "100%", maxWidth: 240 }}><DeviceStatusChart activeCount={activeCount} inactiveCount={inactiveCount} /></Box>
            <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
              {[{ label: "Active", color: "#22c55e", count: activeCount }, { label: "Offline", color: theme.palette.text.disabled, count: inactiveCount }].map((item) => (
                <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: item.color }} />
                  <Typography sx={{ fontSize: "0.74rem", color: "text.secondary" }}>{item.label} <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>({totalDevices ? ((item.count / totalDevices) * 100).toFixed(0) : 0}%)</Box></Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Bottom Grid Panel: Trends & Live Logs ── */}
        <Box sx={{ display: "grid",
           gridTemplateColumns: { xs: "1fr", lg: "1fr 350px" }, 
           gap: { xs: 2, md: 2.5 }, alignItems: "start" }}>
          {/* Device Status Trends */}
          <Box sx={{ bgcolor: "background.paper",
             borderRadius: 2, border: "1px solid", borderColor: "divider", p: { xs: 2, sm: 3 }, display: "flex", 
             flexDirection: "column",
             minHeight: "500px"
             }}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary" }}>Average Battery Discharge</Typography>
              <Typography sx={{ fontSize: "0.76rem", color: "text.secondary" }}>Average battery discharge for the last 5 days</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ width: "100%", flexGrow: 1 }}><ActiveInactiveStatusChart /></Box>
          </Box>

          {/* APPLICATION EVENTS (FIXED SIDEBAR) */}
<Box sx={{ 
    bgcolor: "background.paper", 
    borderRadius: 2, 
    border: "1px solid", 
    borderColor: "divider", 
    display: "flex", 
    flexDirection: "column",
    height: "500px", // Match the height of the Trends card for symmetry
    overflow: "hidden" 
  }}>
    <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(0,0,0,0.02)" }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary" }}>Live System Events</Typography>
    </Box>
    
    <Box sx={{ 
      flexGrow: 1, 
      overflowY: "auto", 
      p: 2,
      "&::-webkit-scrollbar": { width: "5px" },
      "&::-webkit-scrollbar-thumb": { bgcolor: "#e0e0e0", borderRadius: "10px" }
    }}>
      <ApplicationEvents />
    </Box>
  </Box>
        </Box>

      </Container>

      <DeviceModal open={openModal} onClose={handleClose} title={modalType === "active" ? "Online Devices" : "Offline Devices"} devices={modalType === "active" ? activeDevices : inactiveDevices} />
    </Box>
  );
}

export default Dashboard;