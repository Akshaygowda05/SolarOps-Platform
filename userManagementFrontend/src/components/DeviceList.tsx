import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Box,
  InputAdornment,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useMemo } from "react";

// Assuming DeviceItem might have been a complex component, 
// here we represent the data directly in the table rows.
function DeviceModal({
  open,
  onClose,
  title,
  devices,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  devices: any[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      devices.filter(
        (d) =>
          d.name?.toLowerCase().includes(search.toLowerCase()) ||
          d.devEui?.toLowerCase().includes(search.toLowerCase()) ||
          d.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [devices, search]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md" // Increased width to accommodate table columns
      sx={{
        "& .MuiPaper-root": {
          borderRadius: 2.5,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          maxHeight: { xs: "88vh", sm: "80vh" },
          backgroundImage: "none", // Removes the gray overlay in MUI Dark Mode
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "text.primary" }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.2 }}>
            {devices.length} device{devices.length !== 1 ? "s" : ""} total
            {search && filtered.length !== devices.length
              ? ` · ${filtered.length} matching`
              : ""}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* Search Section */}
      <Box sx={{ px: 3, py: 2, bgcolor: "background.paper" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, DevEUI, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
              sx: {
                fontSize: "0.875rem",
                borderRadius: 2,
                bgcolor: "action.hover",
              },
            },
          }}
        />
      </Box>

      {/* Table Content */}
      <DialogContent sx={{ p: 0 }}>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>Device Name</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>DevEUI</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper" }} align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 8, textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                      {search ? "No devices match your search." : "No devices found."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((device) => (
                  <TableRow 
                    key={device.devEui} 
                    hover 
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      {device.name || "Unnamed Device"}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {device.devEui}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                      {device.description || "-"}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          bgcolor: title.includes("Online") ? "success.light" : "action.disabledBackground",
                          color: title.includes("Online") ? "success.contrastText" : "text.secondary",
                        }}
                      >
                        {title.includes("Online") ? "Online" : "Offline"}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}

export default DeviceModal;