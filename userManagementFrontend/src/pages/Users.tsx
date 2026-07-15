import { useEffect, useState, useCallback } from "react";
import type { ChangeEvent } from "react";
import { 
  Box, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Chip, 
  IconButton, Tooltip, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, TablePagination, Avatar,
  useTheme, alpha
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
  const theme = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // 1. TODO: Replace this with your actual auth context/state (e.g., const { user } = useAuth();)
  const currentUserId = 1; 

  const fetchUsers = useCallback(async () => {
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
  }, [page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default", minHeight: "100vh" }}>
      
      {/* --- HEADER --- */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: '-0.5px' }}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 14px 0 rgba(0,118,255,0.39)'
          }}
        >
          Create User
        </Button>
      </Box>

      {/* --- TABLE --- */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden', 
          border: "1px solid", 
          borderColor: "divider",
          boxShadow: theme.palette.mode === 'dark' ? "none" : "0 10px 30px rgba(0,0,0,0.03)", 
          bgcolor: "background.paper" 
        }}
      >
        <Table sx={{ minWidth: 700 }}>
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
              // 2. Determine if this user row is the logged-in user
              const isMe = user.id === currentUserId; 

              return (
                <TableRow 
                  key={user.id} 
                  hover 
                  sx={{ 
                    bgcolor: isAdmin ? alpha(theme.palette.primary.main, 0.05) : "inherit" 
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: isAdmin ? "primary.main" : "action.selected", 
                          color: isAdmin ? "primary.contrastText" : "text.secondary"
                        }}
                      >
                        {isAdmin ? <AdminPanelSettingsIcon sx={{ fontSize: 18 }} /> : <PersonOutlinedIcon sx={{ fontSize: 18 }} />}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: isAdmin ? 700 : 500, color: isAdmin ? "primary.main" : "text.primary" }}>
                          {user.name} {isMe && "(You)"}
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
                        borderColor: "divider",
                        color: isAdmin ? "primary.contrastText" : "text.secondary"
                      }} 
                    />
                  </TableCell>

                  <TableCell sx={{ fontWeight: 500, color: "text.primary" }}>{user.application?.name || "-"}</TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    
                    {/* 3. Conditional tooltips and disabled logic based on self-deletion rules */}
                    <Tooltip title={isMe ? "You cannot delete your own account" : "Delete Account"}>
                      <span>
                        <IconButton 
                          size="small" 
                          onClick={() => setDeleteId(user.id)} 
                          disabled={isMe}
                          sx={{ 
                            color: "text.secondary", 
                            "&:hover": { color: isMe ? "inherit" : "error.main" } 
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
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
          sx={{ borderTop: '1px solid', borderColor: 'divider', color: 'text.primary' }}
        />
      </TableContainer>

      {/* --- DELETE DIALOG --- */}
      <Dialog 
        open={Boolean(deleteId)} 
        onClose={() => setDeleteId(null)} 
        slotProps={{
          paper: {
          sx: { 
            borderRadius: 3, 
            p: 1, 
            bgcolor: "background.paper", 
            backgroundImage: 'none'
          }
        }
        }}
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