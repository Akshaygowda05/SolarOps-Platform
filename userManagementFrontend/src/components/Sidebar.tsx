import { useRecoilValue } from "recoil";
import { authState } from "../store/authState";
import { Link, useLocation } from "react-router-dom";
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from "@mui/material";

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import GroupsIcon from '@mui/icons-material/Groups';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';

function Sidebar() {
  const user = useRecoilValue(authState);
  const { pathname } = useLocation();
  //const theme = useTheme();

  if (!user) return null;

  return (
    <Box sx={{
      position: "fixed",
      top: 68, // Matches Header height
      left: 0,
      height: "calc(100vh - 64px)",
      width: "240px",
      bgcolor: "background.paper",
      borderRight: "1px solid",
      borderColor: "divider",
      display: "flex",
      flexDirection: "column",
      zIndex: 100,
      transition: "all 0.3s ease",
    }}>

     

      <Box sx={{ flexGrow: 1, px: 2, py: 2 }}>
        <List component="nav" sx={{ p: 0 }}>
          {/* USER NAV */}
          {user.role === "USER" && (
            <>
              <NavItem to="/dashboard" label="Dashboard" icon={<DashboardIcon />} active={pathname === "/dashboard"} />
              <NavItem to="/devices" label="Devices" icon={<SmartToyIcon />} active={pathname === "/devices"} />
              <NavItem to="/multicast-groups" label="Multicast" icon={<GroupsIcon />} active={pathname === "/multicast-groups"} />
              <NavItem to="/Robotsbatteies" label="Battery" icon={<BatteryChargingFullIcon />} active={pathname === "/Robotsbatteies"} />
              <NavItem to="/logs" label="System Logs" icon={<ReceiptLongIcon />} active={pathname === "/logs"} />
              <NavItem to="/reports" label="Reports" icon={<ReceiptLongIcon />} active={pathname === "/reports"} />

            </>
          )}

          {/* ADMIN NAV */}
          {user.role === "ADMIN" && (
  <>
    <Typography
      variant="caption"
      sx={{
        px: 2,
        py: 1,
        display: "block",
        fontWeight: 800,
        color: "text.secondary",
      }}
    >
      ADMINISTRATION
    </Typography>

    <NavItem
      to="/admin"
      label="Admin Panel"
      icon={<AdminPanelSettingsIcon />}
      active={pathname === "/admin"}
    />

    <NavItem
      to="/users"
      label="Manage Users"
      icon={<PeopleIcon />}
      active={pathname === "/users"}
    />

    <NavItem
      to="/tenants"
      label="Admin Portal"
      icon={<GroupsIcon />}
      active={pathname === "/tenants"}
    />

    <Typography
      variant="caption"
      sx={{
        px: 2,
        py: 1,
        mt: 2,
        display: "block",
        fontWeight: 800,
        color: "text.secondary",
      }}
    >
      APPLICATION
    </Typography>

    <NavItem
      to="/dashboard"
      label="Dashboard"
      icon={<DashboardIcon />}
      active={pathname === "/dashboard"}
    />

    <NavItem
      to="/devices"
      label="Devices"
      icon={<SmartToyIcon />}
      active={pathname === "/devices"}
    />

    <NavItem
      to="/multicast-groups"
      label="Multicast"
      icon={<GroupsIcon />}
      active={pathname === "/multicast-groups"}
    />

    <NavItem
      to="/Robotsbatteies"
      label="Battery"
      icon={<BatteryChargingFullIcon />}
      active={pathname === "/Robotsbatteies"}
    />

    <NavItem
      to="/logs"
      label="System Logs"
      icon={<ReceiptLongIcon />}
      active={pathname === "/logs"}
    />

    <NavItem
      to="/reports"
      label="Reports"
      icon={<ReceiptLongIcon />}
      active={pathname === "/reports"}
    />
  </>
)}
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
}

// Sub-component for Nav Items to keep code clean
function NavItem({ to, label, icon, active }: { to: string; label: string; icon: any; active: boolean }) {
  const theme = useTheme();

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={Link}
        to={to}
        sx={{
          borderRadius: 2,
          py: 1.2,
          bgcolor: active ? (theme.palette.mode === 'light' ? 'primary.lighter' : 'rgba(59, 130, 246, 0.1)') : 'transparent',
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