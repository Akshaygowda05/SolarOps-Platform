import { useEffect, useState } from "react";
import { fetchGroup, multicastDownlink, fetchSchedularData, deleteSchedular, createSchedular } from "../services/User.service";
import type { SchedularData } from "../utils/interfaces";
import {
  Box, Typography, Button, Paper,
  Stack, Checkbox, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, alpha, Badge,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import toast, { Toaster } from "react-hot-toast";

const BRAND      = "#169647";
const BRAND_LIGHT = alpha("#169647", 0.08);
const BRAND_DARK  = "#0f7035";

const DATA_LABEL_MAP: Record<string, { label: string; color: "success" | "error" | "default" | "warning" }> = {
  "Ag==": { label: "Start",  color: "success" },
  "Aw==": { label: "Stop",   color: "error"   },
  "BA==": { label: "Return", color: "default" },
  "BQ==": { label: "Reboot", color: "warning" },
};

const ANIM_STYLE = `
@keyframes mcFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0);   }
}
`;

const MulticastControl = () => {
  const [groups,      setGroups]      = useState<any[]>([]);
  const [selected,    setSelected]    = useState<{ id: string; name: string }[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [getSchedule, setGetSchedule] = useState<any>(null);

  const [actionModalOpen,    setActionModalOpen]    = useState(false);
  const [viewSchedulersOpen, setViewSchedulersOpen] = useState(false);

  const [currentData,   setCurrentData]   = useState("");
  const [executionType, setExecutionType] = useState<"instant" | "schedule">("instant");
  const [jobType,       setJobType]       = useState<"DAILY" | "ONE_TIME">("DAILY");
  const [scheduleTime,  setScheduleTime]  = useState("");

  /* ── fetchers ── */
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
    } catch {
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

  /* ── select all ── */
  const allSelected  = groups.length > 0 && selected.length === groups.length;
  const someSelected = selected.length > 0 && selected.length < groups.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(groups.map(g => ({ id: g.id, name: g.name })));
    }
  };

  const toggleSelect = (id: string, name: string) =>
    setSelected(prev =>
      prev.some(g => g.id === id) ? prev.filter(g => g.id !== id) : [...prev, { id, name }]
    );

  /* ── delete scheduler ── */
  const deleteSchedule = async (id: number) => {
    try {
      await deleteSchedular(id);
      toast.success("Schedule deleted");
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

  const commands = [
    { key: "Ag==", label: "Start Now",       icon: <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />,        color: BRAND,      hoverColor: BRAND_DARK },
    { key: "Aw==", label: "Stop Now",        icon: <StopRoundedIcon sx={{ fontSize: 18 }} />,             color: "#d32f2f",  hoverColor: "#b71c1c"  },
    { key: "BA==", label: "Return to Dock",  icon: <ReplayRoundedIcon sx={{ fontSize: 18 }} />,           color: "#455a64",  hoverColor: "#263238"  },
    { key: "BQ==", label: "Reboot",          icon: <PowerSettingsNewRoundedIcon sx={{ fontSize: 18 }} />, color: "#ed6c02",  hoverColor: "#e65100"  },
  ];

  const scheduleCount = getSchedule?.data?.length ?? 0;
  const cmdInfo = DATA_LABEL_MAP[currentData];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        p: { xs: 2, sm: 3 },
        maxWidth: 900,
        mx: "auto",
      }}
    >
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ style: { borderRadius: 10, fontSize: 14 } }} />

      {/* ── Header ── */}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
            Block-wise / <span style={{ color: "orange" }}>
    Plant Scheduling of Robots
  </span>
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {selected.length > 0
              ? `${selected.length} of ${groups.length} block${groups.length !== 1 ? "s" : ""} selected`
              : "Select blocks to send commands"}
          </Typography>
        </Box>

        <Badge
          badgeContent={scheduleCount}
          invisible={scheduleCount === 0}
          sx={{
            "& .MuiBadge-badge": {
              bgcolor: BRAND,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              borderRadius: "9px",
            },
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<CalendarTodayRoundedIcon sx={{ fontSize: 15 }} />}
            onClick={() => setViewSchedulersOpen(true)}
            sx={{
              borderRadius: 2.5,
              bgcolor: "#1a2535",
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              px: 2.5,
              boxShadow: "none",
              "&:hover": { bgcolor: "#0d1b2a", boxShadow: "none" },
            }}
          >
            View Scheduled Tasks
          </Button>
        </Badge>
      </Stack>

      {/* ── Select All ── */}
      <Box sx={{ mb: 1.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={handleSelectAll}
              size="small"
              sx={{
                color: "text.disabled",
                "&.Mui-checked":       { color: BRAND },
                "&.MuiCheckbox-indeterminate": { color: BRAND },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 500, color: "text.secondary" }}>
              Select All Groups
            </Typography>
          }
        />
      </Box>

      {/* ── Block Card Grid ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          mb: 2,
        }}
      >
        {groups.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">No blocks available</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 2,
            }}
          >
            {groups.map((group, idx) => {
              const isSelected = selected.some(g => g.id === group.id);
              return (
                <Paper
                  key={group.id}
                  variant="outlined"
                  onClick={() => toggleSelect(group.id, group.name)}
                  sx={{
                    p: 2.5,
                    borderRadius: 1,
                    cursor: "pointer",
                    userSelect: "none",
                    position: "relative",
                    borderColor: isSelected ? BRAND : "divider",
                    borderWidth: isSelected ? 2 : 1,
                    bgcolor: isSelected ? BRAND_LIGHT : "background.paper",
                    transition: "all 0.15s ease",
                    animation: `mcFadeUp 0.18s ease ${idx * 0.04}s both`,
                    "&:hover": {
                      borderColor: BRAND,
                      boxShadow: `0 0 0 1px ${alpha(BRAND, 0.2)}`,
                      bgcolor: isSelected ? alpha(BRAND, 0.1) : alpha(BRAND, 0.03),
                    },
                  }}
                >
                  {/* checkbox top-right */}
                  <Checkbox
                    checked={isSelected}
                    size="small"
                    disableRipple
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelect(group.id, group.name)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      p: 0.5,
                      color: "text.disabled",
                      "&.Mui-checked": { color: BRAND },
                    }}
                  />

                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: isSelected ? BRAND_DARK : "text.primary",
                      mb: 0.5,
                      pr: 3,
                    }}
                  >
                    {group.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: BRAND, fontWeight: 500 }}>
                    {group.region || "—"}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>

      {/* ── Bottom Command Bar ── */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          px: 2,
          py: 1.5,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
         <Stack
          direction="row"
          sx={{
          spacing: 1.5,
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 1 }}
        >
          {commands.map(({ key, label, icon, color }) => (
            <Button
              key={key}
              variant="outlined"
              startIcon={icon}
              onClick={() => handleActionClick(key)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                fontSize: 13,
                py: 0.8,
                px: 2,
                borderColor: alpha(color, 0.35),
                color: "text.secondary",
                transition: "all 0.15s ease",
                "&:hover": {
                  borderColor: color,
                  color: color,
                  bgcolor: alpha(color, 0.06),
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Paper>

      {/* ════════════════════════════════════════
          MODAL 1 — Execute Command
      ════════════════════════════════════════ */}
      <Dialog
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: { sx: { borderRadius: 3, bgcolor: "background.paper", backgroundImage: "none" } },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" sx={{ alignItems: "center", spacing: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2,
              bgcolor: BRAND_LIGHT, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Box sx={{ color: BRAND, display: "flex" }}>
                {commands.find(c => c.key === currentData)?.icon}
              </Box>
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
              select label="Execution Mode" value={executionType} fullWidth size="small" sx={selectSx}
              onChange={(e) => setExecutionType(e.target.value as "instant" | "schedule")}
            >
              <MenuItem value="instant">⚡ Send Now</MenuItem>
              <MenuItem value="schedule">🕐 Schedule</MenuItem>
            </TextField>

            {executionType === "schedule" && (
              <>
                <TextField
                  select label="Recurrence" value={jobType} fullWidth size="small" sx={selectSx}
                  onChange={(e) => setJobType(e.target.value as "DAILY" | "ONE_TIME")}
                >
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="ONE_TIME">One Time</MenuItem>
                </TextField>

                <TextField
                  label="Execution Time" type="time" value={scheduleTime} fullWidth size="small"
                  onChange={(e) => setScheduleTime(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={selectSx}
                />
              </>
            )}

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
            onClick={() => setActionModalOpen(false)} color="inherit"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction} variant="contained" disabled={loading}
            sx={{
              borderRadius: 2, textTransform: "none", fontWeight: 600,
              bgcolor: BRAND, boxShadow: "none",
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
        fullWidth maxWidth="md"
        slotProps={{
          paper: { sx: { borderRadius: 3, bgcolor: "background.paper", backgroundImage: "none" } },
        }}
      >
        <DialogTitle>
          <Stack direction="row" sx={{ alignItems: "center", spacing: 1.5 }}>
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
                        key={sched.id} hover
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
                            label={info?.label ?? sched.data} size="small"
                            sx={{
                              fontSize: 11, fontWeight: 700, height: 22,
                              ...(info?.color === "success" && { bgcolor: alpha(BRAND, 0.12),      color: BRAND_DARK   }),
                              ...(info?.color === "error"   && { bgcolor: alpha("#d32f2f", 0.1),   color: "#b71c1c"    }),
                              ...(info?.color === "warning" && { bgcolor: alpha("#ed6c02", 0.1),   color: "#e65100"    }),
                              ...(info?.color === "default" && { bgcolor: "action.selected",       color: "text.secondary" }),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: sched.jobType === "DAILY" ? BRAND : "text.secondary" }}>
                            {sched.jobType}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
                          {new Date(sched.time).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small" onClick={() => deleteSchedule(sched.id)}
                            sx={{
                              color: "text.disabled", borderRadius: 1.5,
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
                width: 48, height: 48, borderRadius: 3, bgcolor: BRAND_LIGHT,
                display: "flex", alignItems: "center", justifyContent: "center",
                mx: "auto", mb: 2,
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
            onClick={() => setViewSchedulersOpen(false)} variant="outlined"
            sx={{
              borderRadius: 2, textTransform: "none", fontWeight: 600,
              borderColor: BRAND, color: BRAND,
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

const selectSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    "&:hover .MuiOutlinedInput-notchedOutline":  { borderColor: BRAND },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: BRAND },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: BRAND },
};

export default MulticastControl;