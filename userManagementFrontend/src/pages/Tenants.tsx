// pages/AdminPortal.tsx
import { useResetRecoilState, useSetRecoilState } from "recoil";
import { selectedApplicationState } from "../store/authState";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Breadcrumbs,
  Link,
  Button,
  Stack
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { api } from "../services/api";

interface Tenant {
  id: string;
  name: string;
  createdAt: string;
}

interface Application {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function AdminPortal() {
  const navigate = useNavigate();
  const setSelectedApplication = useSetRecoilState(selectedApplicationState);
  const resetSelectedApplication = useResetRecoilState(selectedApplicationState);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
     console.log("ADMIN PORTAL MOUNTED");
    resetSelectedApplication();
    localStorage.removeItem("selectedApplicationId");
    fetchTenants();
  }, [resetSelectedApplication]);

  const fetchTenants = async () => {
    try {
      setLoadingTenants(true);
      setError("");
      const response = await api.get("/admin/tenant");
      setTenants(response.data.tenants || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load tenants");
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleTenantClick = async (tenant: Tenant) => {
    try {
      setSelectedTenant(tenant);
      setLoadingApps(true);
      setError("");
      const response = await api.get(`/admin/application?tenantID=${tenant.id}`);
      setApplications(response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load applications");
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApplicationClick = (application: Application) => {
    setSelectedApplication(application.id);
    localStorage.setItem("selectedApplicationId", application.id);
    setNavigating(true);
    setTimeout(() => navigate("/dashboard"), 1200);
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const CardButton = ({
    name,
    createdAt,
    onClick,
  }: {
    name: string;
    createdAt: string;
    onClick: () => void;
  }) => (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        justifyContent: "flex-start",
        textAlign: "left",
        p: 2.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        color: "text.primary",
        textTransform: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
          borderColor: "#169647",
          backgroundColor: "background.paper",
          boxShadow: "0 0 0 1px #16964720",
        },
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Created {formatDate(createdAt)}
        </Typography>
      </Stack>
    </Button>
  );

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>

      {/* Header */}
      <Stack spacing={1} sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Admin Portal
        </Typography>

        {selectedTenant ? (
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />}>
            <Link
              component="button"
              underline="hover"
              color="text.secondary"
              onClick={() => {
                setSelectedTenant(null);
                setApplications([]);
              }}
              sx={{ fontWeight: 500, fontSize: "0.875rem" }}
            >
              Tenants
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {selectedTenant.name}
            </Typography>
          </Breadcrumbs>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select a tenant to view its applications.
          </Typography>
        )}
      </Stack>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Section label */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "text.disabled",
          mb: 2,
          fontWeight: 600,
        }}
      >
        {!selectedTenant
          ? `Tenants (${tenants.length})`
          : `Applications — ${selectedTenant.name}`}
      </Typography>

      {/* Cards */}
      {(!selectedTenant ? loadingTenants : loadingApps) ? (
        <Box sx={{ display: "flex", py: 8 }}>
          <CircularProgress size={28} sx={{ color: "#169647" }} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {(!selectedTenant ? tenants : applications).map((item: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <CardButton
                name={item.name}
                createdAt={item.createdAt}
                onClick={() =>
                  !selectedTenant
                    ? handleTenantClick(item)
                    : handleApplicationClick(item)
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
      {/* Navigation overlay */}
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
            opacity: navigating ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
        >
          <CircularProgress size={32} sx={{ color: "#169647" }} />
          <Typography variant="body2" color="text.secondary">
            Loading dashboard...
          </Typography>
        </Box>
      )}
    </Box>
  );
}