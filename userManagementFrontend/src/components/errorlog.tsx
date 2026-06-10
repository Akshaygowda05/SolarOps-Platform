import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Skeleton,
  Card,
  useTheme,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  alpha,
  useMediaQuery,
} from "@mui/material";

import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { fetchErrorLogs } from "../services/User.service";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --- Types & Constants ---

interface ErrorItem {
  deviceId: string;
  deviceName: string;
  errorCode: number;
  errorLevel: number;
  timestamp: number;
}

const ERROR_LIST: Record<number, string> = {
  0: "No error",
  2: "Emergency stop pressed",
  10: "Robot stalled",
  11: "Stall recovery failed",
  12: "Low battery",
  13: "MCU overheating",
  14: "PCB overheating",
  16: "Invalid command",
  17: "Drive motor fault",
  18: "Brush motor fault",
};

// ✅ Define column widths globally to prevent ReferenceErrors and ensure alignment
const COL_WIDTHS = {
  device: { xs: "35%", sm: "20%", md: "20%" },
  message: { xs: "0%", sm: "40%", md: "42%" }, // 0% hides it on mobile
  severity: { xs: "40%", sm: "20%", md: "15%" },
  time: { xs: "0%", sm: "15%", md: "15%" },
  action: "40px",
};

// --- Component ---

export default function ErrorLogsCard() {
  const theme = useTheme();
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Responsive Breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const fetchErrors = useCallback(async () => {
    try {
      const res = await fetchErrorLogs();
      const latest = (res.data.data || [])
        .sort((a: ErrorItem, b: ErrorItem) => b.timestamp - a.timestamp)
        .slice(0, 10);
      setErrors(latest);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchErrors();
    const interval = setInterval(fetchErrors, 10000);
    return () => clearInterval(interval);
  }, [fetchErrors]);

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Error Logs");
    worksheet.columns = [
      { header: "Device Name", key: "name", width: 20 },
      { header: "Error Message", key: "msg", width: 35 },
      { header: "Severity", key: "level", width: 15 },
      { header: "Date", key: "date", width: 18 },
      { header: "Time", key: "time", width: 15 },
    ];

    errors.forEach((err) => {
      const d = new Date(err.timestamp);
      worksheet.addRow({
        name: err.deviceName,
        msg: ERROR_LIST[err.errorCode] || "Unknown",
        level: err.errorLevel === 2 ? "CRITICAL" : "WARNING",
        date: d.toLocaleDateString(),
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    });

    worksheet.getRow(1).font = { bold: true };
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Logs_${new Date().getTime()}.xlsx`);
  };

  const getLevelConfig = (level: number) => {
    return level === 2
      ? { label: "CRITICAL", color: "error", icon: <ErrorIcon fontSize="inherit" /> }
      : { label: "WARNING", color: "warning", icon: <WarningAmberIcon fontSize="inherit" /> };
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return {
      date: d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 620,
        borderRadius: 4,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        
        {/* --- Header Section --- */}
        <Box  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1.5} >
            <Typography variant="h6" sx={{ letterSpacing: "-0.5px", fontWeight:800 }}>
              Robot Error Logs
            </Typography>
            {!loading && (
              <Chip
                label={errors.length > 0 ? `${errors.length} Active` : "System Healthy"}
                size="small"
                color={errors.length > 0 ? "error" : "success"}
                sx={{ fontWeight: 700, height: 20, fontSize: "0.65rem" }}
              />
            )}
          </Stack>
          <Tooltip title="Export to Excel">
            <IconButton
              onClick={downloadExcel}
              size="small"
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.08), 
                color: "primary.main",
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.15) }
              }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider />

        {/* --- List Section --- */}
        <Box sx={{ mt: 1, flexGrow: 1 }}>
          {loading ? (
            <Stack  sx={{ spacing: 1, mt: 1 }}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: 2 }} />
              ))}
            </Stack>
          ) : errors.length === 0 ? (
            <Box sx={{ py: 15, textAlign: "center", opacity: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: "success.light", mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>No system errors detected</Typography>
            </Box>
          ) : (
            <Box>
              {/* Desktop Column Headers */}
              {!isXs && (
        <Stack
  direction="row"
  spacing={2}
  sx={{ opacity: 0.4 , px:2 ,py:1.5}}
>
  <Typography
    variant="caption"
    
    sx={{ flexBasis: COL_WIDTHS.device, fontWeight: 700 }}
  >
    ROBOT
  </Typography>

  <Typography
    variant="caption"
    
    sx={{ flexBasis: COL_WIDTHS.message, fontWeight: 700 }}
  >
    ERROR MESSAGE
  </Typography>

  <Typography
    variant="caption"
  
    sx={{ flexBasis: COL_WIDTHS.severity, fontWeight: 700 }}
  >
    SEVERITY
  </Typography>

  <Typography
    variant="caption"
  
    sx={{ flexBasis: COL_WIDTHS.time, textAlign: "right",  fontWeight: 700 }}
  >
    TIMESTAMP
  </Typography>

  <Box sx={{ width: COL_WIDTHS.action }} />
</Stack>
              )}

              <Stack spacing={0.5}>
                {errors.map((err, index) => {
                  const config = getLevelConfig(err.errorLevel);
                  const { date, time } = formatDate(err.timestamp);
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: { xs: 1.5, sm: 1.5, md: 2 },
                        borderRadius: 2,
                        transition: "0.2s",
                        border: "1px solid transparent",
                        "&:hover": { 
                          bgcolor: alpha(theme.palette.action.hover, 0.5),
                          borderColor: "divider",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2}  sx={{ width: "100%",alignItems:"center" }}>
                        
                        {/* 1. Robot Name */}
                        <Box sx={{ flexBasis: COL_WIDTHS.device, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap color="primary">
                            {err.deviceName}
                          </Typography>
                          {/* {!isXs && (
                            // <Typography variant="caption" color="text.disabled" noWrap display="block">
                            //   ID: {err.deviceId}
                            // </Typography>
                          )} */}
                        </Box>

                        {/* 2. Message */}
                        {!isXs && (
                          <Typography 
                            variant="body2" 
                            sx={{ flexBasis: COL_WIDTHS.message, color: "text.primary", fontWeight: 500 }} 
                            noWrap
                          >
                            {ERROR_LIST[err.errorCode] || "Unknown Fault"}
                          </Typography>
                        )}

                        {/* 3. Severity Chip */}
                        <Box sx={{ flexBasis: COL_WIDTHS.severity }}>
                          <Chip
                            icon={config.icon}
                            label={isXs ? "" : config.label}
                            color={config.color as any}
                            size="small"
                            sx={{ 
                              fontWeight: 800, 
                              fontSize: "0.65rem",
                              height: 24,
                              ...(isXs && { minWidth: 32, "& .MuiChip-label": { display: "none" } })
                            }}
                          />
                        </Box>

                        {/* 4. Time/Date */}
                        {!isXs && (
                          <Box sx={{ flexBasis: COL_WIDTHS.time, textAlign: "right", minWidth: 0 }}>
                            <Typography variant="caption" sx={{ display: "block", fontWeight: 700 }}>
                              {time}
                            </Typography>
                            {!isSm && (
                              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 400 }}>
                                {date}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* 5. Details Action */}
                        <IconButton size="small" sx={{ width: COL_WIDTHS.action, opacity: 0.3, "&:hover": { opacity: 1 } }}>
                          <OpenInNewIcon fontSize="inherit" />
                        </IconButton>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>

        {/* --- Footer Section --- */}
        <Box 
          sx={{ 
            mt: "auto", 
            pt: 2, 
            borderTop: `1px solid ${theme.palette.divider}`,
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center"
          }}
        >
       <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Showing 10 most recent events
          </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", opacity: 0.6 }}>
             <Box 
               sx={{ 
                 width: 6, height: 6, bgcolor: "success.main", borderRadius: "50%",
                 animation: "pulse 2s infinite" 
               }} 
             />
             <Typography variant="caption" sx={{ fontStyle: "italic" }}>
               Live Update Enabled
             </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Global CSS for the pulse animation used in footer */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </Card>
  );
}