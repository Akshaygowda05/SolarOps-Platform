import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useRecoilState } from "recoil";

import { fetchTrueApplication } from "../../../services/User.service";
import { selectedApplicationStateForAdmin } from "../../../store/authState";


interface Application {
  id: number;
  chirpstackId: string;
  name: string;
  description: string;
  TotalDeviceCount: number;
  tenantId: number;
  status: string;
}

export default function ApplicationSelector() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedApplication, setSelectedApplication] = useRecoilState(
    selectedApplicationStateForAdmin
  );

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      // Replace with your axios instance if required
     const data = await fetchTrueApplication();
    

     

if (data.success) {
  setApplications(data.data);
}


     
    } catch (error) {
      console.error("Failed to load applications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedApplication(event.target.value);

    // Optional
    localStorage.setItem("selectedApplication", event.target.value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center">
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 320,
        bgcolor: "background.paper",
      }}
    >
      <InputLabel>Application</InputLabel>

      <Select
        value={selectedApplication ?? ""}
        label="Application"
        onChange={handleChange}
      >
        {applications.map((app) => (
          <MenuItem
            key={app.chirpstackId}
            value={app.chirpstackId}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Box>
                <Typography fontWeight={600}>{app.name}</Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {app.description}
                </Typography>
              </Box>

              <Chip
                label={`${app.TotalDeviceCount} Robots`}
                color="primary"
                size="small"
              />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}