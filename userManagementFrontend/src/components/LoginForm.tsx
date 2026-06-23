import {
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  IconButton,
  Divider,
  Box,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { FiInstagram, FiYoutube, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { useTheme } from "@mui/material/styles";
import logo from "../assets/Aegeus-Technologies-logo.png";

import { authState } from "../store/authState";
import { login } from "../services/User.service";
import { selectedApplicationState } from "../store/authState";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [, setAuth] = useRecoilState(authState);
  const [, setSelectedApplication] = useRecoilState(selectedApplicationState);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const res = await login(cleanEmail, cleanPassword);

      const { token, name, role, siteName } = res.data;

      setAuth({
        name,
        role,
        token,
        initialized: true,
      });

      localStorage.setItem(
        "auth",
        JSON.stringify({ name, role, token, siteName })
      );

      setPassword("");

      if (role === "ADMIN") {
        navigate("/admin");
        localStorage.removeItem("selectedApplicationId");
        setSelectedApplication(null);
      } else if (role === "USER") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 400, // Reduced slightly to let more background image stay visible
        mx: "auto",
        px: { xs: 2, sm: 0 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          // Transparent/Glass effect so your global background image shows through perfectly
          backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.45)" : "rgba(255, 255, 255, 0.45)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${
            isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.1)"
          }`,
          boxShadow: isDarkMode
            ? "0 20px 40px rgba(0, 0, 0, 0.5)"
            : "0 20px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <img
          src={logo}
          alt="Aegeus Logo"
          style={{ width: 80, display: "block", margin: "0 auto 16px" }}
        />

        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 800,
            mb: 1,
            fontSize: { xs: "1.75rem", sm: "2rem" }, // Larger typography size
            color: isDarkMode ? "#FFFFFF" : "#0F172A", // Styled with requested color
          }}
        >
          Welcome Back
        </Typography>

        <Typography
          variant="body1"
          align="center"
          sx={{
            mb: 3,
            fontSize: "0.95rem", // Increased font size inside login card
            color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(15, 23, 42, 0.7)", 
          }}
        >
          Sign in to manage your clean energy ecosystem
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          slotProps={{
            input: {
              sx: {
                fontSize: "1.05rem", // Increased form text input size
                color: isDarkMode ? "#FFFFFF" : "#0F172A",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.2)",
                },
              },
            },
            inputLabel: {
              sx: {
                fontSize: "0.95rem",
                color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(15, 23, 42, 0.6)",
              },
            },
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(15, 23, 42, 0.5)" }}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                fontSize: "1.05rem", // Increased text sizing
                color: isDarkMode ? "#FFFFFF" : "#0F172A",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(15, 23, 42, 0.2)",
                },
              },
            },
            inputLabel: {
              sx: {
                fontSize: "0.95rem",
                color: isDarkMode ? "rgba(255, 255, 255, 0.6)" : "rgba(15, 23, 42, 0.6)",
              },
            },
          }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          onClick={handleLogin}
          sx={{
            mt: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "1rem",
            backgroundColor: isDarkMode ? "#FFFFFF" : "#0F172A", // Dynamic adaptation using your #0F172A color
            color: isDarkMode ? "#0F172A" : "#FFFFFF",
            "&:hover": {
              backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.9)" : "#1E293B",
            },
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <Divider sx={{ my: 3, borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.1)" }}>
          <Typography variant="caption" sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.4)" : "rgba(15, 23, 42, 0.5)" }}>
            Follow Us
          </Typography>
        </Divider>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <IconButton
            href="https://www.instagram.com/aegeustech/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "#E1306C" }}
          >
            <FiInstagram size={20} />
          </IconButton>

          <IconButton
            href="https://www.youtube.com/@aegeustechnologiesltd"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "#FF0000" }}
          >
            <FiYoutube size={20} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;