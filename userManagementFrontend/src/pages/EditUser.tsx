import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  LinearProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { fetchUserById, updateUser, updateUserPassword } from "../services/User.service";

const MIN_PASSWORD_LENGTH = 8;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-5
}

const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"];
const STRENGTH_COLORS = ["error", "error", "warning", "warning", "success", "success"] as const;

export default function EditUser() {
  const params = useParams();
  const urlId = params.id || params.userId;
  const userId = urlId ? parseInt(urlId, 10) : null;

  // Profile state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "USER",
    isActive: true
  });

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading / status state
  const [fetching, setFetching] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUser() {
      if (!userId || isNaN(userId)) {
        setPageError(`Invalid User ID provided. Received: "${urlId}"`);
        setFetching(false);
        return;
      }

      try {
        const data = await fetchUserById(userId);
        if (!data) throw new Error("No user data returned from backend server.");

        setUserData({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "USER",
          isActive: data.isActive !== undefined ? data.isActive : true
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        setPageError("Could not load user data from backend.");
      } finally {
        setFetching(false);
      }
    }
    fetchUser();
  }, [userId, urlId]);

  // Password validation
  const passwordTooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const isPasswordValid = newPassword.length >= MIN_PASSWORD_LENGTH && newPassword === confirmPassword;

  // Handle Profile Information Update
  const handleUpdateProfile = async (e: any) => {
    e.preventDefault();

    if (!userData.email || userData.email.trim() === "") {
      setProfileMessage({ type: "error", text: "Validation Error: Email field cannot be empty!" });
      return;
    }

    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const response = await updateUser(userId!, {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive
      });

      const result = response.data;

      if (!result.success) {
        throw new Error("Failed to update profile.");
      }

      setProfileMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      setProfileMessage({ type: "error", text: error.message || "Failed to update profile." });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: any) => {
    e.preventDefault();

    if (!newPassword) {
      setPasswordMessage({ type: "error", text: "Password cannot be empty." });
      return;
    }
    if (passwordTooShort) {
      setPasswordMessage({ type: "error", text: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: "", text: "" });

    try {
        await updateUserPassword(userId!, newPassword);


      setPasswordMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordMessage({ type: "error", text: error.message || "Failed to update password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 480,
        margin: "30px auto",
        padding: 4,
        borderRadius: 2,
        backgroundColor: "background.paper"
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Edit User Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Managing Account ID: <strong>{userId}</strong>
      </Typography>

      {pageError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {pageError}
        </Alert>
      )}

      {userId && !isNaN(userId) && (
        <>
          <Box component="form" onSubmit={handleUpdateProfile} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }} color="text.primary">
              User Profile Details
            </Typography>

            {profileMessage.text && (
              <Alert
                severity={profileMessage.type === "success" ? "success" : "error"}
                sx={{ mb: 2 }}
                onClose={() => setProfileMessage({ type: "", text: "" })}
              >
                {profileMessage.text}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              margin="dense"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              variant="outlined"
              margin="dense"
              value={userData.email}
              error={!userData.email || userData.email.trim() === ""}
              helperText={(!userData.email || userData.email.trim() === "") ? "Email is required for platform logins" : ""}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            />

            <TextField
              fullWidth
              select
              label="System Role"
              value={userData.role}
              margin="dense"
              onChange={(e) => setUserData({ ...userData, role: e.target.value })}
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="ADMIN">Administrator</MenuItem>
            </TextField>

            <Box sx={{ mt: 1, mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.isActive}
                    onChange={(e) => setUserData({ ...userData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label={userData.isActive ? "Account is Active" : "Account is Suspended"}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={profileLoading || !userData.email || userData.email.trim() === ""}
              fullWidth
            >
              {profileLoading ? "Saving..." : "Save Profile Data"}
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box component="form" onSubmit={handleUpdatePassword}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }} color="text.primary">
              Security Credentials
            </Typography>

            {passwordMessage.text && (
              <Alert
                severity={passwordMessage.type === "success" ? "success" : "error"}
                sx={{ mb: 2 }}
                onClose={() => setPasswordMessage({ type: "", text: "" })}
              >
                {passwordMessage.text}
              </Alert>
            )}

            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="dense"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a new password"
              error={passwordTooShort}
              helperText={passwordTooShort ? `Must be at least ${MIN_PASSWORD_LENGTH} characters` : " "}
              slotProps={{input:{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
            }
              }}
            />

            {newPassword.length > 0 && (
              <Box sx={{ mt: 0.5, mb: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength / 5) * 100}
                  color={STRENGTH_COLORS[passwordStrength]}
                  sx={{ height: 6, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Strength: {STRENGTH_LABELS[passwordStrength]}
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              margin="dense"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter the new password"
              error={passwordsMismatch}
              helperText={passwordsMismatch ? "Passwords do not match" : " "}
              slotProps={{
                input:{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword((p) => !p)} edge="end" size="small">
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),}
              }}
            />

            <Button
              type="submit"
              variant="outlined"
              color="error"
              disabled={passwordLoading || !isPasswordValid}
              fullWidth
              sx={{ mt: 2 }}
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}