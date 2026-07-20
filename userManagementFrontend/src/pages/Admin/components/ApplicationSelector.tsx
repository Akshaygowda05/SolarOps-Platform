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
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={40}>
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
      {/* Added id pairing for proper Material UI label animations */}
      <InputLabel id="application-selector-label">Application</InputLabel>

      <Select
        labelId="application-selector-label"
        id="application-selector"
        label="Application"
        value={selectedApplication || "ALL"} 
        onChange={handleChange}
      >
        <MenuItem value="ALL">
          All Applications
        </MenuItem>
        
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