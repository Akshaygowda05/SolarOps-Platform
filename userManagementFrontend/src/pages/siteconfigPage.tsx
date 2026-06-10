import React, { useState, useEffect } from "react";
import {
  Box, Typography, TextField, Button, Switch,
  Select, MenuItem, FormControl, Grid,
  CircularProgress, Alert, Snackbar,
  Chip, OutlinedInput, Checkbox, ListItemText,
  useTheme, useMediaQuery, Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RouterIcon from "@mui/icons-material/Router";
import GridViewIcon from "@mui/icons-material/GridView";
import TuneIcon from "@mui/icons-material/Tune";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getsiteConfig, updateSiteConfig, allGateways } from "../services/User.service";

const BRAND = "#169647";
const BRAND_MUTED = "rgba(22,150,71,0.12)";
const BRAND_BORDER = "rgba(22,150,71,0.35)";

// ─── Sub-components (receive theme via prop so they stay reactive) ────────────

const SectionLabel = ({
  icon, title, subtitle, 
}: {
  icon: React.ReactNode; title: string; subtitle: string; theme: any;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: "10px",
      bgcolor: BRAND_MUTED,
      border: `1px solid ${BRAND_BORDER}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: BRAND, flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.9rem", lineHeight: 1.2 }}>
        {title}
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: "0.74rem" }}>{subtitle}</Typography>
    </Box>
  </Box>
);

const FieldLabel = ({ label, hint }: { label: string; hint?: string }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
    <Typography sx={{
      color: "text.secondary", fontSize: "0.75rem",
      fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
    }}>
      {label}
    </Typography>
    {hint && (
      <Tooltip title={hint} placement="top" slotProps={{
    transition: {
      timeout: 300, // Customize the fade speed in milliseconds
      style: { transformOrigin: 'bottom center' } // Custom layout anchors
    }
  }}>
        <InfoOutlinedIcon sx={{ fontSize: "0.8rem", color: "text.disabled", cursor: "help" }} />
      </Tooltip>
    )}
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function SiteConfigPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  useMediaQuery(theme.breakpoints.down("sm")); // keep for responsiveness

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateways, setGateways] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    panelsGap: 0,
    panelWidth: 0,
    multiplicationFactor: 1,
    triggeringAction: "UNICAST",
    sendTwiceAday: false,
    gatewayIds: [] as string[],
  });

  // ── Derived theme-aware values ──────────────────────────────────────────
  //const bg = theme.palette.background.default;
  const paper = theme.palette.background.paper;
  //const dividerColor = theme.palette.divider;
  const textPrimary = theme.palette.text.primary;
  const textSecondary = theme.palette.text.secondary;
  const textDisabled = theme.palette.text.disabled;

  // field border colours that adapt to mode
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";
  const borderHover = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.28)";
  const inputBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const cardHoverBorder = isDark ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.16)";
  const menuBg = paper;

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: inputBg,
      borderRadius: "10px",
      color: textPrimary,
      fontSize: "0.88rem",
      transition: "box-shadow 0.2s",
      "& fieldset": { borderColor },
      "&:hover fieldset": { borderColor: borderHover },
      "&.Mui-focused fieldset": { borderColor: BRAND },
      "&.Mui-focused": { boxShadow: `0 0 0 3px ${BRAND_MUTED}` },
    },
    "& .MuiInputLabel-root": { color: textSecondary, fontSize: "0.85rem" },
    "& .MuiInputLabel-root.Mui-focused": { color: BRAND },
    "& .MuiSelect-icon": { color: textSecondary },
  };

  const cardSx = {
    bgcolor: paper,
    border: `1px solid ${cardBorder}`,
    borderRadius: "16px",
    p: { xs: 2.5, sm: 3.5 },
    transition: "border-color 0.2s",
    height: "100%",
    "&:hover": { borderColor: cardHoverBorder },
  };

  const menuProps = {
  slotProps: {
    paper: {
      sx: {
        bgcolor: menuBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: "12px",
        mt: 0.5,
        maxHeight: 280,
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.5)"
          : "0 8px 24px rgba(0,0,0,0.1)",
        "& .MuiMenuItem-root": {
          fontSize: "0.875rem",
          color: textPrimary,
          "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" },
          "&.Mui-selected": { bgcolor: BRAND_MUTED },
          "&.Mui-selected:hover": { bgcolor: BRAND_MUTED },
        },
      },
    },
  },
};

  // ── Data Fetching ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const [configRes, gatewayRes] = await Promise.all([getsiteConfig(), allGateways()]);
        const data = configRes?.data || {};

        let initialGatewayIds: string[] = [];
        if (data.gatewayId) {
          initialGatewayIds = Array.isArray(data.gatewayId) ? data.gatewayId : [data.gatewayId];
        }

        setFormData({
          panelsGap: data.panelsGap || 0,
          panelWidth: data.panelWidth || 0,
          multiplicationFactor: data.multiplicationFactor || 1,
          triggeringAction: data.triggeringAction || "UNICAST",
          sendTwiceAday: data.sendTwiceAday || false,
          gatewayIds: initialGatewayIds,
        });

        setGateways(gatewayRes?.gatewayData?.result || []);
      } catch {
        setError("Unable to retrieve configuration. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleGatewayChange = (event: any) => {
    setFormData((prev) => ({ ...prev, gatewayIds: event.target.value as string[] }));
  };

  const removeGateway = (id: string) => {
    setFormData((prev) => ({ ...prev, gatewayIds: prev.gatewayIds.filter((g) => g !== id) }));
  };

  const getGatewayName = (id: string) => gateways.find((g) => g.gatewayId === id)?.name || id;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        panelsGap: formData.panelsGap,
        panelWidth: formData.panelWidth,
        multiplicationFactor: formData.multiplicationFactor,
        triggeringAction: formData.triggeringAction,
        sendTwiceAday: formData.sendTwiceAday,
        gatewayId: formData.gatewayIds,
      };
      const response = await updateSiteConfig(payload);
      if (!response?.data) throw new Error("Update failed");
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch {
      setError("Failed to save. Please verify your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{
        minHeight: "100vh", bgcolor: "background.default",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 2,
      }}>
        <Box sx={{ position: "relative" }}>
          <CircularProgress size={48} thickness={3} sx={{ color: BRAND }} />
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TuneIcon sx={{ fontSize: 18, color: BRAND }} />
          </Box>
        </Box>
        <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>
          Loading site configuration…
        </Typography>
      </Box>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>

        {/* Header */}
        <Box sx={{
          display: "flex", alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2, mb: { xs: 4, md: 5 },
        }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Box sx={{
                width: 7, height: 7, borderRadius: "50%",
                bgcolor: BRAND, boxShadow: `0 0 7px ${BRAND}`,
              }} />
              <Typography sx={{
                color: "text.secondary", fontSize: "0.72rem",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                System Config
              </Typography>
            </Box>
            <Typography sx={{
              color: "text.primary", fontWeight: 800,
              fontSize: { xs: "1.45rem", sm: "1.7rem" },
              letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              Site Configuration
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.83rem", mt: 0.5 }}>
              Hardware specs · Downlink scheduling · Gateway assignment
            </Typography>
          </Box>

          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: "0.95rem !important" }} />}
            onClick={() => navigate("/dashboard")}
            sx={{
              color: "text.secondary",
              bgcolor: paper,
              border: `1px solid ${cardBorder}`,
              borderRadius: "10px",
              px: 2.5, py: 1,
              fontSize: "0.82rem", fontWeight: 600,
              textTransform: "none", whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                color: "text.primary",
                borderColor: borderHover,
              },
            }}
          >
            Dashboard
          </Button>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleUpdate}>
          <Grid container spacing={2.5}>

            {/* ── Physical Layout ── */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={cardSx}>
                <SectionLabel
                  icon={<GridViewIcon fontSize="small" />}
                  title="Physical Layout"
                  subtitle="Panel dimensions & array config"
                  theme={theme}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel label="Panel Width" hint="Width of a single panel in millimetres" />
                    <TextField
                      fullWidth placeholder="e.g. 1200"
                      name="panelWidth" type="number"
                      value={formData.panelWidth}
                      onChange={handleChange}
                      required size="small"
                      slotProps=
                      {{
                        input: {
                          endAdornment: (
                            <Typography sx={{ color: textDisabled, fontSize: "0.78rem", pr: 0.5 }}>m</Typography>
                          ),
                        }
                      }}
                      sx={fieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel label="Panels Gap" hint="Gap between adjacent panels in millimetres" />
                    <TextField
                     fullWidth 
             placeholder="e.g. 5.00"
                     name="panelsGap" 
                    type="number"
                 value={formData.panelsGap}
                onChange={handleChange}
                required size="small"
    
                      slotProps=
                      {{
                        input: {
                          endAdornment: (
                            <Typography sx={{ color: textDisabled, fontSize: "0.78rem", pr: 0.5 }}>m</Typography>
                          ),
                        }
                      }}
                      sx={fieldSx}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FieldLabel label="Multiplication Factor" hint="Number of panels in the array" />
                    <FormControl fullWidth size="small" sx={fieldSx}>
                      <Select
                        name="multiplicationFactor"
                        value={formData.multiplicationFactor}
                        onChange={handleChange}
                         MenuProps={menuProps}
                      >
                        <MenuItem value={1}>1 Panel</MenuItem>
                        <MenuItem value={2}>2 Panels</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* ── Logic & Comm ── */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
                <SectionLabel
                  icon={<TuneIcon fontSize="small" />}
                  title="Logic & Comm"
                  subtitle="Downlink mode & frequency"
                  theme={theme}
                />

                <FieldLabel label="Triggering Action" />
                <FormControl fullWidth size="small" sx={{ ...fieldSx, mb: 2.5 }}>
                  <Select
                    name="triggeringAction"
                    value={formData.triggeringAction}
                    onChange={handleChange}
                     MenuProps={menuProps}
                  >
                    <MenuItem value="UNICAST">Unicast</MenuItem>
                    <MenuItem value="MULTICAST">Multicast</MenuItem>
                    <MenuItem value="BOTH">Both (Unicast & Multicast)</MenuItem>
                  </Select>
                </FormControl>

                {/* Dual Downlink toggle */}
                <Box sx={{
                  mt: "auto",
                  bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  border: `1px solid ${cardBorder}`,
                  borderRadius: "12px",
                  p: 2,
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: 2,
                }}>
                  <Box>
                    <Typography sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.86rem" }}>
                      Dual Downlink
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.74rem", mt: 0.3 }}>
                      Send downlink twice at the same time
                    </Typography>
                  </Box>
                  <Switch
                    checked={formData.sendTwiceAday}
                    onChange={handleChange}
                    name="sendTwiceAday"
                    sx={{
                      flexShrink: 0,
                      "& .MuiSwitch-switchBase.Mui-checked": { color: BRAND },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: BRAND },
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* ── Gateway Multi-Select ── */}
            <Grid size={{ xs: 12 }}>
              <Box sx={cardSx}>
                <SectionLabel
                  icon={<RouterIcon fontSize="small" />}
                  title="Gateway Assignment"
                  subtitle="Select one or more gateways for this site"
                  theme={theme}
                />

                <FieldLabel label="Gateways" hint="Select all gateways that should receive downlinks for this site" />
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <Select
                    multiple
                    value={formData.gatewayIds}
                    onChange={handleGatewayChange}
                    input={<OutlinedInput />}
                    displayEmpty
                    renderValue={(selected) => {
                      const s = selected as string[];
                      if (s.length === 0) {
                        return (
                          <Typography sx={{ color: textDisabled, fontSize: "0.86rem" }}>
                            Select gateways…
                          </Typography>
                        );
                      }
                      return (
                        <Typography sx={{ color: textSecondary, fontSize: "0.84rem" }}>
                          {s.length} gateway{s.length > 1 ? "s" : ""} selected
                        </Typography>
                      );
                    }}
                    MenuProps={menuProps}
                  >
                    {gateways.length === 0 ? (
                      <MenuItem disabled>
                        <Typography sx={{ color: textSecondary, fontSize: "0.84rem" }}>
                          No gateways available
                        </Typography>
                      </MenuItem>
                    ) : (
                      gateways.map((gateway: any) => (
                        <MenuItem key={gateway.gatewayId} value={gateway.gatewayId}>
                          <Checkbox
                            checked={formData.gatewayIds.includes(gateway.gatewayId)}
                            size="small"
                            sx={{
                              color: textDisabled, mr: 1, p: 0,
                              "&.Mui-checked": { color: BRAND },
                            }}
                          />
   <ListItemText
  primary={gateway.name}
  secondary={gateway.gatewayId}
  slotProps={{
    primary: {
      sx: {
        fontSize: "0.875rem",
        color: textPrimary
      }
    },
    // If you ever want to add secondary styling, use the same pattern:
    secondary: {
      sx: {
        fontSize: "0.75rem",
        color: "text.secondary"
      }
    }
  }}
/>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {/* Selected chips */}
                {formData.gatewayIds.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                    {formData.gatewayIds.map((id) => (
                      <Chip
                        key={id}
                        label={getGatewayName(id)}
                        onDelete={() => removeGateway(id)}
                        size="small"
                        sx={{
                          bgcolor: BRAND_MUTED,
                          color: BRAND,
                          border: `1px solid ${BRAND_BORDER}`,
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          borderRadius: "8px",
                          "& .MuiChip-deleteIcon": {
                            color: BRAND, opacity: 0.6, fontSize: "0.88rem",
                            "&:hover": { opacity: 1, color: "error.main" },
                          },
                        }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: textDisabled, fontSize: "0.77rem", mt: 1.5, fontStyle: "italic" }}>
                    No gateways selected — downlinks will broadcast to all available gateways.
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* ── Save Row ── */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{
                display: "flex",
                justifyContent: { xs: "stretch", sm: "flex-end" },
                gap: 2, pt: 1,
              }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/dashboard")}
                  sx={{
                    color: "text.secondary",
                    borderColor: cardBorder,
                    borderRadius: "10px",
                    px: 3, py: 1.2,
                    fontSize: "0.875rem", textTransform: "none", fontWeight: 600,
                    flex: { xs: 1, sm: "unset" },
                    "&:hover": {
                      borderColor: borderHover,
                      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  startIcon={
                    saving
                      ? <CircularProgress size={15} sx={{ color: "inherit" }} />
                      : <SaveIcon sx={{ fontSize: "1rem !important" }} />
                  }
                  sx={{
                    bgcolor: BRAND,
                    color: "#fff",
                    borderRadius: "10px",
                    px: { xs: 3, sm: 4 }, py: 1.2,
                    fontSize: "0.875rem", fontWeight: 700,
                    textTransform: "none",
                    flex: { xs: 1, sm: "unset" },
                    boxShadow: `0 2px 14px ${BRAND_MUTED}`,
                    "&:hover": {
                      bgcolor: "#117a38",
                      boxShadow: `0 4px 20px rgba(22,150,71,0.3)`,
                    },
                    "&:disabled": {
                      bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
                      color: textDisabled, boxShadow: "none",
                    },
                  }}
                >
                  {saving ? "Saving…" : "Save Configuration"}
                </Button>
              </Box>
            </Grid>

          </Grid>
        </form>
      </Box>

      {/* Success snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={2500}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          bgcolor: paper,
          border: `1px solid ${BRAND_BORDER}`,
          borderRadius: "12px",
          px: 2.5, py: 1.5,
          boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.12)",
        }}>
          <CheckCircleIcon sx={{ color: BRAND, fontSize: "1.2rem" }} />
          <Box>
            <Typography sx={{ color: "text.primary", fontWeight: 700, fontSize: "0.875rem" }}>
              Configuration saved
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
              Redirecting to dashboard…
            </Typography>
          </Box>
        </Box>
      </Snackbar>
    </Box>
  );
}