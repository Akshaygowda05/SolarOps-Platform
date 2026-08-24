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
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ShieldIcon from '@mui/icons-material/Shield'; 
import PersonIcon from '@mui/icons-material/Person'; 
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

  // Dynamic Theme Palette Adaptations
  const isDark = theme.palette.mode === "dark";
  
  const COLORS = {
    primary: isDark ? "#FFB74D" : "#E65100", // Adapted primary orange/amber for contrast
    primaryLight: alpha(isDark ? "#FFB74D" : "#E65100", 0.12),
    active: isDark ? "#7986CB" : "#3F51B5",   // Indigo
    activeLight: alpha(isDark ? "#7986CB" : "#3F51B5", 0.15),
    inactive: theme.palette.text.disabled,
    inactiveLight: alpha(theme.palette.text.disabled, 0.1),
  };

  // Actual auth placeholder
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
    <Box sx={{ p: { xs: 2, md: 5 }, bgcolor: "background.default", minHeight: "100vh" }}>
      
      {/* --- HEADER --- */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", alignItems: "center", mb: 5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: '-0.75px', mb: 0.5 }}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
            Configure operational profiles, security access scopes, and team deployments.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/users/create")}
          sx={{ 
            borderRadius: '12px', 
            textTransform: "none", 
            fontWeight: 700, 
            px: 3, 
            py: 1.2,
            bgcolor: COLORS.primary,
            color: isDark ? "#000000" : "#FFFFFF",
            '&:hover': {
              bgcolor: alpha(COLORS.primary, 0.85),
            },
            boxShadow: `0 8px 20px 0 ${alpha(COLORS.primary, 0.25)}`
          }}
        >
          Create User
        </Button>
      </Box>

      {/* --- TABLE CONTAINER --- */}
      <TableContainer 
        component={Paper} 
        elevation={0}
        sx={{ 
          borderRadius: "16px", 
          boxShadow: isDark ? `0 4px 24px ${alpha("#000", 0.4)}` : "0 4px 24px rgba(0,0,0,0.04)", 
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden"
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.05) }}> 
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.5px' }}>TEAM MEMBER</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.5px' }}>EMAIL ADDRESS</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.5px' }}>ROLE</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.5px' }}>ASSIGNED APP</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.5px' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: '0.5px' }} align="right">ACTIONS</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => {
              const isAdmin = user.role.toUpperCase() === "ADMIN";
              const isMe = user.id === currentUserId; 

              return (
                <TableRow 
                  key={user.id} 
                  sx={{ 
                    transition: "all 0.2s ease",
                    '&:hover': {
                      bgcolor: alpha(COLORS.primary, 0.04),
                    },
                    borderBottom: "1px solid",
                    borderColor: "divider"
                  }}
                >
                  {/* Identity Column */}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 38, 
                          height: 38, 
                          bgcolor: isAdmin ? COLORS.primaryLight : "action.hover", 
                          color: isAdmin ? COLORS.primary : "text.secondary",
                          borderRadius: "10px"
                        }}
                      >
                        {isAdmin ? <ShieldIcon sx={{ fontSize: 20 }} /> : <PersonIcon sx={{ fontSize: 20 }} />}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                          {user.name} {isMe && <Box component="span" sx={{ color: COLORS.primary, ml: 0.5, fontWeight: 500 }}>(You)</Box>}
                        </Typography>
                        {isAdmin && (
                          <Typography sx={{ fontSize: '9px', fontWeight: 800, color: COLORS.primary, letterSpacing: '0.5px', mt: 0.2 }}>
                            ADMINISTRATOR
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Email */}
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}>
                    {user.email}
                  </TableCell>

                  {/* Role Badge */}
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: "0.7rem",
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        bgcolor: isAdmin ? COLORS.primaryLight : "action.hover",
                        color: isAdmin ? COLORS.primary : "text.secondary",
                        border: "none"
                      }} 
                    />
                  </TableCell>

                  {/* Application */}
                  <TableCell sx={{ fontWeight: 600, color: "text.primary", fontSize: '0.85rem' }}>
                    {user.application?.name || <Typography component="span" sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>None</Typography>}
                  </TableCell>

                  {/* Status Toggle Look */}
                  <TableCell>
                    <Chip
                      label={user.isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        borderRadius: "6px",
                        bgcolor: user.isActive ? COLORS.activeLight : COLORS.inactiveLight,
                        color: user.isActive ? COLORS.active : COLORS.inactive,
                      }}
                    />
                  </TableCell>

                  {/* Actions Panel */}
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <Tooltip title="Edit Permissions">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/users/edit/${user.id}`)} 
                          sx={{ 
                            color: "text.secondary", 
                            borderRadius: "8px",
                            "&:hover": { color: COLORS.primary, bgcolor: COLORS.primaryLight } 
                          }}
                        >
                          <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={isMe ? "Self-deletion disabled" : "Remove Account"}>
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => setDeleteId(user.id)} 
                            disabled={isMe}
                            sx={{ 
                              color: "text.secondary", 
                              borderRadius: "8px",
                              "&:hover": { 
                                color: isMe ? "inherit" : "error.main", 
                                bgcolor: isMe ? "transparent" : alpha(theme.palette.error.main, 0.12)
                              } 
                            }}
                          >
                            <DeleteTwoToneIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
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
          sx={{ borderTop: '1px solid', borderColor: 'divider', color: 'text.secondary', fontWeight: 600 }}
        />
      </TableContainer>

      {/* --- DELETE DIALOG --- */}
      <Dialog 
        open={Boolean(deleteId)} 
        onClose={() => setDeleteId(null)} 
        slotProps={{
          paper: {
            sx: { 
              borderRadius: "16px", 
              p: 1.5, 
              bgcolor: "background.paper", 
              backgroundImage: 'none',
              boxShadow: isDark ? `0 20px 60px ${alpha("#000", 0.6)}` : "0 20px 60px rgba(0,0,0,0.15)"
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "text.primary", px: 3 }}>Confirm Deletion</DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <DialogContentText sx={{ color: "text.secondary", fontWeight: 500 }}>
            Are you sure you want to remove this account? This action terminates all assigned tokens and system permissions permanently.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3, pt: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteId(null)} 
            color="inherit" 
            sx={{ fontWeight: 700, textTransform: 'none', color: "text.secondary", borderRadius: "8px" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained" 
            sx={{ borderRadius: "8px", fontWeight: 700, textTransform: 'none', px: 3, boxShadow: 'none' }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Users;