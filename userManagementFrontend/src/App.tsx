import { useState, useMemo, createContext } from "react"; // Added hooks
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"; // Added MUI Theme tools
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashBoard";
import { useAuthInit } from "./hooks/useAuthInit";
import MainLayout from "./components/MainLayout";
import Users from "./pages/Users";
import CreateUser from "./pages/CreateUser";
import Devices from "./pages/Devices";
import MulticastGroup from "./pages/MulticastGorup";
import BatteryPages from "./pages/BatteryPages";
import Logs from "./pages/Logs";
import { useSocketInit } from "./hooks/useSocketInit";
import DeviceDetail from "./pages/deviceDetail";
import { SiteConfigPage } from "./pages/siteconfigPage";
import Report from "./pages/Report";
import EditUser from "./pages/EditUser";
import AdminPortal from "./pages/Tenants"; 
import AdminApplicationGuard from "./components/AdminApplicationGuard";

// so ondu context create maditivi, admele adannu useContext hook use madi consume madtivi
export const ColorModeContext = createContext({ toggleColorMode: () => {} });


function App() {
  useAuthInit();
  useSocketInit();

  // ivaga mode state create madtivi, admele adannu localStorage nalli store madtivi, app reload aagidaga theme preference save irutte
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

  // ✅ 3. Create the actual MUI Theme object
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: "#169647" },
      background: {
        default: mode === "light" ? "#fbfcfd" : "#0f172a",
        paper: mode === "light" ? "#ffffff" : "#1e293b",
      },
    },
    shape: { borderRadius: 12 },
  }), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline /> 
        <BrowserRouter>
          <Routes>
            {/* public route */}
            <Route path="/" element={<Login />} />

            {/* protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["USER","ADMIN"]}>
                  <AdminApplicationGuard >
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                  </AdminApplicationGuard>
                </ProtectedRoute>
              } />

            <Route
              path="/multicast-groups"
              element={
                <ProtectedRoute allowedRoles={["USER","ADMIN"]}>
                  <AdminApplicationGuard>
                  <MainLayout>
                    <MulticastGroup />
                  </MainLayout>
                  </AdminApplicationGuard>
                </ProtectedRoute>
              } />

            <Route
              path="/logs"
              element={
                <ProtectedRoute allowedRoles={["USER","ADMIN"]}>
                  <AdminApplicationGuard>
                  <MainLayout>
                    <Logs />
                  </MainLayout>
                  </AdminApplicationGuard>
                </ProtectedRoute>
              } />

               <Route
              path="/site-config"
              element={
                <ProtectedRoute allowedRoles={["USER","ADMIN"]}>
                  <MainLayout>
                    <SiteConfigPage />
                  </MainLayout>
                </ProtectedRoute>
              } />

            <Route
              path="/Robotsbatteies"
              element={
                <ProtectedRoute allowedRoles={["USER","ADMIN"]}>
                  <AdminApplicationGuard>
                    <MainLayout>
                      <BatteryPages />
                    </MainLayout>
                  </AdminApplicationGuard>
                </ProtectedRoute>
              } />

            <Route
              path="/devices"
              element={
                <ProtectedRoute allowedRoles={["USER","ADMIN"]}>
                  <AdminApplicationGuard>
                    <MainLayout>
                      <Devices />
                    </MainLayout>
                  </AdminApplicationGuard>
                </ProtectedRoute>
              } />

            <Route
              path='/admin'
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <Users />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenants"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <AdminPortal />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

             <Route
              path="/users/edit/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <EditUser />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            


             <Route
              path="/devices/:devEui"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                  <AdminApplicationGuard>
                  <MainLayout>
                    <DeviceDetail />
                  </MainLayout>
                  </AdminApplicationGuard>
                </ProtectedRoute>
              }
            />
             <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                  <AdminApplicationGuard>
                    <MainLayout>
                      <Report />
                    </MainLayout>
                  </AdminApplicationGuard>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users/create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <MainLayout>
                    <CreateUser />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;