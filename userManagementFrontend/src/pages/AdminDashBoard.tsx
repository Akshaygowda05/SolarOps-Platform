import { Box, Typography, Paper, Alert } from "@mui/material";
import EngineeringIcon from "@mui/icons-material/Engineering"; // Optional icon if you use MUI icons

export default function AdminDashboard() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", p: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          maxWidth: 500, 
          padding: 4, 
          borderRadius: 3, 
          textAlign: "center",
          backgroundColor: "background.paper", // Automatically adjusts to light/dark mode
        }}
      >
        {/* Large icon header */}
        <EngineeringIcon sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />
        
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
          Admin Dashboard
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We are currently working hard behind the scenes to configure this terminal.
        </Typography>

        {/* Embedded system notice */}
        <Alert severity="warning" variant="outlined" sx={{ justifyContent: "center" }}>
          Feature still under development
        </Alert>
      </Paper>
    </Box>
  );
}