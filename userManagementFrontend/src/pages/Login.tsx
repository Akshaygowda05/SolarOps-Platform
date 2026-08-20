import { Box } from "@mui/material";
import background from "../assets/login.png";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <Box
      component="main" // 1. Accessibility: Semantic HTML tag
      sx={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        display: "flex", // Centers content cleanly
        alignItems: "center",
        justifyContent: "flex-end",

        // 2. Background Fallback: Prevents blank space while image loads
        backgroundColor: "#121212", 
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        // 3. Dark Overlay
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%", // Ensures responsive wrapping works reliably
          display: "flex",
          justifyContent: {
            xs: "center",
            md: "flex-end",
          },
          px: {
            xs: 2,
            sm: 4,
            md: 8,
            lg: 12,
          },
          py: 4, // 4. Padding safety for small mobile screens
        }}
      >
        <Box
          sx={{
            width: {
              xs: "100%",
              sm: 400,
              md: 420,
            },
          }}
        >
          <LoginForm />
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;