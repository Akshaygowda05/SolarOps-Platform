import { useState, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Auth & Socket Hooks
import { useAuthInit } from "./hooks/useAuthInit";
import { useSocketInit } from "./hooks/useSocketInit";

// Context
import { ColorModeContext } from "./context/ColorModeContext";

// Core Components & Layouts
import MainLayout from "./components/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminApplicationGuard from "./components/AdminApplicationGuard";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashBoard";
import Users from "./pages/Users";
import CreateUser from "./pages/CreateUser";
import Devices from "./pages/Devices";
import MulticastGroup from "./pages/MulticastGorup";
import BatteryPages from "./pages/BatteryPages";
import Logs from "./pages/Logs";
import DeviceDetail from "./pages/deviceDetail";
import { SiteConfigPage } from "./pages/siteconfigPage";
import Report from "./pages/Report";
import EditUser from "./pages/EditUser";
import AdminPortal from "./pages/Tenants"; 
import ApplicationPage from "./pages/ApplicationPage";
import { usePageTitle } from "./hooks/usePageTitle";

import './index.css';

// Layout Wrapper
const ProtectedAppLayout = () => (
  <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
    <AdminApplicationGuard>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </AdminApplicationGuard>
  </ProtectedRoute>
);

function App() {
  useAuthInit();
  useSocketInit();

  const [mode, setMode] = useState<'light' | 'dark'>(
    (localStorage.getItem("theme") as 'light' | 'dark') || "light"
  );

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prev) => {
        const newMode = prev === "light" ? "dark" : "light";
        localStorage.setItem("theme", newMode);
        return newMode;
      });
    },
  }), []);

  const PageTitleHandler = () => {
  usePageTitle();
  return null;
};

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: "#169647" },
      background: {
        default: mode === "light" ? "#fbfcfd" : "#0f172a",
        paper: mode === "light" ? "#ffffff" : "#1e293b",
      },
    },
    typography: {
      fontFamily: "'Open Sans', sans-serif",
    },
    shape: { borderRadius: 12 },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> 
        <BrowserRouter>
        <PageTitleHandler />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Login />} />

            {/* Standard Guarded Routes */}
            <Route element={<ProtectedAppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/devices/:devEui" element={<DeviceDetail />} />
              <Route path="/multicast-groups" element={<MulticastGroup />} />
              <Route path="/Robotsbatteies" element={<BatteryPages />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/reports" element={<Report />} />
            </Route>

            {/* Guarded without AdminApplicationGuard */}
            <Route element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }>
              <Route path="/site-config" element={<SiteConfigPage />} />
              <Route path="/admin/tenants/:tenantId/applications" element={<ApplicationPage />} />
            </Route>

            {/* Admin-Only Routes */}
            <Route element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/users/edit/:id" element={<EditUser />} />
              <Route path="/tenants" element={<AdminPortal />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;