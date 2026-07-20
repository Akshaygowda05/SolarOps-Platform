import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Switch,
  IconButton,
  InputAdornment,
  LinearProgress,
  alpha,
  Grid
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import toast, { Toaster } from "react-hot-toast";
import { fetchUserById, updateUser, updateUserPassword } from "../services/User.service";

// Exact colors mapped from the provided image layout
const COLORS = {
  brandGreen: "#007953",       // Rich Deep Green for header accents & buttons
  brandGreenLight: "#E6F4EA",  // Light mint green background for status card
  accentRed: "#D9383A",        // Distinct red for Security Credentials header
  inputBg: "#F1F3F4",          // Soft light gray background for input text fields
  textMuted: "#5F6368",        // Standard gray for labels and structural info text
};

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

  if (score <= 1) return { score, label: "Weak", color: COLORS.accentRed };
  if (score === 2) return { score, label: "Fair", color: "#E07B2A" };
  if (score === 3) return { score, label: "Good", color: "#E07B2A" };
  return { score, label: "Strong", color: COLORS.brandGreen };
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress sx={{ color: COLORS.brandGreen }} />
      </Box>
    );
  }

  // Base styling for modern, custom filled input fields matching image
  const inputStyles = {
    bgcolor: COLORS.inputBg,
    borderRadius: "8px",
    "&:before, &:after": { display: "none" }, // Remove default underline
    "& .MuiInputBase-input": { py: 1.8, px: 2, fontWeight: 500, color: "#202124" }
  };

  const labelStyles = {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.2px",
    mb: 0.8,
    display: "block"
  };

  return (
    <Box sx={{ p: { xs: 2, md: 6 }, bgcolor: "#F8FAFB", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <Toaster position="top-right" />
      
      {/* PAGE INTRO HEADER */}
      <Box sx={{ maxWidth: 760, width: "100%", textAlign: "left" }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: "#1F2937", letterSpacing: '-0.5px', mb: 0.5 }}>
          Edit User Settings
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textMuted, fontWeight: 500, fontSize: "0.95rem" }}>
          Modify user profiles, infrastructure environments, and system operational parameters. All changes are logged for security auditing.
        </Typography>
      </Box>

      {!isValidUserId || fetchError ? (
        <Typography color="error.main" sx={{ mt: 2, fontWeight: 600 }}>
          {fetchError}
        </Typography>
      ) : (
        <>
          {/* SECTION 1: USER PROFILE DETAILS CARD */}
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleUpdateProfile}
            sx={{
              maxWidth: 760,
              width: "100%",
              padding: { xs: 3, md: 5 },
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 10px 40px rgba(0,0,0,0.02)",
              backgroundColor: "background.paper",
              display: "flex",
              flexDirection: "column",
              gap: 3.5
            }}
          >
            {/* Custom Header Line Accent */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 4, height: 22, bgcolor: COLORS.brandGreen, borderRadius: "2px" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#1A365D", fontSize: "0.85rem" }}>
                User Profile Details
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <label style={labelStyles}>Full Name</label>
                <TextField
                  fullWidth
                  variant="filled"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  slotProps={{ input: { sx: inputStyles } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <label style={labelStyles}>Email Address</label>
                <TextField
                  fullWidth
                  variant="filled"
                  type="email"
                  value={userData.email}
                  error={isEmailEmpty}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  slotProps={{ input: { sx: inputStyles } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <label style={labelStyles}>System Role</label>
                <TextField
                  fullWidth
                  select
                  variant="filled"
                  value={userData.role}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                  slotProps={{ input: { sx: inputStyles } }}
                >
                  <MenuItem value="USER">User</MenuItem>
                  <MenuItem value="ADMIN">Administrator</MenuItem>
                </TextField>
              </Grid>

              {isUserRole && (
                <Grid item xs={12} sm={6}>
                  <label style={labelStyles}>Site Name</label>
                  <TextField
                    fullWidth
                    variant="filled"
                    value={userData.siteName}
                    error={!userData.siteName.trim()}
                    onChange={(e) => setUserData({ ...userData, siteName: e.target.value })}
                    slotProps={{ input: { sx: inputStyles } }}
                  />
                </Grid>
              )}

              {isUserRole && (
                <Grid item xs={12}>
                  <label style={labelStyles}>Application ID</label>
                  <TextField
                    fullWidth
                    variant="filled"
                    value={userData.applicationId}
                    error={!userData.applicationId.trim()}
                    onChange={(e) => setUserData({ ...userData, applicationId: e.target.value })}
                    slotProps={{ 
                      input: { 
                        sx: inputStyles,
                        endAdornment: (
                          <InputAdornment position="end" sx={{ pr: 1 }}>
                            <IconButton onClick={() => copyToClipboard(userData.applicationId)} edge="end" size="small">
                              <ContentCopyIcon fontSize="small" sx={{ color: COLORS.textMuted }} />
                            </IconButton>
                          </InputAdornment>
                        )
                      } 
                    }}
                  />
                </Grid>
              )}
            </Grid>

            {/* Custom Balanced Switch Container Wrapper */}
            <Box sx={{ 
              p: 2, 
              borderRadius: "6px", 
              bgcolor: userData.isActive ? COLORS.brandGreenLight : "#F4F5F7",
              border: "1px solid",
              borderColor: userData.isActive ? alpha(COLORS.brandGreen, 0.15) : "rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {userData.isActive && <CheckCircleIcon sx={{ color: COLORS.brandGreen, fontSize: 20 }} />}
                <Typography variant="body2" sx={{ fontWeight: 700, color: userData.isActive ? COLORS.brandGreen : COLORS.textMuted }}>
                  Account Status: {userData.isActive ? "Operating Active" : "Suspended"}
                </Typography>
              </Box>
              <Switch
                checked={userData.isActive}
                onChange={(e) => setUserData({ ...userData, isActive: e.target.checked })}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: COLORS.brandGreen },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: COLORS.brandGreen },
                }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={profileLoading || isEmailEmpty || isMissingUserFields}
              startIcon={<SaveIcon />}
              fullWidth
              sx={{
                borderRadius: "6px",
                py: 1.6,
                fontWeight: 700,
                fontSize: "0.95rem",
                textTransform: "none",
                bgcolor: COLORS.brandGreen,
                '&:hover': { bgcolor: "#006241" },
                boxShadow: "none",
                "&.Mui-disabled": { bgcolor: "action.disabledBackground" }
              }}
            >
              {profileLoading ? "Saving Profile..." : "Save Profile Data"}
            </Button>
          </Paper>

          {/* SECTION 2: SECURITY CREDENTIALS CARD */}
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleUpdatePassword}
            sx={{
              maxWidth: 760,
              width: "100%",
              padding: { xs: 3, md: 5 },
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 10px 40px rgba(0,0,0,0.02)",
              backgroundColor: "background.paper",
              display: "flex",
              flexDirection: "column",
              gap: 3.5
            }}
          >
            {/* Red accent line for security warning indicators */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 4, height: 22, bgcolor: COLORS.accentRed, borderRadius: "2px" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", color: "#1A365D", fontSize: "0.85rem" }}>
                Security Credentials
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <label style={labelStyles}>New Password</label>
                <TextField
                  fullWidth
                  variant="filled"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  error={passwordTooShort}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  slotProps={{
                    input: {
                      sx: inputStyles,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPassword((prev) => !prev)} edge="end">
                            {showNewPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <label style={labelStyles}>Confirm New Password</label>
                <TextField
                  fullWidth
                  variant="filled"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  error={passwordsMismatch}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  slotProps={{
                    input: {
                      sx: inputStyles,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword((prev) => !prev)} edge="end">
                            {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
            </Grid>

            {newPassword.length > 0 && (
              <Box sx={{ mt: -1, px: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength.score / 4) * 100}
                  sx={{
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: "#E8EAED",
                    "& .MuiLinearProgress-bar": { backgroundColor: passwordStrength.color },
                  }}
                />
                <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 700, display: "block", mt: 0.8 }}>
                  Password Strength: {passwordStrength.label}
                </Typography>
              </Box>
            )}

            <Button
              type="submit"
              variant="outlined"
              disabled={
                passwordLoading ||
                !newPassword ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword
              }
              startIcon={<LockResetIcon />}
              fullWidth
              sx={{
                borderRadius: "6px",
                py: 1.5,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.95rem",
                borderWidth: "1px",
                borderColor: "#D1D5DB",
                color: "#374151",
                '&:hover': { 
                  borderColor: COLORS.accentRed,
                  bgcolor: alpha(COLORS.accentRed, 0.04),
                  color: COLORS.accentRed
                },
                "&.Mui-disabled": { border: "1px solid #E5E7EB" }
              }}
            >
              {passwordLoading ? "Overwriting..." : "Force Update Password"}
            </Button>
          </Paper>
        </>
      )}
    </Box>
  );
}