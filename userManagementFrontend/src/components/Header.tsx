import { useEffect, useState, useContext } from "react";
import { useRecoilState, useRecoilValue, useResetRecoilState } from "recoil";
import { authState, selectedApplicationState } from "../store/authState";
import log from "../assets/Aegeus-Technologies-logo.png";
import { FiLogOut, FiAlertCircle } from "react-icons/fi";
import { 
  AppBar, Toolbar, Box, Typography, IconButton, 
  Tooltip, Avatar, Divider, useTheme, Badge, keyframes 
} from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchSiteConfigStatus } from "../services/User.service";
import { ColorModeContext } from "../context/ColorModeContext";

// Animation for the "Attention" pulse
const softPulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
`;

function Header() {
  const user = useRecoilValue(authState);
  const resetAuth = useResetRecoilState(authState);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedAppId, setSelectedAppId] = useRecoilState(selectedApplicationState);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);

  // 1. Route Navigation & Config Fetching
  useEffect(() => {
    // Automatically clear or sync application state based on active path
    if (location.pathname === "/tenants") {
      localStorage.removeItem("selectedApplicationId");
      localStorage.removeItem("selectedApplicationNameForAdmin");
      setSelectedAppId(null);
    } else {
      const currentId = localStorage.getItem("selectedApplicationId");
      setSelectedAppId(currentId || null);
    }

    // Check system config status
    const checkStatus = async () => {
      try {
        const response = await fetchSiteConfigStatus();
        const data = await response.data;
        setIsConfigured(data.status === "configured");
      } catch (error) {
        console.error("Status check failed", error);
      }
    };

    checkStatus();
  }, [location.pathname, user?.role, setSelectedAppId]);

  // 2. Chrome Back/Forward History & Cache Restores
  useEffect(() => {
    const syncStateFromStorage = () => {
      const storedAppId = localStorage.getItem("selectedApplicationId");
      setSelectedAppId(storedAppId || null);
    };

    window.addEventListener("popstate", syncStateFromStorage);
    window.addEventListener("pageshow", syncStateFromStorage);

    return () => {
      window.removeEventListener("popstate", syncStateFromStorage);
      window.removeEventListener("pageshow", syncStateFromStorage);
    };
  }, [setSelectedAppId]);

  const logout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("selectedApplicationId");
    localStorage.removeItem("selectedApplicationNameForAdmin");
    setSelectedAppId(null);
    resetAuth();
    window.location.href = "/";
  };

  const switchApplication = () => {
    localStorage.removeItem("selectedApplicationId");
    localStorage.removeItem("selectedApplicationNameForAdmin");
    setSelectedAppId(null);
    navigate("/tenants");
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        background: theme.palette.mode === 'light' 
          ? "rgba(255, 255, 255, 0.9)" 
          : "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: 1201 
      }}
    >
      {/* 1. TOP SYSTEM ALERT BANNER */}
      {!isConfigured && (
        <Box
          sx={{
            bgcolor: "warning.main",
            color: "warning.contrastText",
            py: 0.5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            cursor: user?.role === "ADMIN" ? "pointer" : "default",
            "&:hover": {
              bgcolor: user?.role === "ADMIN" ? "warning.dark" : "warning.main",
            },
          }}
          onClick={
            user?.role === "ADMIN"
              ? () => navigate("/site-config")
              : undefined
          }
        >
          <FiAlertCircle size={14} />
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            {user?.role === "ADMIN"
              ? "SYSTEM NOT CONFIGURED: CLICK HERE TO COMPLETE SETUP"
              : "SYSTEM NOT CONFIGURED: PLEASE CONTACT YOUR ADMINISTRATOR TO COMPLETE THE SITE SETUP"}
          </Typography>
        </Box>
      )}

      <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: 56, sm: 64 } }}>
        
        {/* Left Side: Logo & Header Label */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img src={log} alt="Logo" style={{ height: "32px", borderRadius: '4px' }} />
          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, my: 'auto' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', display: { xs: 'none', md: 'block' } }}>
            {user?.role === "ADMIN" ? `${localStorage.getItem("selectedApplicationNameForAdmin") || "Admin Dashboard"}` : `${user?.siteName || ''}`}
          </Typography>
        </Box>

        {/* Right Side: Tools & Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 } }}>
          
          {/* Admin Controls: Rendered ONLY when an Application is selected */}
          {user?.role === "ADMIN" && selectedAppId && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Tooltip title="Switch Application">
                <IconButton
                  onClick={switchApplication}
                  sx={{ color: "text.primary" }}
                >
                  <GroupsIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={
                  isConfigured
                    ? "Site Configuration"
                    : "Action Required: Complete Setup"
                }
              >
                <IconButton
                  onClick={() => navigate("/site-config")}
                  sx={{
                    color: !isConfigured ? "warning.main" : "text.primary",
                    animation: !isConfigured ? `${softPulse} 2s infinite` : "none",
                  }}
                >
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={isConfigured}
                  >
                    <SettingsSuggestIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Theme Toggle */}
          <Tooltip title="Toggle Theme">
            <IconButton onClick={colorMode.toggleColorMode} sx={{ color: 'text.primary' }}>
              {theme.palette.mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

          {/* User Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', lg: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1 }}>
                {user?.name || "Operator"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user?.role === "ADMIN" ? "Administrator" : "Standard User"}
              </Typography>
            </Box>
            
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: 'primary.main', 
                fontSize: '0.9rem',
                fontWeight: 'bold',
                border: `2px solid ${theme.palette.divider}`
              }}
            >
              {user?.name?.charAt(0) || "A"}
            </Avatar>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: 'auto' }} />

          {/* Logout */}
          <Tooltip title="Logout">
            <IconButton 
              onClick={logout} 
              sx={{ 
                color: 'text.secondary',
                ml: 0.5,
                '&:hover': { color: 'error.main', bgcolor: 'error.lighter' } 
              }}
            >
              <FiLogOut size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;