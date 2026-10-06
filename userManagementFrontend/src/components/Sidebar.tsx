import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { authState, selectedApplicationState } from "../store/authState";
import { Link, useLocation } from "react-router-dom";
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme, Drawer } from "@mui/material";

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import GroupsIcon from '@mui/icons-material/Groups';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const user = useRecoilValue(authState);
  const [selectedAppId, setSelectedAppId] = useRecoilState(selectedApplicationState);
  const location = useLocation();
  const { pathname } = location;

  // -------------------------------------------------------------
  // ROUTE & HISTORY SYNC EFFECT
  // -------------------------------------------------------------
  useEffect(() => {
    const isTenantOrAppListPage = 
      pathname === "/tenants" || 
      pathname.includes("/applications");

    if (isTenantOrAppListPage) {
      localStorage.removeItem("selectedApplicationId");
      setSelectedAppId(null);
    } else {
      const storedAppId = localStorage.getItem("selectedApplicationId");
      if (storedAppId && storedAppId !== selectedAppId) {
        setSelectedAppId(storedAppId);
      }
    }
  }, [pathname, setSelectedAppId]);

  if (!user) return null;

  // 1. Centralized navigation definitions
  const renderStandardNavItems = () => (
    <>
      <NavItem to="/dashboard" label="Dashboard" icon={<DashboardIcon />} active={pathname === "/dashboard"} onClick={onClose} />
      <NavItem to="/devices" label="Devices" icon={<SmartToyIcon />} active={pathname === "/devices"} onClick={onClose} />
      <NavItem to="/multicast-groups" label="Multicast" icon={<GroupsIcon />} active={pathname === "/multicast-groups"} onClick={onClose} />
      <NavItem to="/Robotsbatteies" label="Batteries" icon={<BatteryChargingFullIcon />} active={pathname === "/Robotsbatteies"} onClick={onClose} />
      <NavItem to="/logs" label="System Logs" icon={<ReceiptLongIcon />} active={pathname === "/logs"} onClick={onClose} />
      <NavItem to="/reports" label="Reports" icon={<ReceiptLongIcon />} active={pathname === "/reports"} onClick={onClose} />
    </>
  );

  const sidebarNavContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", width: 240, bgcolor: "background.paper" }}>
      <Box sx={{ flexGrow: 1, px: 2, py: 2, overflowY: "auto" }}>
        <List component="nav" sx={{ p: 0 }}>
          {/* USER view: Always sees the standard navigation */}
          {user.role === "USER" && renderStandardNavItems()}

          {/* ADMIN view without selected App: Sees administrative tools */}
          {(user.role === "SUPERADMIN" || user.role === "ADMIN") && !selectedAppId && (
            <>
              <Typography
                variant="caption"
                sx={{ 
                  px: 2,
                  py: 1,
                  display: "block",
                  fontWeight: 800,
                  color: "text.secondary",
                  letterSpacing: "0.5px"
                }}
              >
                ADMINISTRATION
              </Typography>

              <NavItem to="/admin" label="Admin Panel" icon={<AdminPanelSettingsIcon />} active={pathname === "/admin"} onClick={onClose} />
              <NavItem to="/users" label="Manage Users" icon={<PeopleIcon />} active={pathname === "/users"} onClick={onClose} />
              <NavItem to="/tenants" label="Admin Portal" icon={<GroupsIcon />} active={pathname === "/tenants"} onClick={onClose} />
            </>
          )}

          {/* ADMIN view with selected App: Sees standard features for that scope */}
          {(user.role === "SUPERADMIN" || user.role === "ADMIN") && selectedAppId && renderStandardNavItems()}
        </List>
      </Box>

      {/* Bottom Footer Section */}
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary">
          v2.4.0 • Aegeus IOT
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {sidebarNavContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: 240,
          flexShrink: 0,
          height: "100%",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          transition: "all 0.3s ease",
        }}
      >
        {sidebarNavContent}
      </Box>
    </>
  );
}

// Sub-component for Nav Items
interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick?: () => void;
}

function NavItem({ to, label, icon, active, onClick }: NavItemProps) {
  const theme = useTheme();

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={Link}
        to={to}
        onClick={onClick}
        sx={{
          borderRadius: 2,
          py: 1.2,
          bgcolor: active 
            ? (theme.palette.mode === 'light' ? 'primary.lighter' : 'rgba(59, 130, 246, 0.1)') 
            : 'transparent',
          color: active ? 'primary.main' : 'text.secondary',
          '&:hover': {
            bgcolor: active ? 'none' : 'action.hover',
          },
        }}
      >
        <ListItemIcon sx={{ 
          minWidth: 40, 
          color: active ? 'primary.main' : 'inherit',
          '& svg': { fontSize: 22 }
        }}>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={label} 
          slotProps={{
            primary: {
              sx: {
                fontSize: '15px',
                fontWeight: active ? 800 : 500 
              },
            },
          }}
        />
        {active && (
          <Box sx={{ 
            width: 4, 
            height: 20, 
            bgcolor: 'primary.main', 
            borderRadius: 2, 
            position: 'absolute', 
            right: 0 
          }} />
        )}
      </ListItemButton>
    </ListItem>
  );
}

export default Sidebar;