import { Box, Typography } from "@mui/material";
import ErrorLogsCard from "../components/errorlog";
import GatewayCard from "../components/Gateway";
import CoreHealthCard from "../components/HealthCard";

function Logs() {
  return (
    <Box sx={{ p: 3 ,mb: 4}}>
    <Box  sx={{mb: 3}}>
  <Typography variant="h5"  sx={{ letterSpacing: '-0.5px', fontWeight: 700, color: "text.primary" }}>
    System Alerts & Logs
  </Typography>
  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, }}>
    Real-time monitoring of robots, gateways and system health
  </Typography>
</Box>
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>

        {/* Left Side — fixed width, cards stay compact */}
        <Box sx={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          <CoreHealthCard />
          <GatewayCard />
        </Box>

        {/* Right Side — takes ALL remaining space */}
        <Box sx={{ flexGrow: 1, minWidth: 200 }}>
          <ErrorLogsCard />
        </Box>

      </Box>
    </Box>
  );
}

export default Logs;