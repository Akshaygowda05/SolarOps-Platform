import { Box } from "@mui/material";
import background from "../assets/login.png";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",

        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.45))",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 2,

          minHeight: "100vh",

          display: "flex",
          justifyContent: {
            xs: "center",
            md: "flex-end",
          },
          alignItems: "center",

          px: {
            xs: 2,
            sm: 4,
            md: 8,
            lg: 12,
          },
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