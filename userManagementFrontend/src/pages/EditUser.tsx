import { useState, useEffect } from "react";
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
  Switch
} from "@mui/material";
// Using your separate service functions cleanly here
import { fetchUserById, updateUser, updateUserPassword } from "../services/User.service";

export default function EditUser() {
  const params = useParams(); 
  const urlId = params.id || params.userId; 
  const userId = urlId ? parseInt(urlId, 10) : null;

  // State management
  const [userData, setUserData] = useState({ 
    name: "", 
    email: "", 
    role: "USER", 
    isActive: true 
  });
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch user data dynamically on mount using separate service
  useEffect(() => {
    async function fetchUser() {
      if (!userId || isNaN(userId)) {
        setMessage({ type: "error", text: `Invalid User ID provided. Received: "${urlId}"` });
        setFetching(false);
        return;
      }

      try {
        // CLEAN FIX: Separated API call handles the fetch behind the scenes
        const data = await fetchUserById(userId);

        if (!data) throw new Error("No user data returned from backend server.");
        
        setUserData({
          name: data.name || "",
          email: data.email || "",
          role: data.role || "USER",
          isActive: data.isActive !== undefined ? data.isActive : true
        }); 
      } catch (error: any) {
        console.error("Error fetching user:", error);
        setMessage({ type: "error", text: "Could not load user data from backend." });
      } finally {
        setFetching(false);
      }
    }
    fetchUser();
  }, [userId, urlId]);

  // 2. Handle Profile Information Update using separate service
  const handleUpdateProfile = async (e: any) => {
    e.preventDefault();
    
    // FRONTEND SAFETY GUARD: Prevent blank submissions
    if (!userData.email || userData.email.trim() === "") {
      setMessage({ type: "error", text: "Validation Error: Email field cannot be empty!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // CLEAN FIX: Using your separate helper function cleanly, passing the payload data object
      const result = await updateUser(userId!, {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive
      });

      console.log("Update profile response data:", result);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      // Handles Axios deep error parsing strings neatly
      const errorText = error.response?.data?.message || error.message || "Failed to update profile.";
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Password Update using separate service
  const handleUpdatePassword = async (e: any) => {
    e.preventDefault();
    if (!newPassword) {
      setMessage({ type: "error", text: "Password cannot be empty." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // CLEAN FIX: Using separate password modifier function instead of raw fetch strings
      const result = await updateUserPassword(userId!, newPassword);
      console.log("Update password response data:", result);

      setMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword(""); 
    } catch (error: any) {
      const errorText = error.response?.data?.message || error.message || "Failed to update password.";
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isEmailEmpty = !userData.email || userData.email.trim() === "";

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

      {message.text && (
        <Alert severity={message.type === "success" ? "success" : "error"} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {userId && !isNaN(userId) && (
        <>
          <Box component="form" onSubmit={handleUpdateProfile} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }} color="text.primary">
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
              disabled={loading || isEmailEmpty}
              fullWidth
            >
              {loading ? "Processing..." : "Save Profile Data"}
            </Button>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box component="form" onSubmit={handleUpdatePassword}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }} color="text.primary">
              Security Credentials
            </Typography>
            
            <TextField
              fullWidth
              label="Assign New Password"
              type="password"
              variant="outlined"
              margin="dense"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter complex password string"
            />
            
            <Button 
              type="submit" 
              variant="outlined" 
              color="error" 
              disabled={loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? "Updating..." : "Force Update Password"}
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
}