import { Box, Typography, Chip, alpha } from "@mui/material";
import RouterIcon from "@mui/icons-material/Router";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function DeviceItem({ device }: { device: any }) {
  const isActive = device.status === "active" || device.isActive;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: 1, sm: 2 },
        p: { xs: 1.5, sm: 2 },
        mb: 1.5,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? alpha("#ffffff", 0.03)
            : alpha("#000000", 0.02),
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          borderColor: "primary.main",
        },
        "&:last-child": { mb: 0 },
      }}
    >
      {/* Device icon */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: 2,
          background: (theme) =>
            isActive
              ? alpha(theme.palette.success.main, 0.12)
              : alpha(theme.palette.grey[500], 0.12),
        }}
      >
        <RouterIcon
          sx={{
            fontSize: 22,
            color: isActive ? "success.main" : "text.disabled",
          }}
        />
      </Box>

      {/* Text block */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "0.9rem", sm: "0.95rem" },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {device.name}
        </Typography>

        {device.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.82rem" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {device.description}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
          <AccessTimeIcon sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" color="text.disabled">
            {new Date(device.lastSeenAt).toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* Status chip */}
      <Chip
        label={isActive ? "Active" : "Inactive"}
        size="small"
        sx={{
          height: 24,
          fontWeight: 600,
          fontSize: "0.7rem",
          alignSelf: { xs: "flex-start", sm: "center" },
          bgcolor: (theme) =>
            isActive
              ? alpha(theme.palette.success.main, 0.12)
              : alpha(theme.palette.grey[500], 0.12),
          color: isActive ? "success.main" : "text.secondary",
          border: "1px solid",
          borderColor: (theme) =>
            isActive
              ? alpha(theme.palette.success.main, 0.3)
              : alpha(theme.palette.grey[500], 0.3),
        }}
      />
    </Box>
  );
}

export default DeviceItem;