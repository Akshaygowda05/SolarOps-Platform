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
      maxWidth="md"
      sx={{
        "& .MuiPaper-root": {
          borderRadius: { xs: 2, sm: 2.5 },
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          m: { xs: 1.5, sm: 2 },
          maxHeight: { xs: "90vh", sm: "80vh" },
          backgroundImage: "none",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.1rem" }, color: "text.primary" }}>
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
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 1.5, bgcolor: "background.paper" }}>
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
                fontSize: "0.85rem",
                borderRadius: 2,
                bgcolor: "action.hover",
              },
            },
          }}
        />
      </Box>

      {/* Table Content */}
      <DialogContent sx={{ p: 0 }}>
        <TableContainer sx={{ maxHeight: { xs: 340, sm: 420 }, overflowX: "auto" }}>
          <Table stickyHeader size="small" sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper", px: { xs: 1.5, sm: 2 }, py: 1.2 }}>Device Name</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper", px: { xs: 1.5, sm: 2 }, py: 1.2 }}>DevEUI</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper", px: { xs: 1.5, sm: 2 }, py: 1.2 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "background.paper", px: { xs: 1.5, sm: 2 }, py: 1.2 }} align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 6, textAlign: "center" }}>
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
                    <TableCell sx={{ fontWeight: 500, px: { xs: 1.5, sm: 2 }, py: 1.2 }}>
                      {device.name || "Unnamed Device"}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem", px: { xs: 1.5, sm: 2 }, py: 1.2 }}>
                      {device.devEui}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem", px: { xs: 1.5, sm: 2 }, py: 1.2 }}>
                      {device.description || "-"}
                    </TableCell>
                    <TableCell align="right" sx={{ px: { xs: 1.5, sm: 2 }, py: 1.2 }}>
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