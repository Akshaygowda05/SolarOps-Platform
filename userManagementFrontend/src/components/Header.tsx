import { useEffect, useState, useContext } from "react";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { authState } from "../store/authState";
import log from "../assets/Aegeus-Technologies-logo.png";
import { FiLogOut, FiAlertCircle } from "react-icons/fi";
import { 
  AppBar, Toolbar, Box, Typography, IconButton, 
  Tooltip, Avatar, Divider, useTheme, Badge, keyframes 
} from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import { ColorModeContext } from "../App";
import { useNavigate } from "react-router-dom";
import { fetchSiteConfigStatus } from "../services/User.service";

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

  // State for configuration status
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetchSiteConfigStatus();
        const data = await response.data;
        // If status is "not-configured", set state to false
        setIsConfigured(data.status === "configured");
      } catch (error) {
        console.error("Status check failed", error);
      }
    };
    checkStatus();
  }, []);

  const logout = () => {
    localStorage.removeItem("auth");
    resetAuth();
    window.location.href = "/";
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
      {/* 1. TOP SYSTEM ALERT BANNER (Only shows if not configured) */}
      {!isConfigured && (
        <Box 
          sx={{ 
            bgcolor: 'warning.main', 
            color: 'warning.contrastText',
            py: 0.5, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'warning.dark' }
          }}
          onClick={() => navigate("/site-config")}
        >
          <FiAlertCircle size={14} />
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
            SYSTEM NOT CONFIGURED: CLICK HERE TO SETUP SITE
          </Typography>
        </Box>
      )}

      <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: 56, sm: 64 } }}>
        
        {/* Left Side: Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img src={log} alt="Logo" style={{ height: "32px", borderRadius: '4px' }} />
          <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, my: 'auto' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', display: { xs: 'none', md: 'block' } }}>
            {user?.role === "ADMIN" ? "Admin Dashboard" : `${user?.siteName}`}
          </Typography>
        </Box>

        {/* Right Side: Tools & Profile */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 } }}>
          
          {/* Settings Icon with Alert Badge */}
          <Tooltip title={isConfigured ? "Site Configuration" : "Action Required: Complete Setup"}>
            <IconButton 
              onClick={() => navigate("/site-config")} 
              sx={{ 
                color: !isConfigured ? 'warning.main' : 'text.primary',
                animation: !isConfigured ? `${softPulse} 2s infinite` : 'none'
              }}
            >
              <Badge color="error" variant="dot" invisible={isConfigured}>
                <SettingsSuggestIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
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