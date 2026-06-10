import { useEffect, useState } from "react";
import { fetchdevices, unicastDownlink } from "../services/User.service";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { 
  Box, Typography, Button, TextField, InputAdornment, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Pagination, IconButton, LinearProgress, useTheme, alpha,CircularProgress
} from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';
import SmartToyIcon from '@mui/icons-material/SmartToy'; 
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import toast, { Toaster } from "react-hot-toast";
//import { NearMe } from "@mui/icons-material";

function Devices() {
  const navigate = useNavigate();
  const theme = useTheme(); // Access the current theme
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetchdevices(limit, offset, search);
      setDevices(res.data.result || []);
    } catch (err) {
      console.error("Error fetching devices", err);
    } finally {
      setLoading(false);
    }
  };

  const sendDownLink = async (data: string, devEui: string, name: string) => {
    try {
      const result = await unicastDownlink(devEui, data,name);
      if (result?.data?.id) toast.success(`Command sent successfully to ${name}!`);
    } catch (err) {
      toast.error('Error sending command');
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchDevices(), 500);
    return () => clearTimeout(delay);
  }, [offset, search]);

  const getBatteryInfo = (voltageStr: string) => {
    const voltage = parseFloat(voltageStr) || 0;
    const percentage = Math.min((voltage / 30) * 100, 100);
    return {
      volts: voltage,
      percent: percentage,
      // Use theme colors for battery status
      color: percentage < 20 ? theme.palette.error.main : theme.palette.success.main
    };
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      <Toaster
  position="top-right"
  reverseOrder={false}
/>
      <Typography
  variant="h5"
  sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
>
  Robot Hub
</Typography>

<Typography
  variant="body2"
  sx={{ color: "text.secondary", mb: 3 }}
>
  Control your robots in real time
</Typography>

      <Box sx={{ mb: 4, maxWidth: 400 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search robots by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2, 
                bgcolor: "background.paper", // Use theme paper color
                "& fieldset": { borderColor: "divider" }
              }
            }
          }}
        />
      </Box>

      <TableContainer 
        component={Paper} 
        elevation={0} 
        sx={{ 
          border: "1px solid", 
          borderColor: "divider", 
          borderRadius: 3,
          bgcolor: "background.paper",
          backgroundImage: "none" 
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "action.hover" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>ROBOT / DEVEUI</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>LOCATION</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>BATTERY </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>LAST SEEN</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>STATUS</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", color: "text.primary" }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
               <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={40} thickness={4} sx={{ color: "primary.main" }} />
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          Synchronizing Fleet Data...
        </Typography>
      </Box>
    </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => {
                const battery = getBatteryInfo(device.batteryVoltage);
                const isOnline = device.isActive === "online";

                return (
                  <TableRow key={device.devEui} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SmartToyIcon sx={{ color: "primary.main" }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                            {device.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {device.devEui}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                      {device.description}
                    </TableCell>

                    <TableCell sx={{ minWidth: 140 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, width: 35, color: "text.primary" }}>
                          {device.batteryVoltage}V
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={battery.percent} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 5, 
                              bgcolor: "action.hover", 
                              "& .MuiLinearProgress-bar": { bgcolor: battery.color } 
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                      {formatDistanceToNow(new Date(device.lastSeenAt))} ago
                    </TableCell>

                    <TableCell>
                      <Box sx={{ 
                        display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, fontSize: "0.7rem", fontWeight: "bold",
                        // Dynamic background using alpha for better dark mode visibility
                        bgcolor: isOnline ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.error.main, 0.15),
                        color: isOnline ? theme.palette.success.main : theme.palette.error.main,
                        border: "1px solid",
                        borderColor: isOnline ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.error.main, 0.3)
                      }}>
                        {device.isActive.toUpperCase()}
                      </Box>
                    </TableCell>

                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Button size="small" variant="contained" color="success" onClick={() => sendDownLink("Ag==", device.devEui,device.name)} sx={{ fontSize: '10px' }}>Start</Button>
                        <Button size="small" variant="contained" color="error" onClick={() => sendDownLink("Aw==", device.devEui,device.name)} sx={{ fontSize: '10px' }}>Stop</Button>
                        <Button size="small" variant="outlined" onClick={() => sendDownLink("BA==", device.devEui,device.name)} sx={{ fontSize: '10px' }}>Return</Button>
                        
                        <IconButton size="small" color="warning" onClick={() => sendDownLink("BQ==", device.devEui,device.name)}>
                          <RestartAltIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton size="small" sx={{ color: "text.secondary" }} onClick={() => navigate(`/devices/${device.devEui}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderTop: "1px solid", borderColor: "divider" }}>
          <Pagination 
            count={devices.length === limit ? Math.floor(offset / limit) + 2 : Math.floor(offset / limit) + 1} 
            page={Math.floor(offset / limit) + 1}
            color="primary" 
            onChange={(_, page) => setOffset((page - 1) * limit)}
          />
        </Box>
      </TableContainer>
    </Box>
  );
}

export default Devices;