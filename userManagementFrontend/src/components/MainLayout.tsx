import { useState, type ReactNode } from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function MainLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Header onDrawerToggle={handleDrawerToggle} />

      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflowY: "auto",
            p: { xs: 1.5, sm: 2, md: 3 },
            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;