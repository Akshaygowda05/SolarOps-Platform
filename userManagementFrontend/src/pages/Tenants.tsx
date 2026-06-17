// pages/AdminPortal.tsx
import { useSetRecoilState} from "recoil";
import { selectedApplicationState } from "../store/authState";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Breadcrumbs,
  Link,
} from "@mui/material";
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
}

export default function AdminPortal() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState("");
  

const navigate = useNavigate();

  const setSelectedApplication = useSetRecoilState(
  selectedApplicationState
);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoadingTenants(true);

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

      const response = await api.get(
        `/admin/application?tenantID=${tenant.id}`
      );

      setApplications(response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load applications");
    } finally {
      setLoadingApps(false);
    }
  };

const handleApplicationClick = (application: Application) => {
  setSelectedApplication(application.id);
 console.log("CLICKED");
  console.log(application);

  localStorage.setItem(
    "selectedApplicationId",
    application.id
  );

  console.log("Selected:", application.id);
  navigate("/dashboard");
};

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Admin Portal
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {selectedTenant && (
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            underline="hover"
            onClick={() => {
              setSelectedTenant(null);
              setApplications([]);
            }}
          >
            Tenants
          </Link>

          <Typography color="text.primary">
            {selectedTenant.name}
          </Typography>
        </Breadcrumbs>
      )}

      {!selectedTenant ? (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Tenant
          </Typography>

          {loadingTenants ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              {tenants.map((tenant) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tenant.id}>
                  <Card>
                    <CardActionArea
                      onClick={() => handleTenantClick(tenant)}
                    >
                      <CardContent>
                        <Typography variant="h6">
                          {tenant.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          ID: {tenant.id}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Applications for {selectedTenant.name}
          </Typography>

          {loadingApps ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              {applications.map((app) => (
               <Grid size={{ xs: 12, sm: 6, md: 4 }} key={app.id}>
                  <Card>
                    <CardActionArea
                      onClick={() => handleApplicationClick(app)}
                    >
                      <CardContent>
                        <Typography variant="h6">
                          {app.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {app.id}
                        </Typography>

                        {app.description && (
                          <Typography
                            variant="body2"
                            sx={{ mt: 1 }}
                          >
                            {app.description}
                          </Typography>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}