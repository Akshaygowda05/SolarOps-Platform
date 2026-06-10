import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
 Grid, 
  Card, 
  Typography, 
  Divider, 
  CircularProgress, 
  Chip, 
  Stack, 
  Button, 
  useTheme, 
  alpha 
} from '@mui/material';

// Icons
import SensorsIcon from '@mui/icons-material/Sensors';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/RestartAlt';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { fetchDataofRobot } from '../services/User.service';

interface DataRowProps {
  label: string;
  value: string | number;
  isBold?: boolean;
}

const DeviceDetail = () => {
  const theme = useTheme(); 
  const { devEui } = useParams<{ devEui: string }>();
  const [deviceData, setDeviceData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDeviceData = async (eui: string) => {
    try {
      setLoading(true);
      const response = await fetchDataofRobot(eui);
      setDeviceData(response.data);
    } catch (error) {
      console.error("Error fetching device data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (devEui) fetchDeviceData(devEui);
  }, [devEui]);

  const getValue = (ch: string): string => deviceData?.[ch] ?? "0";

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!devEui || !deviceData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default', minHeight: '100vh' }}>
        <Typography variant="h5" color="error">Device Not Found</Typography>
        <Typography color="text.secondary">No data received for EUI: {devEui}</Typography>
      </Box>
    );
  }

  const isOnline = true; 

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      {/* --- HEADER --- */}
      <Stack
        direction="row"
        sx={{ mb: 4, justifyContent: 'space-between', alignItems: 'center' }}
      >
        {/* LEFT SIDE */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip
              label={isOnline ? "ONLINE" : "OFFLINE"}
              size="small"
              sx={{
                bgcolor: isOnline ? "success.main" : "error.main",
                color: "#000",
                fontWeight: "bold",
                borderRadius: "4px",
              }}
            />
          </Stack>

          <Typography variant="h3" sx={{ fontWeight: 800, color: "text.primary" }}>
            {deviceData?.robotName}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontWeight: 600 }}
          >
            ID: {devEui}
          </Typography>
        </Box>

        {/* RIGHT SIDE */}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchDeviceData(devEui)}
          size="small"
          sx={{
            color: "text.primary",
            borderColor: "divider",
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            bgcolor: "background.paper",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          Refresh Data
        </Button>
      </Stack>

      <Grid container spacing={3}>
        
        {/* --- CORE IDENTIFICATION --- */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.disabled', mb: 2, display: 'block' }}>CORE IDENTIFICATION</Typography>
            <Stack spacing={2}>
              <DataRow label="Robot ID :" value={`${getValue("CH1")}`} />
              <DataRow label="Position :" value={`${getValue("CH9")}m`} />
              <DataRow label="Brush Motor current :" value={getValue("CH11")} />
              <DataRow label="Upper Drive motor Current :" value={`${getValue("CH12")}`} />
              <DataRow label="Lower Drive motor Current :" value={`${getValue("CH13")}`} />
            </Stack>
          </Card>
        </Grid>

        {/* --- ENERGY MANAGEMENT --- */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.disabled' }}>ENERGY MANAGEMENT</Typography>
            <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
              <Grid size={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={Number(getValue("CH4"))} 
                    size={160} 
                    thickness={4} 
                    sx={{ color: 'primary.main' }} 
                  />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>{getValue("CH4")}%</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>CHARGE</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">Battery Voltage</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{getValue("CH5")} <small style={{fontSize: 16}}>V</small></Typography>
                
                <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Current Draw</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{getValue("CH14")}A</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Cycles</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{getValue("CH6")}</Typography>
                  </Box>
                </Stack>
                <Box sx={{ mt: 3, height: 6, width: '100%', bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Box sx={{ height: '100%', width: `${getValue("CH4")}%`, bgcolor: 'primary.main', borderRadius: 1 }} />
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* --- SIGNAL --- */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.disabled' }}>SIGNAL & STATUS</Typography>
            <Stack direction="row" sx={{ mt: 2, justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>{deviceData.rssi} <small style={{fontSize: 14}}>dBm</small></Typography>
                  <Typography variant="caption" color="text.secondary">Signal Strength</Typography>
                </Box>
                <SensorsIcon sx={{ color: 'success.main', fontSize: 32 }} />
            </Stack>
            <Divider sx={{ my: 2 }} />
            <DataRow label="Core Temp : " value={`${getValue("CH17")}°C`} />
            <DataRow label="SNR :" value={`${deviceData.snr} dB`} />
            <Box sx={{ 
              mt: 2, p: 1, 
              bgcolor: alpha(theme.palette.success.main, 0.1), 
              borderRadius: 1, 
              borderLeft: '4px solid',
              borderColor: 'success.main',
              display: 'flex', alignItems: 'center', gap: 1 
            }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>STATUS NOMINAL</Typography>
            </Box>
          </Card>
        </Grid>

        {/* --- MOTION --- */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.disabled' }}>MOTION METRICS</Typography>
            <Grid container sx={{ mt: 2 }}>
              <Grid size={6}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>{Number(getValue("CH10")).toLocaleString()}</Typography>
                    <Typography variant="caption" color="text.secondary">Total Odometer (meters)</Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={3}>
                 <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                   <PlayCircleIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }}/>{getValue("CH15")}
                 </Typography>
                 <Typography variant="caption" color="text.secondary">Auto Runs</Typography>
              </Grid>
              <Grid size={3}>
                 <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                   <SettingsBackupRestoreIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }}/>{getValue("CH16")}
                 </Typography>
                 <Typography variant="caption" color="text.secondary">Manual Runs</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* --- INCLINOMETER --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.disabled' }}>INCLINOMETER</Typography>
            <Stack
              direction="row"
              spacing={3}
              sx={{ mt: 2, alignItems: 'center' }}
            >
              {/* Indicator */}
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    width: "80%",
                    height: 2,
                    bgcolor: "text.primary",
                    transform: `rotate(${Number(getValue("CH8") || 0)}deg)`,
                    transition: "transform 0.2s ease-in-out",
                  }}
                />
              </Box>

              {/* Data */}
              <Box sx={{ flexGrow: 1 }}>
                <DataRow
                  label="PITCH"
                  value={`${Number(getValue("CH8") || 0)}°`}
                  isBold
                />
                <DataRow label="ROLL" value="-1.8°" />
              </Box>
            </Stack>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

const DataRow = ({ label, value, isBold = false }: DataRowProps) => (
  <Stack direction="row" sx={{ py: 0.5, justifyContent: 'space-between' }}>
    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: isBold ? 800 : 700, color: 'text.primary' }}>{value}</Typography>
  </Stack>
);

export default DeviceDetail;