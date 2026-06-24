import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Card, CardContent,  Grid, MenuItem, Select,
  FormControl, InputLabel, TextField, Button, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Stack, 
  alpha, useTheme, Divider, Chip, Skeleton
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import PublicIcon from '@mui/icons-material/Public';
import { fetchMulticastGroups, fetchReports, fetchSummary } from "../services/User.service";

// FIX: Ensure this returns a string, not an array reference
const getToday = (): string => new Date().toISOString().split("T")[0];

interface Group { id: string; name: string; }
interface RobotReport { deviceName: string; totalPanelsCleaned: number; location: string; }

function Report() {
  const theme = useTheme();

  // Filter & UI States
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(getToday());
  const [endDate, setEndDate] = useState<string>(getToday());
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [robotData, setRobotData] = useState<Record<string, RobotReport>>({});
  const [blockTotal, setBlockTotal] = useState<number>(0);
  const [siteSummary, setSiteSummary] = useState({ totalPanels: 0, totalRobots: 0 });

  // 1. Data Fetching Logic
  const fetchData = useCallback(async (groupId: string, start: string, end: string) => {
    if (!groupId || !start) return;
    setLoading(true);
    setError(null);
    try {
      const [reportRes, summaryRes] = await Promise.all([
        fetchReports(groupId, start, end),
        fetchSummary(start, end).catch(() => null)
      ]);

      const rawReport = reportRes?.data || {};
      const robots: Record<string, RobotReport> = {};
      let blockSum = 0;

      // Extract Block Specific Data safely
      Object.entries(rawReport).forEach(([key, value]) => {
        if (key === "totalPanelsCleaned") blockSum = value as number;
        else if (value && typeof value === 'object') robots[key] = value as RobotReport;
      });

      // Extract Global Site Data
      const sData = summaryRes?.data?.totalRobots;
      
      setRobotData(robots);
      setBlockTotal(blockSum);
      setSiteSummary({
        totalPanels: sData?.totalPanelsCleaned || 0,
        totalRobots: sData?.totalRobots || 0
      });
    } catch (err: any) {
      setError("Failed to synchronize site data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Initialization & Refresh Persistence
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchMulticastGroups();
        const groupList: Group[] = res?.data?.result || [];
        setGroups(groupList);

        // Check if user was previously on a specific block
        const storedId = sessionStorage.getItem("selectedGroupIdForReport");
        
        // FIX: target index [0] instead of groupList.id layout
        const idToLoad = storedId || (groupList.length > 0 ? groupList[0].id : "");

        if (idToLoad) {
          setSelectedGroup(idToLoad);
          if (!storedId) sessionStorage.setItem("selectedGroupIdForReport", idToLoad);
          fetchData(idToLoad, startDate, endDate);
        }
      } catch (err) { 
        setError("System initialization failed."); 
      }
    };
    init();
  }, [fetchData, startDate, endDate]);

  // 3. Selection Handlers
  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    sessionStorage.setItem("selectedGroupIdForReport", groupId);
    fetchData(groupId, startDate, endDate);
  };

  const handleDownload = async () => {
    setDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Smooth UX delay
    
    const rows = [
      ["--- ASSET PERFORMANCE REPORT ---"],
      ["Selected Block", groups.find(g => g.id === selectedGroup)?.name || selectedGroup],
      ["Period", `${startDate} to ${endDate}`],
      [""],
      ["Robot ID", "Location", "Panels Cleaned"],
      ...Object.values(robotData).map(r => [r.deviceName, r.location, r.totalPanelsCleaned]),
      [""],
      ["BLOCK SPECIFIC TOTAL", "", blockTotal],
      ["GLOBAL SITE TOTAL", "", siteSummary.totalPanels]
    ];
    
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Performance_Report_${startDate}.csv`;
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      maxWidth: "1400px", 
      margin: "0 auto", 
      bgcolor: "background.default", 
      minHeight: "100vh",
      color: "text.primary"
    }}>
      
      {/* TOP HEADER */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        sx={{ justifyContent: "space-between", alignItems: "center", mb: 5 }} 
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ letterSpacing: '-1.5px', fontWeight: 400 }}>
            Robot Cleaning Analytics
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Autonomous Cleaning & Performance Monitoring
          </Typography>
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
              {error}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={downloading ? <CheckCircleIcon /> : <DownloadIcon />}
          onClick={handleDownload}
          disabled={loading || Object.keys(robotData).length === 0}
          sx={{ 
            borderRadius: "8px",
            px: 2,          
            py: 0.75,
            transition: 'all 0.3s ease',
            bgcolor: downloading ? 'success.main' : 'primary.main'
          }}
        >
          {downloading ? "Preparing CSV..." : "Export Site Data"}
        </Button>
      </Stack>

      {/* FILTERS */}
      <Card sx={{ mb: 5, borderRadius: 4, bgcolor: "background.paper", border: '1px solid', borderColor: 'divider', backgroundImage: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="active-block-label">Active Block</InputLabel>
                <Select 
                  labelId="active-block-label"
                  value={selectedGroup} 
                  label="Active Block" 
                  onChange={(e) => handleGroupChange(e.target.value)} 
                  disabled={loading}
                >
                  {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, md: 2.5 }}>
              <TextField fullWidth size="small" type="date" label="Start Date" slotProps={{ inputLabel: { shrink: true } }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6, md: 2.5 }}>
              <TextField fullWidth size="small" type="date" label="End Date" slotProps={{ inputLabel: { shrink: true } }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', gap: 2 }}>
              <Button fullWidth variant="outlined" size="medium" onClick={() => fetchData(selectedGroup, startDate, endDate)} disabled={loading} sx={{ borderRadius: "8px", height: '40px' }}>
                Apply 
              </Button>
              <Button fullWidth variant="outlined" size="medium" onClick={() => { window.location.reload(); }} disabled={loading} sx={{ borderRadius: "8px", height: '40px' }}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KPI DASHBOARD */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {/* Block Performance */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.28)}`,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -24,
              right: -24,
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)',
              pointerEvents: 'none',
            }
          }}>
            <CardContent sx={{ p: '18px 20px !important' }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.75, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Panels Cleaned by {groups.find(g => g.id === selectedGroup)?.name || "Current Block"}
                  </Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" height={34} width={100} sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1, mt: 0.75 }} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.5, letterSpacing: '-1px' }}>
                      {blockTotal.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.72rem', mt: 0.5, display: 'block' }}>
                    Panels cleaned in selected group
                  </Typography>
                </Box>
                <Box sx={{
                  width: 38, height: 38, borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, mt: 0.25
                }}>
                  <CleaningServicesIcon sx={{ fontSize: 20 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Global Site Performance */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{
            borderRadius: 3,
            bgcolor: "background.paper",
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -24,
              right: -24,
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: alpha(theme.palette.info.main, 0.06),
              pointerEvents: 'none',
            }
          }}>
            <CardContent sx={{ p: '18px 20px !important' }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Total Site Modules
                  </Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" height={34} width={100} sx={{ borderRadius: 1, mt: 0.75 }} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.5, letterSpacing: '-1px' }}>
                      {siteSummary.totalPanels.toLocaleString()}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', mt: 0.5, display: 'block' }}>
                    Combined output across all blocks
                  </Typography>
                </Box>
                <Box sx={{
                  width: 38, height: 38, borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, mt: 0.25
                }}>
                  <PublicIcon sx={{ fontSize: 20, color: 'info.main' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Fleet Count */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{
            borderRadius: 3,
            bgcolor: "background.paper",
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -24,
              right: -24,
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: alpha(theme.palette.success.main, 0.06),
              pointerEvents: 'none',
            }
          }}>
            <CardContent sx={{ p: '18px 20px !important' }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Active Robots
                  </Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" height={34} width={80} sx={{ borderRadius: 1, mt: 0.75 }} />
                  ) : (
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 0.5, letterSpacing: '-1px' }}>
                      {siteSummary.totalRobots}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem', mt: 0.5, display: 'block' }}>
                    Total Robots runned 
                  </Typography>
                </Box>
                <Box sx={{
                  width: 38, height: 38, borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, mt: 0.25
                }}>
                  <PrecisionManufacturingIcon sx={{ fontSize: 20, color: 'success.main' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DETAILED LOGS */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Divider />
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.4) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Robot Identifier</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Deployment Zone</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Module Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton width="70%" /></TableCell>
                  <TableCell><Skeleton width="50%" /></TableCell>
                  <TableCell align="right"><Skeleton width="40%" sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : Object.keys(robotData).length === 0 ? (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 10, color: 'text.disabled' }}>No telemetry data received for this period.</TableCell></TableRow>
            ) : (
              Object.entries(robotData).map(([id, robot]) => (
                <TableRow key={id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{robot.deviceName}</TableCell>
                  <TableCell><Chip label={robot.location} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontWeight: 500 }} /></TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 800, color: 'primary.main' }}>{robot.totalPanelsCleaned.toLocaleString()}</Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Report;