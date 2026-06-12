import { useEffect, useState } from "react";
import { fetchGroup, multicastDownlink, fetchSchedularData, deleteSchedular, createSchedular } from "../services/User.service";
import type {  SchedularData } from "../utils/interfaces";
import {
  Box, Typography, Button, Checkbox, Paper,
  List, ListItem, ListItemButton, ListItemText, ListItemIcon, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, alpha
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import toast, { Toaster } from "react-hot-toast";

const BRAND = "#169647";
const BRAND_LIGHT = alpha("#169647", 0.10);
const BRAND_DARK = "#0f7035";

const DATA_LABEL_MAP: Record<string, { label: string; color: "success" | "error" | "default" | "warning" }> = {
  "Ag==": { label: "Start",  color: "success" },
  "Aw==": { label: "Stop",   color: "error"   },
  "BA==": { label: "Return", color: "default" },
  "BQ==": { label: "Reboot", color: "warning" },
};

/* ─── tiny keyframe injected once ─── */
const ANIM_STYLE = `
@keyframes mcFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes mcPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(22,150,71,0.35); }
  50%       { box-shadow: 0 0 0 6px rgba(22,150,71,0);  }
}
.mc-row-enter { animation: mcFadeUp 0.22s ease both; }
`;

const MulticastControl = () => {
  const [groups,       setGroups]       = useState<any[]>([]);
  const [selected,     setSelected]     = useState<{ id: string; name: string }[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [getSchedule,  setGetSchedule]  = useState<any>(null);

  const [actionModalOpen,    setActionModalOpen]    = useState(false);
  const [viewSchedulersOpen, setViewSchedulersOpen] = useState(false);

  const [currentData,    setCurrentData]    = useState("");
  const [executionType,  setExecutionType]  = useState<"instant" | "schedule">("instant");
  const [jobType,        setJobType]        = useState<"DAILY" | "ONE_TIME">("DAILY");
  const [scheduleTime,   setScheduleTime]   = useState("");

  /* ── data fetchers ── */
  const fetchSchedule = async () => {
    try {
      const res = await fetchSchedularData();
      const arrayData = Array.isArray(res) ? res : res?.data || [];
      setGetSchedule({ data: arrayData });
    } catch (err) {
      console.error("Failed to fetch schedule data", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetchGroup();
      setGroups(res.data.result || []);
    } catch (err) {
      toast.error("Failed to load blocks");
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchSchedule();
    const style = document.createElement("style");
    style.textContent = ANIM_STYLE;
    document.head.appendChild(style);
  }, []);

  /* ── delete ── */
  const deleteSchedule = async (id: number) => {
    try {
      await deleteSchedular(id);
      toast.success("Schedule deleted successfully");
      fetchSchedule();
    } catch {
      toast.error("Failed to delete schedule");
    }
  };

  /* ── open action modal ── */
  const handleActionClick = (dataPayload: string) => {
    if (selected.length === 0) return toast.error("Select at least one block first");
    setCurrentData(dataPayload);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setScheduleTime(now.toISOString().slice(11, 16));
    setActionModalOpen(true);
  };

  /* ── confirm ── */
  const handleConfirmAction = async () => {
    if (executionType === "instant") {
      try {
        setLoading(true);
        await toast.promise(
          multicastDownlink(selected.map(g => g.id), selected.map(g => g.name), currentData),
          { loading: "Sending command…", success: "Command sent!", error: "Failed to send" }
        );
        setSelected([]);
        setActionModalOpen(false);
      } finally {
        setLoading(false);
      }
    } else {
      if (!scheduleTime) return toast.error("Please set an execution time");
      const [hours, minutes] = scheduleTime.split(":").map(Number);
      const t = new Date();
      t.setHours(hours, minutes, 0, 0);
      if (t <= new Date()) t.setDate(t.getDate() + 1);

      const payload: SchedularData = {
        time: t.toISOString().replace(".000", ""),
        jobType,
        groups: selected.map(g => ({ id: g.id, name: g.name })),
        data: currentData,
      };
      try {
        setLoading(true);
        await createSchedular(payload);
        toast.success("Schedule created!");
        fetchSchedule();
        setSelected([]);
        setActionModalOpen(false);
      } catch {
        toast.error("Failed to create schedule");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSelect = (id: string, name: string) =>
    setSelected(prev =>
      prev.some(g => g.id === id) ? prev.filter(g => g.id !== id) : [...prev, { id, name }]
    );

  /* ── command buttons config ── */
  const commands = [
    { key: "Ag==", label: "Start",  icon: <PlayArrowRoundedIcon />,         variant: "contained" as const, color: BRAND,     hoverColor: BRAND_DARK },
    { key: "Aw==", label: "Stop",   icon: <StopRoundedIcon />,              variant: "contained" as const, color: "#d32f2f", hoverColor: "#b71c1c" },
    { key: "BA==", label: "Return", icon: <ReplayRoundedIcon />,            variant: "outlined"  as const, color: BRAND,     hoverColor: BRAND_DARK },
    { key: "BQ==", label: "Reboot", icon: <PowerSettingsNewRoundedIcon />,  variant: "outlined"  as const, color: "#ed6c02", hoverColor: "#e65100" },
  ];

  const scheduleCount = getSchedule?.data?.length ?? 0;
  const cmdInfo = DATA_LABEL_MAP[currentData];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 600, mx: "auto" }}>
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ style: { borderRadius: 10, fontSize: 14 } }} />

      {/* ── Header ── */}
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }} >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
            Block Wise Control
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {selected.length > 0
              ? `${selected.length} block${selected.length > 1 ? "s" : ""} selected`
              : "Select blocks to send commands"}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<CalendarTodayRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setViewSchedulersOpen(true)}
          sx={{
            borderRadius: 2,
            borderColor: BRAND,
            color: BRAND,
            textTransform: "none",
            fontWeight: 500,
            fontSize: 13,
            px: 5,
            marginLeft: 30,
            "&:hover": { borderColor: BRAND_DARK, bgcolor: BRAND_LIGHT },
          }}
        >
          Schedulers
          {scheduleCount > 0 && (
            <Box component="span" sx={{
              ml: 0.8, display: "inline-flex", alignItems: "center", justifyContent: "center",
              bgcolor: BRAND, color: "#fff", borderRadius: "50%",
              width: 20, height: 18, fontSize: 11, fontWeight: 700,
            }}>
              {scheduleCount}
            </Box>
          )}
        </Button>
      </Stack>

      {/* ── Block List ── */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 3,
          overflow: "hidden",
          borderColor: "divider",
          bgcolor: "background.paper",
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: `0 0 0 1.5px ${alpha(BRAND, 0.25)}` },
        }}
      >
        {groups.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">No blocks available</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {groups.map((group, idx) => {
              const isSelected = selected.some(g => g.id === group.id);
              return (
                <ListItem
                  key={group.id}
                  disablePadding
                  divider={idx < groups.length - 1}
                  sx={{
                    animation: `mcFadeUp 0.2s ease ${idx * 0.04}s both`,
                    bgcolor: isSelected ? BRAND_LIGHT : "transparent",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <ListItemButton
                    onClick={() => toggleSelect(group.id, group.name)}
                    sx={{ py: 1.2, px: 2, "&:hover": { bgcolor: isSelected ? alpha(BRAND, 0.14) : undefined } }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox
                        checked={isSelected}
                        disableRipple
                        size="small"
                        sx={{
                          p: 0,
                          color: "text.disabled",
                          "&.Mui-checked": { color: BRAND },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: isSelected ? BRAND : "text.primary" , fontWeight: isSelected ? 600 : 500 }}>
                          {group.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {group.region || "No region assigned"}
                        </Typography>
                      }
                    />
                    {isSelected && (
                      <Box sx={{
                        width: 8, height: 8, borderRadius: "50%", bgcolor: BRAND,
                        animation: "mcPulse 1.6s ease infinite",
                      }} />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      {/* ── Command Buttons ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        {commands.map(({ key, label, icon, variant, color, hoverColor }) => (
          <Button
            key={key}
            variant={variant}
            startIcon={icon}
            onClick={() => handleActionClick(key)}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              py: 1.1,
              letterSpacing: "0.1px",
              transition: "all 0.18s ease",
              ...(variant === "contained"
                ? {
                    bgcolor: color,
                    color: "#fff",
                    boxShadow: "none",
                    "&:hover": { bgcolor: hoverColor, boxShadow: `0 4px 12px ${alpha(color, 0.4)}`, transform: "translateY(-1px)" },
                    "&:active": { transform: "translateY(0)" },
                  }
                : {
                    borderColor: color,
                    color: color,
                    "&:hover": { borderColor: hoverColor, bgcolor: alpha(color, 0.07), color: hoverColor },
                  }),
            }}
          >
            {label}
          </Button>
        ))}
      </Box>

      {/* ════════════════════════════════════════
          MODAL 1 — Execute Command
      ════════════════════════════════════════ */}
 <Dialog
  open={actionModalOpen}
  onClose={() => setActionModalOpen(false)}
  fullWidth
  maxWidth="xs"
  slotProps={{
    paper: {
      sx: {
        borderRadius: 3,
        bgcolor: "background.paper",
        backgroundImage: "none",
      },
    },
    transition: {
      style: { 
        transition: "all 0.2s ease" 
      },
    },
  }}
>

        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              bgcolor: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {commands.find(c => c.key === currentData)?.icon &&
                <Box sx={{ color: BRAND, display: "flex" }}>
                  {commands.find(c => c.key === currentData)?.icon}
                </Box>
              }
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Execute Command
              </Typography>
              {cmdInfo && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Action: <b style={{ color: BRAND }}>{cmdInfo.label}</b>
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Execution Mode"
              value={executionType}
              onChange={(e) => setExecutionType(e.target.value as "instant" | "schedule")}
              fullWidth
              size="small"
              sx={selectSx}
            >
              <MenuItem value="instant">⚡ Send Now</MenuItem>
              <MenuItem value="schedule">🕐 Schedule</MenuItem>
            </TextField>

            {executionType === "schedule" && (
              <>
                <TextField
                  select
                  label="Recurrence"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as "DAILY" | "ONE_TIME")}
                  fullWidth
                  size="small"
                  sx={selectSx}
                >
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="ONE_TIME">One Time</MenuItem>
                </TextField>

                <TextField
                  label="Execution Time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  fullWidth
                  size="small"
                 slotProps={{
    inputLabel: {
      shrink: true,
    },}}
                  sx={selectSx}
                />
              </>
            )}

            {/* Selected blocks preview */}
            {selected.length > 0 && (
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: BRAND_LIGHT, border: `1px solid ${alpha(BRAND, 0.2)}` }}>
                <Typography variant="caption" sx={{ color: BRAND, fontWeight: 600, display: "block", mb: 0.5 }}>
                  Target Blocks
                </Typography>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.6 }}>
                  {selected.map(g => (
                    <Chip key={g.id} label={g.name} size="small" sx={{
                      fontSize: 11, height: 22,
                      bgcolor: alpha(BRAND, 0.15), color: BRAND_DARK,
                      fontWeight: 600, border: "none",
                    }} />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setActionModalOpen(false)}
            color="inherit"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: BRAND,
              boxShadow: "none",
              "&:hover": { bgcolor: BRAND_DARK, boxShadow: `0 4px 12px ${alpha(BRAND, 0.4)}` },
              "&.Mui-disabled": { bgcolor: alpha(BRAND, 0.3), color: "#fff" },
            }}
          >
            {loading ? "Running…" : "Confirm & Run"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════════════════════════════
          MODAL 2 — View Schedulers
      ════════════════════════════════════════ */}
      <Dialog
        open={viewSchedulersOpen}
        onClose={() => setViewSchedulersOpen(false)}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: { borderRadius: 3, bgcolor: "background.paper", backgroundImage: "none" },
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                bgcolor: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: BRAND }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Active Schedulers
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {scheduleCount} task{scheduleCount !== 1 ? "s" : ""} scheduled
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {getSchedule?.data?.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(BRAND, 0.05) }}>
                    {["ID", "Block(s)", "Command", "Recurrence", "Scheduled At", ""].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: "text.secondary", py: 1.2 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getSchedule.data.map((sched: any, idx: number) => {
                    const info = DATA_LABEL_MAP[sched.data];
                    return (
                      <TableRow
                        key={sched.id}
                        hover
                        className="mc-row-enter"
                        style={{ animationDelay: `${idx * 0.04}s` }}
                        sx={{ "&:last-child td": { border: 0 } }}
                      >
                        <TableCell sx={{ color: "text.secondary", fontSize: 12 }}>#{sched.id}</TableCell>
                        <TableCell sx={{ maxWidth: 180, fontSize: 13 }}>
                          <Typography variant="body2" sx={{ wordBreak: "break-word", lineHeight: 1.4 }}>
                            {sched.groupName?.length > 0 ? sched.groupName.join(", ") : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={info?.label ?? sched.data}
                            size="small"
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              height: 22,
                              ...(info?.color === "success" && { bgcolor: alpha(BRAND, 0.12), color: BRAND_DARK }),
                              ...(info?.color === "error"   && { bgcolor: alpha("#d32f2f", 0.1), color: "#b71c1c" }),
                              ...(info?.color === "warning" && { bgcolor: alpha("#ed6c02", 0.1), color: "#e65100" }),
                              ...(info?.color === "default" && { bgcolor: "action.selected", color: "text.secondary" }),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{
                            fontWeight: 600,
                            color: sched.jobType === "DAILY" ? BRAND : "text.secondary",
                          }}>
                            {sched.jobType}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
                          {new Date(sched.time).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => deleteSchedule(sched.id)}
                            sx={{
                              color: "text.disabled",
                              borderRadius: 1.5,
                              "&:hover": { color: "#d32f2f", bgcolor: alpha("#d32f2f", 0.08) },
                              transition: "all 0.15s ease",
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ py: 7, textAlign: "center" }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: 3,
                bgcolor: BRAND_LIGHT, display: "flex", alignItems: "center",
                justifyContent: "center", mx: "auto", mb: 2,
              }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 22, color: BRAND }} />
              </Box>
              <Typography variant="body2" color="text.secondary">No schedulers configured yet</Typography>
              <Typography variant="caption" color="text.disabled">Create one using the command buttons above</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setViewSchedulersOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              borderColor: BRAND,
              color: BRAND,
              "&:hover": { borderColor: BRAND_DARK, bgcolor: BRAND_LIGHT },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* shared select field override */
const selectSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: BRAND },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: BRAND },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: BRAND },
};

export default MulticastControl;