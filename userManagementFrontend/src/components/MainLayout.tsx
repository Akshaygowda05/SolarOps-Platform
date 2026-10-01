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
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header onDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          ml: { xs: 0, md: "240px" },
          mt: { xs: "56px", sm: "64px" },
          p: { xs: 1.5, sm: 2, md: 3 },
          minHeight: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" },
          transition: "margin 0.2s ease",
          boxSizing: "border-box",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default MainLayout;