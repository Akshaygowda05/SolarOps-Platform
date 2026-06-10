import  { useEffect, useState } from "react";
import { fetchGroup, fetchBattery } from "../services/User.service";
import { 
  Box, Typography, MenuItem, Select, FormControl, 
  InputLabel, Grid, Card, CircularProgress, useTheme, alpha 
} from "@mui/material";
import Alert from '@mui/material/Alert';


const BatteryPages = () => {
  const theme = useTheme(); // Access the current theme settings
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [batteries, setBatteries] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
 // const [defaultFroupId ,setDefaultFroupId] = useState("")

 useEffect(() => {
  if (selectedGroup) {
    fetchBatteries(selectedGroup);
  }
}, [selectedGroup]);

useEffect(() => {
  fetchGroupsForBattery();
}, []);


  const fetchGroupsForBattery = async () => {
  try {
    const res = await fetchGroup();
    const groupData = res.data.result;

    let storedId = sessionStorage.getItem("selectedBatteryGroupId");

    if(groupData.length<0){
<Alert>no devices found in this group</Alert>
    }

    // If no stored ID OR it's invalid → fallback to first group
    if (!storedId || !groupData.some((g: any) => g.id === storedId)) {
      storedId = groupData[0]?.id;
      sessionStorage.setItem("selectedBatteryGroupId", storedId!);
    }

    setGroups(groupData);
    setSelectedGroup(storedId!);

  } catch (err) {
    console.error(err);
  }
};

  const updateGroupSelection = (id: string) => {
    setSelectedGroup(id);
    sessionStorage.setItem("selectedBatteryGroupId", id);
  
  };

  const fetchBatteries = async (groupId: string) => {
    setLoading(true);
    try {
      const res = await fetchBattery(groupId);
      setBatteries(res.data.batteries || {});
    } catch (err) { setBatteries({}); }
    setLoading(false);
  };

  const getStatus = (voltage: number | undefined | null, lastSeen?: string) => {
    const now = new Date().getTime();
    const last = new Date(lastSeen ? lastSeen : 0).getTime();
    const minutesAgo = last ? (now - last) / (1000 * 60) : Infinity;
    const isOffline = minutesAgo > 30;

    if (isOffline) return { label: "Offline", color: theme.palette.text.disabled };

    // Handle missing or non-numeric voltage
    if (!Number.isFinite(Number(voltage))) {
      return { label: "Unknown", color: theme.palette.text.secondary };
    }

    const v = Number(voltage);
    if (v >= 22) return { label: "Normal", color: theme.palette.success.main };
    if (v >= 17) return { label: "Warning", color: theme.palette.warning.main };
    return { label: "Critical", color: theme.palette.error.main };
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "background.default" }}>
      
      {/* Dynamic Title */}
      <Typography
  variant="h5"
  sx={{ mb: 4, fontWeight: 700, color: "text.primary" }}
>
  Battery Status of{" "}
  <Box
    component="span"
    sx={{ color: "warning.main" }}
  >
    {groups.find(g => g.id === selectedGroup)?.name || "Select Group"}
  </Box>
</Typography>

      <FormControl sx={{ minWidth: 250, mb: 4 }} size="small">
        <InputLabel sx={{ color: "text.secondary" }}>Fleet Group</InputLabel>
        <Select
          value={selectedGroup}
          label="Fleet Group"
          onChange={(e) => updateGroupSelection(e.target.value as string)}
          sx={{ 
            bgcolor: "background.paper",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }
          }}
        >
          {groups.map(group => (
            <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {Object.entries(batteries).map(([devEui, data]) => {
            const rawLevel = data?.batteryLevel;
            const parsed = rawLevel === null || rawLevel === undefined ? NaN : parseFloat(String(rawLevel));
            const voltage = Number.isFinite(parsed) ? parsed : NaN;
            const status = getStatus(voltage, data?.lastSeen);

            
            const percentage = Number.isFinite(voltage)
              ? Math.min(Math.max(((voltage - 12) / (28 - 12)) * 100, 5), 100)
              : 5; // show a minimal bar for unknown values

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={devEui}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: "background.paper", 
                    borderColor: "divider",
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', borderColor: "primary.main" }
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {data.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    ID: {devEui}
                  </Typography>

                  {/* The Battery Gauge Icon */}
                  <Box sx={{ 
                    width: 45, height: 22, 
                    border: '1.5px solid', 
                    borderColor: "text.primary", 
                    borderRadius: '3px', 
                    position: 'relative', mb: 1.5, p: '2px',
                    '&::after': { 
                      content: '""', position: 'absolute', right: -5, top: 4.5, 
                      width: 3, height: 8, bgcolor: "text.primary", borderRadius: '0 1px 1px 0' 
                    }
                  }}>
                    <Box sx={{ 
                      width: `${percentage}%`, height: '100%', 
                      bgcolor: status.color, 
                      borderRadius: '1px',
                      transition: '0.5s width' 
                    }} />
                  </Box>

                  {/* Status and Voltage Label */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: status.color, fontWeight: 700 }}>
                        {Number.isFinite(voltage) ? `${voltage.toFixed(1)} V` : 'N/A'}
                      </Typography>
                    <Box 
                      sx={{ 
                        px: 1, py: 0.2, borderRadius: 0.5, 
                        bgcolor: alpha(status.color, 0.1),
                        border: '1px solid', borderColor: alpha(status.color, 0.2)
                      }}
                    >
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: status.color, textTransform: 'uppercase' }}>
                        {status.label}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default BatteryPages;