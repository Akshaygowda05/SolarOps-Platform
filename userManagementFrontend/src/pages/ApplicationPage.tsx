import { useSetRecoilState } from "recoil";
import { selectedApplicationState } from "../store/authState";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  Select,
  MenuItem,
  FormControl,
 
} from "@mui/material";

import type { SelectChangeEvent } from '@mui/material';
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import { api } from "../services/api";
import { CheckCircleOutlineOutlined } from "@mui/icons-material";

const GREEN = "#169647";
const ORANGE = "#E07B2A";

interface Application {
  id: number;
  chirpstackId: string;
  name: string;
  description: string;
  tenantId: number;
  status: string;
  createdAt: string;
}

export default function ApplicationPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const setSelectedApplication = useSetRecoilState(selectedApplicationState);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tenantId) {
      fetchApplications();
    }
  }, [tenantId]);

  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      setError("");
      const response = await api.get(`/admin/application?tenantID=${tenantId}`);

      if (response.data && response.data.data) {
        setApplications(response.data.data);
      } else {
        setApplications([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load applications");
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application.chirpstackId);
    localStorage.setItem("selectedApplicationId", String(application.chirpstackId));

    setNavigating(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  };

  const handleStatusChange = async (e: SelectChangeEvent<string>, app: Application) => {
    e.stopPropagation(); // Stop navigation click
    const newStatus = e.target.value;

    try {
      setError("");
      // Optimistic update
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
      );

      // Hit your status change endpoint

     // console.log("this is to check the id of the application",app.id)
   const resposne =    await api.put(`/admin/application/${app.id}/status`, {
        status: newStatus,
      });

      console.log("this is to check what is happening the response",resposne)


    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update application status");
      // Revert if API fails
      fetchApplications();
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "ACTIVE") return { color: GREEN, bg: `${GREEN}18` };
    if (s === "PENDING" || s === "PENDING_REVIEW") return { color: ORANGE, bg: `${ORANGE}1f` };
    if (s === "FAILED" || s === "ERROR") return { color: "#D64545", bg: "#D6454518" };
    return { color: "#666666", bg: "#f0f0f0" };
  };

  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter((a) => (a.status || "").toUpperCase() === "ACTIVE").length;
    const pending = applications.filter((a) =>
      ["PENDING", "PENDING_REVIEW"].includes((a.status || "").toUpperCase())
    ).length;
    return { total, active, pending };
  }, [applications]);

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
      alignItems="center"
      justifyContent="space-between"
      sx={{
        flex: 1,
        minWidth: 180,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Stack spacing={0}>
        <Typography
          variant="caption"
          sx={{ textTransform: "uppercase", letterSpacing: "0.06em", color: "text.disabled", fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {value}
        </Typography>
      </Stack>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${accent}18`,
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
          <Link
            component="button"
            underline="hover"
            color="text.secondary"
            onClick={() => navigate("/tenants")}
            sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}
          >
            Tenants
          </Link>
          <Typography
            color="text.secondary"
            sx={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.04em" }}
          >
            Applications
          </Typography>
        </Breadcrumbs>

        <Box sx={{ borderLeft: `4px solid ${GREEN}`, pl: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "0.01em" }}>
            APPLICATIONS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reviewing {applications.length} {applications.length === 1 ? "application" : "applications"} for this tenant.
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
        <StatCard icon={<AppsOutlinedIcon fontSize="small" />} label="Total Apps" value={stats.total} accent={GREEN} />
        <StatCard
          icon={<PendingActionsOutlinedIcon fontSize="small" />}
          label="Pending Review"
          value={stats.pending}
          accent={ORANGE}
        />
        <StatCard
          icon={<CheckCircleOutlineOutlined fontSize="small" />}
          label="Active"
          value={stats.active}
          accent={GREEN}
        />
      </Stack>

      {loadingApps ? (
        <Box sx={{ display: "flex", py: 8, justifyContent: "center" }}>
          <CircularProgress size={28} sx={{ color: GREEN }} />
        </Box>
      ) : applications.length === 0 ? (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No applications yet for this tenant.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {applications.map((app) => {
            const { color, bg } = statusStyle(app.status);
            return (
              <Box
                key={app.id}
                onClick={() => handleApplicationClick(app)}
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
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    borderColor: GREEN,
                    boxShadow: `0 0 0 1px ${GREEN}20`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `${GREEN}18`,
                    color: GREEN,
                    flexShrink: 0,
                  }}
                >
                  <AppsOutlinedIcon fontSize="small" />
                </Box>

                <Stack spacing={0.3} sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                    {app.name}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Created on {formatDate(app.createdAt)}
                  </Typography>
                </Stack>

                <FormControl size="small" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={app.status || "NONE"}
                    onChange={(e) => handleStatusChange(e, app)}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: "uppercase",
                      color: color,
                      backgroundColor: bg,
                      height: 26,
                      borderRadius: 4,
                      "& .MuiSelect-select": {
                        py: 0.5,
                        px: 1.5,
                        pr: "24px !important",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                  >
                    <MenuItem value="PENDING" sx={{ fontSize: 12, fontWeight: 600 }}>PENDING</MenuItem>
                    <MenuItem value="ACTIVE" sx={{ fontSize: 12, fontWeight: 600 }}>ACTIVE</MenuItem>
                    <MenuItem value="NONE" sx={{ fontSize: 12, fontWeight: 600 }}>NONE</MenuItem>
                  </Select>
                </FormControl>

                <IconButton
                  size="small"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ color: "text.disabled", flexShrink: 0 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      )}

      {navigating && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "background.default",
            opacity: 1,
            transition: "opacity 0.4s ease",
          }}
        >
          <CircularProgress size={32} sx={{ color: GREEN }} />
          <Typography variant="body2" color="text.secondary">
            Loading dashboard context...
          </Typography>
        </Box>
      )}
    </Box>
  );
}