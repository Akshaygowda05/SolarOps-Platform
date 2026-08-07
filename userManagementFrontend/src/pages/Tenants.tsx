// pages/AdminPortal.tsx
import { useResetRecoilState } from "recoil";
import { selectedApplicationState } from "../store/authState";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  useTheme,
  alpha,
} from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import { api } from "../services/api";

interface Tenant {
  id: number;
  chirpstackId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    applications: number;
  };
}

export default function AdminPortal() {
  const theme = useTheme();
  const navigate = useNavigate();
  const resetSelectedApplication = useResetRecoilState(selectedApplicationState);

  // Dynamic colors derived from current theme mode
  const GREEN = theme.palette.mode === "dark" ? "#2e7d32" : "#169647";
  const ORANGE = theme.palette.mode === "dark" ? "#f57c00" : "#E07B2A";

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    resetSelectedApplication();
    localStorage.removeItem("selectedApplicationId");
    fetchTenants();
  }, [resetSelectedApplication]);

  const fetchTenants = async () => {
    try {
      setLoadingTenants(true);
      setError("");
      const response = await api.get("/admin/tenant");

      if (response.data && response.data.tenants && response.data.tenants.data) {
        setTenants(response.data.tenants.data);
      } else if (response.data && response.data.data) {
        setTenants(response.data.data);
      } else {
        setTenants([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load tenants");
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleTenantClick = (chirpstackId: string) => {
    navigate(`/admin/tenants/${chirpstackId}/applications`);
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const stats = useMemo(() => {
    const totalApps = tenants.reduce((sum, t) => sum + (t._count?.applications || 0), 0);
    return {
      total: tenants.length,
      avgApps: tenants.length ? (totalApps / tenants.length).toFixed(1) : "0.0",
      totalApps,
    };
  }, [tenants]);

  const StatCard = ({
    icon,
    label,
    value,
    accent,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    accent: string;
  }) => (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        flex: 1,
        minWidth: 180,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: alpha(accent, 0.15),
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Stack spacing={0}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Stack
        direction="row"
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Stack spacing={0.5}>
          <Typography
            variant="caption"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "text.secondary",
              fontWeight: 600,
            }}
          >
            Admin Portal
          </Typography>
          <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
            Tenants ({tenants.length})
          </Typography>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
        <StatCard
          icon={<StorageOutlinedIcon fontSize="small" />}
          label="Total Tenants"
          value={stats.total}
          accent={GREEN}
        />
        <StatCard
          icon={<SpeedOutlinedIcon fontSize="small" />}
          label="Avg Applications"
          value={stats.avgApps}
          accent={ORANGE}
        />
        <StatCard
          icon={<StorageOutlinedIcon fontSize="small" />}
          label="Total Applications"
          value={stats.totalApps}
          accent={GREEN}
        />
      </Stack>

      {loadingTenants ? (
        <Box sx={{ display: "flex", py: 8, justifyContent: "center" }}>
          <CircularProgress size={28} sx={{ color: GREEN }} />
        </Box>
      ) : tenants.length === 0 ? (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No tenants yet. Create one to get started.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {tenants.map((tenant) => (
            <Box
              key={tenant.id}
              onClick={() => handleTenantClick(tenant.chirpstackId)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: GREEN,
                  boxShadow: `0 2px 8px ${alpha(GREEN, 0.25)}`,
                },
                "&:hover .row-chevron": {
                  color: GREEN,
                  transform: "translateX(2px)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: 14,
                  fontWeight: 700,
                  backgroundColor: alpha(GREEN, 0.15),
                  color: GREEN,
                }}
              >
                {initials(tenant.name)}
              </Avatar>

              <Stack spacing={0.3} sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  color="text.primary"
                  sx={{ fontWeight: 600, lineHeight: 1.3 }}
                  noWrap
                >
                  {tenant.name}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    Created on {formatDate(tenant.createdAt)}
                  </Typography>
                </Stack>
              </Stack>

              <Typography variant="caption" sx={{ color: ORANGE, fontWeight: 600, flexShrink: 0 }}>
                {tenant._count?.applications || 0}{" "}
                {tenant._count?.applications === 1 ? "App" : "Apps"}
              </Typography>

              <ChevronRightIcon
                sx={{
                  color: "text.secondary",
                  flexShrink: 0,
                  transition: "color 0.2s, transform 0.2s",
                }}
                className="row-chevron"
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}