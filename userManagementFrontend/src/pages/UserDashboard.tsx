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
      <Box sx={{ width: "100%", py: { xs: 1, sm: 2 } }}>
        <Container maxWidth="xl" disableGutters>
          <Skeleton width={180} height={32} sx={{ mb: 0.5 }} />
          <Skeleton width={260} height={20} sx={{ mb: 3 }} />
          
          {/* Skeleton stat cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: { xs: 1.5, sm: 2 }, mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                sx={{ width: "100%", height: { xs: 95, sm: 110 }, borderRadius: 2 }}
              />
            ))}
          </Box>

          {/* Skeleton top panel */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 310px", lg: "1fr 340px" }, gap: { xs: 2, md: 2.5 }, mb: 2.5 }}>
            <Skeleton variant="rounded" sx={{ width: "100%", height: 380, borderRadius: 2 }} />
            <Skeleton variant="rounded" sx={{ width: "100%", height: 380, borderRadius: 2 }} />
          </Box>

          {/* Skeleton bottom panel */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 310px", lg: "1fr 340px" }, gap: { xs: 2, md: 2.5 } }}>
            <Skeleton variant="rounded" sx={{ width: "100%", height: 420, borderRadius: 2 }} />
            <Skeleton variant="rounded" sx={{ width: "100%", height: 420, borderRadius: 2 }} />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minHeight: "100%", transition: "background 0.3s ease" }}>
      <Container maxWidth="xl" disableGutters>

        {/* ── Page header ── */}
        <Box sx={{ 
          display: "flex", 
          alignItems: { xs: "flex-start", sm: "center" }, 
          flexDirection: { xs: "column", sm: "row" }, 
          justifyContent: "space-between", 
          gap: 1.5, 
          mb: { xs: 2.5, md: 3 } 
        }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" }, color: "text.primary" }}>
              Robots Overview
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.78rem", sm: "0.82rem" }, color: "text.secondary", mt: 0.3 }}>
              Real-time telemetry and device health metrics.
            </Typography>
          </Box>

          <Box sx={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: 0.8, 
            px: 1.5, 
            py: 0.7, 
            borderRadius: 1.5, 
            border: "1px solid", 
            borderColor: "divider", 
            bgcolor: "background.paper",
            alignSelf: { xs: "flex-start", sm: "auto" }
          }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography sx={{ fontSize: "0.78rem", color: "text.primary", fontWeight: 500 }}>
              Last 24 Hours
            </Typography>
          </Box>
        </Box>

        {/* ── Stat cards ── */}
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, 
          gap: { xs: 1.5, sm: 2 }, 
          mb: { xs: 2.5, md: 3 } 
        }}>
          <StatCard 
            title="Total Devices" 
            count={totalDevices} 
            icon={DevicesOtherIcon} 
            iconColor={theme.palette.primary.main} 
            subtitle={`+0 vs last month`} 
          />
          <StatCard 
            title="Online Now" 
            count={activeCount} 
            icon={WifiIcon} 
            iconColor="#22c55e" 
            subtitle={`${totalDevices ? ((activeCount / totalDevices) * 100).toFixed(1) : 0}% uptime active`} 
            onClick={() => handleOpen("active")} 
          />
          <StatCard 
            title="Offline" 
            count={inactiveCount} 
            icon={WifiOffIcon} 
            iconColor="#f59e0b" 
            subtitle="Click to view devices" 
            onClick={() => handleOpen("inactive")} 
          />
          <StatCard 
            title="Total Groups" 
            count={multicastCount} 
            icon={HubIcon} 
            iconColor="#06b6d4" 
          />
        </Box>

        {/* ── Top Grid Panel ── */}
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: { xs: "1fr", md: "1fr 310px", lg: "1fr 340px" }, 
          gap: { xs: 2, md: 2.5 }, 
          alignItems: "stretch", 
          mb: 2.5 
        }}>
          {/* Cleaning Performance */}
          <Box sx={{ 
            bgcolor: "background.paper", 
            borderRadius: 2, 
            border: "1px solid", 
            borderColor: "divider", 
            p: { xs: 2, sm: 2.5 }, 
            minHeight: { xs: 340, sm: 380, md: 400 }, 
            height: "100%",
            display: "flex", 
            flexDirection: "column" 
          }}>
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.9rem", sm: "0.95rem" }, color: "text.primary" }}>
                Cleaning Performance
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.76rem" }, color: "text.secondary" }}>
                History of panels cleaned over the last 6 days
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            
            <Box sx={{ flexGrow: 1, width: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
              <CleaningHistoryChart />
            </Box>
          </Box>

          {/* Device Distribution */}
          <Box sx={{ 
            bgcolor: "background.paper", 
            borderRadius: 2, 
            border: "1px solid", 
            borderColor: "divider", 
            p: { xs: 2, sm: 2.5 }, 
            minHeight: { xs: 340, sm: 380, md: 400 },
            height: "100%",
            display: "flex", 
            flexDirection: "column" 
          }}>
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.9rem", sm: "0.95rem" }, color: "text.primary" }}>
                Device Distribution
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.76rem" }, color: "text.secondary" }}>
                Active vs offline breakdown
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 1 }}>
              <DeviceStatusChart activeCount={activeCount} inactiveCount={inactiveCount} />
            </Box>
          </Box>
        </Box>

        {/* ── Bottom Grid Panel: Trends & Live Logs ── */}
        <Box sx={{ 
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 310px", lg: "1fr 340px" }, 
          gap: { xs: 2, md: 2.5 }, 
          alignItems: "stretch" 
        }}>
          {/* Device Status Trends */}
          <Box sx={{ 
            bgcolor: "background.paper",
            borderRadius: 2, 
            border: "1px solid", 
            borderColor: "divider", 
            p: { xs: 2, sm: 2.5 }, 
            display: "flex", 
            flexDirection: "column",
            minHeight: { xs: 340, sm: 380, md: 430 },
            height: "100%",
          }}>
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.9rem", sm: "0.95rem" }, color: "text.primary" }}>
                Average Battery Discharge
              </Typography>
              <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.76rem" }, color: "text.secondary" }}>
                Average battery discharge for the last 6 days
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ width: "100%", flexGrow: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <ActiveInactiveStatusChart />
            </Box>
          </Box>

          {/* APPLICATION EVENTS */}
          <Box sx={{ 
            bgcolor: "background.paper", 
            borderRadius: 2, 
            border: "1px solid", 
            borderColor: "divider", 
            display: "flex", 
            flexDirection: "column",
            height: { xs: 400, md: "100%" },
            minHeight: { xs: 380, md: 430 },
            overflow: "hidden" 
          }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(0,0,0,0.02)" }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.9rem", sm: "0.95rem" }, color: "text.primary" }}>
                Live System Events
              </Typography>
            </Box>
            
            <Box sx={{ 
              flexGrow: 1, 
              overflowY: "auto", 
              overflowX: "hidden",
              p: { xs: 1.5, sm: 2 },
              "&::-webkit-scrollbar": { width: "5px" },
              "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: "10px" }
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