import { useState } from "react";
import { createUser } from "../services/User.service";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Stack,
  IconButton,
  InputAdornment,
  CircularProgress,
  Container,
} from "@mui/material";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function CreateUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    siteName: "",
    applicationId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser(formData);
      navigate("/users");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Error creating user ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/users")}
        sx={{ mb: 2, textTransform: "none", color: "text.secondary" }}
      >
        Back to Users
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
          <PersonAddIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Create New User
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. John Doe"
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                select
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <MenuItem value="USER">USER</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Application ID"
                name="applicationId"
                variant="outlined"
                value={formData.applicationId}
                onChange={handleChange}
                placeholder="APP-123"
              />
            </Box>

            <TextField
              fullWidth
              label="Site Name (Optional)"
              name="siteName"
              variant="outlined"
              value={formData.siteName}
              onChange={handleChange}
              placeholder="e.g. Solar Farm Alpha"
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: "bold",
                textTransform: "none",
                mt: 1,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Register User"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default CreateUser;