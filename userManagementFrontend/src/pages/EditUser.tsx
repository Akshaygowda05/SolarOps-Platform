import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import toast, { Toaster } from "react-hot-toast";
import { fetchUserById, updateUser, updateUserPassword } from "../services/User.service";

const BRAND_GREEN = "#169647";

type PasswordStrength = {
  score: number; // 0-4
  label: string;
  color: string;
};

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "error.main" };
  if (score === 2) return { score, label: "Fair", color: "#E07B2A" };
  if (score === 3) return { score, label: "Good", color: "#E07B2A" };
  return { score, label: "Strong", color: BRAND_GREEN };
}

export default function EditUser() {
  const params = useParams();
  const urlId = params.id || params.userId;
  const userId = urlId ? parseInt(urlId, 10) : null;
  const isValidUserId = !!userId && !isNaN(userId);

  // Profile state tracking application ID and site name
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "USER",
    isActive: true,
    applicationId: "",
    siteName: "",
  });

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Independent loading states
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 1. Fetch user data on mount
  useEffect(() => {
    async function fetchUser() {
      if (!isValidUserId) {
        setFetchError(`Invalid user ID provided. Received: "${urlId}"`);
        setFetching(false);
        return;
      }

      try {
        const data = await fetchUserById(userId!);
        if (!data) throw new Error("No user data returned from backend server.");

        setUserData({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "USER",
          isActive: data.isActive !== undefined ? data.isActive : true,
          applicationId: data.applicationId || "",
          siteName: data.siteName || "",
        });
      } catch (error: any) {
        console.error("Error fetching user:", error);
        setFetchError("Could not load user data. Please try again.");
        toast.error("Could not load user data.");
      } finally {
        setFetching(false);
      }
    }
    fetchUser();
  }, [userId, urlId, isValidUserId]);

  const isEmailEmpty = !userData.email || userData.email.trim() === "";
  
  // Dynamic validation matching your backend rules
  const isUserRole = userData.role === "USER";
  const isMissingUserFields = isUserRole && (!userData.applicationId.trim() || !userData.siteName.trim());

  // 2. Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmailEmpty) {
      toast.error("Email is required.");
      return;
    }

    if (isMissingUserFields) {
      toast.error("Application ID and Site Name are required for the USER role.");
      return;
    }

    setProfileLoading(true);

    // Build conditional payload safely
    const payload: any = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isActive: userData.isActive,
    };

    // Only append user tracking fields if configuration is USER
    if (isUserRole) {
      payload.applicationId = userData.applicationId;
      payload.siteName = userData.siteName;
    }

    try {
      await updateUser(userId!, payload);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorText = error.response?.data?.message || error.message || "Failed to update profile.";
      toast.error(errorText);
    } finally {
      setProfileLoading(false);
    }
  };

  // 3. Update password
  const passwordTooShort = newPassword.length > 0 && newPassword.length < 8;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const passwordStrength = getPasswordStrength(newPassword);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      toast.error("Password cannot be empty.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await updateUserPassword(userId!, newPassword);
      toast.success("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      const errorText = error.response?.data?.message || error.message || "Failed to update password.";
      toast.error(errorText);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          margin: "30px auto",
          padding: 4,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
          Edit User Settings
        </Typography>

        {!isValidUserId || fetchError ? (
          <Typography color="error.main" sx={{ mt: 2 }}>
            {fetchError}
          </Typography>
        ) : (
          <>
            <Box component="form" onSubmit={handleUpdateProfile} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }} color="text.primary">
                User Profile Details
              </Typography>

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
                error={isEmailEmpty}
                helperText={isEmailEmpty ? "Email is required to keep account login active" : ""}
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

              {/* Conditional rendering based on role layout */}
              {isUserRole && (
                <>
                  <TextField
                    fullWidth
                    label="Application ID"
                    variant="outlined"
                    margin="dense"
                    value={userData.applicationId}
                    error={!userData.applicationId.trim()}
                    helperText={!userData.applicationId.trim() ? "Application ID is required for users" : ""}
                    onChange={(e) => setUserData({ ...userData, applicationId: e.target.value })}
                  />

                  <TextField
                    fullWidth
                    label="Site Name"
                    variant="outlined"
                    margin="dense"
                    value={userData.siteName}
                    error={!userData.siteName.trim()}
                    helperText={!userData.siteName.trim() ? "Site Name is required for users" : ""}
                    onChange={(e) => setUserData({ ...userData, siteName: e.target.value })}
                  />
                </>
              )}

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
                disabled={profileLoading || isEmailEmpty || isMissingUserFields}
                fullWidth
              >
                {profileLoading ? "Saving..." : "Save Profile Data"}
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box component="form" onSubmit={handleUpdatePassword}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }} color="text.primary">
                Security Credentials
              </Typography>

              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                variant="outlined"
                margin="dense"
                value={newPassword}
                error={passwordTooShort}
                helperText={passwordTooShort ? "Password must be at least 8 characters" : " "}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {newPassword.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(passwordStrength.score / 4) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "action.hover",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: passwordStrength.color,
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 600 }}>
                    {passwordStrength.label}
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
                error={passwordsMismatch}
                helperText={passwordsMismatch ? "Passwords do not match" : " "}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter the new password"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                variant="outlined"
                color="error"
                disabled={
                  passwordLoading ||
                  !newPassword ||
                  newPassword.length < 8 ||
                  newPassword !== confirmPassword
                }
                fullWidth
                sx={{ mt: 2 }}
              >
                {passwordLoading ? "Updating..." : "Force Update Password"}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </>
  );
}