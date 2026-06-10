import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip, 
  IconButton, Tooltip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, TablePagination, Avatar,
  useTheme, alpha // ADDED: useTheme for dynamic colors
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

// Icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'; 
import { deleteUser } from "../services/User.service";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  application?: {
    name: string;
  };
}

function Users() {
  const theme = useTheme(); // CHANGED: Added to access current theme (Light/Dark)
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/v1/users", {
        params: { page: page + 1, limit: limit }
      });
      if (res.data.data) {
        setUsers(res.data.data);
        setTotalCount(res.data.total || 0);
      } else {
        setUsers(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await deleteUser(deleteId);
        fetchUsers();
        setDeleteId(null);
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  return (
    // CHANGED: bgcolor changed to background.default for Dark Mode support
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      
      {/* --- HEADER --- */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: '-0.5px' }}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}> {/* CHANGED: color to text.secondary */}
            Manage permissions and account status for your team.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/users/create")}
          sx={{ 
            borderRadius: '10px', 
            textTransform: "none", 
            fontWeight: 600, 
            px: 3, 
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 14px 0 rgba(0,118,255,0.39)' // CHANGED: Remove shadow in dark mode
          }}
        >
          Create User
        </Button>
      </Box>

      {/* --- TABLE --- */}
      {/* CHANGED: bgcolor set to background.paper and shadow adjusted for dark mode */}
      <TableContainer component={Paper} sx={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          border: "1px solid", 
          borderColor: "divider", // CHANGED: Hard color to divider token
          boxShadow: theme.palette.mode === 'dark' ? "none" : "0 10px 30px rgba(0,0,0,0.03)", 
          bgcolor: "background.paper" 
        }}>
        <Table sx={{ minWidth: 700 }}>
          {/* CHANGED: bgcolor changed from grey.50 to action.hover for dark mode compatibility */}
          <TableHead sx={{ bgcolor: "action.hover" }}> 
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>IDENTIFIED USER</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>EMAIL</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ACCESS ROLE</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>APPLICATION</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }} align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => {
              const isAdmin = user.role.toUpperCase() === "ADMIN";

              return (
                <TableRow 
                  key={user.id} 
                  hover 
                  sx={{ 
                    // CHANGED: uses theme palette alpha for Admin highlight instead of hardcoded RGBA
                    bgcolor: isAdmin ? alpha(theme.palette.primary.main, 0.05) : "inherit" 
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          // CHANGED: grey.200 changed to action.selected for dark mode
                          bgcolor: isAdmin ? "primary.main" : "action.selected", 
                          color: isAdmin ? "white" : "text.secondary" // CHANGED: grey.600 to text.secondary
                        }}
                      >
                        {isAdmin ? <AdminPanelSettingsIcon sx={{ fontSize: 18 }} /> : <PersonOutlinedIcon sx={{ fontSize: 18 }} />}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: isAdmin ? 700 : 500, color: isAdmin ? "primary.main" : "text.primary" }}>
                          {user.name}
                        </Typography>
                        {isAdmin && (
                            <Typography sx={{ fontSize: '10px', fontWeight: 800, color: 'primary.main', opacity: 0.8 }}>
                                SYSTEM PRIVILEGED
                            </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{user.email}</TableCell>

                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      variant={isAdmin ? "filled" : "outlined"}
                      color={isAdmin ? "primary" : "default"}
                      sx={{ 
                        fontWeight: 800, 
                        fontSize: "0.65rem",
                        borderRadius: '6px',
                        // CHANGED: borderColor set to divider for dark mode
                        borderColor: "divider",
                        // CHANGED: color adjustment for non-admin roles
                        color: isAdmin ? "white" : "text.secondary"
                      }} 
                    />
                  </TableCell>

                  <TableCell sx={{ fontWeight: 500, color: "text.primary" }}>{user.application?.name || "-"}</TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* CHANGED: bgcolor success.main and text.disabled for dynamic themes */}
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: user.isActive ? "success.main" : "text.disabled" }} />
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: user.isActive ? "success.main" : "text.secondary" }}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="Edit Permissions">
                      <IconButton size="small" onClick={() => navigate(`/users/edit/${user.id}`)} sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Account">
                      <IconButton size="small" onClick={() => setDeleteId(user.id)} sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: '1px solid', borderColor: 'divider', color: 'text.primary' }} // CHANGED: borderColor and color
        />
      </TableContainer>

      {/* --- DELETE DIALOG --- */}
      {/* CHANGED: PaperProps updated to use background.paper and text.primary for Dark Mode */}
      <Dialog 
        open={Boolean(deleteId)} 
        onClose={() => setDeleteId(null)} 
        slotProps={{ sx: { borderRadius: 3, p: 1, bgcolor: "background.paper", backgroundImage: 'none' } } as any}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "text.secondary" }}>
            Warning: Deleting this user will revoke all access. This action is permanent.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit" sx={{ fontWeight: 600, color: "text.secondary" }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Users;