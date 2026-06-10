import { Box, Typography, alpha, useTheme } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  title: string;
  count: number | string;
  onClick?: () => void;
  icon: SvgIconComponent;
  iconColor?: string;
  subtitle?: string;
  unit?: string;
}

function StatCard({
  title,
  count,
  onClick,
  icon: Icon,
  iconColor = "#6b7280",
  subtitle,
  unit,
}: StatCardProps) {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        flex: "1 1 180px",
        minWidth: { xs: "calc(50% - 8px)", sm: 160 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        // UPDATED: Use theme background and divider
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        "&:hover": onClick
          ? { 
              boxShadow: theme.shadows[2],
              transform: "translateY(-2px)",
              borderColor: "primary.main"
            }
          : {},
      }}
    >
      {/* Title + icon */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            // UPDATED: Use secondary text color
            color: "text.secondary",
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(iconColor, theme.palette.mode === 'dark' ? 0.2 : 0.1),
          }}
        >
          <Icon sx={{ fontSize: 15, color: iconColor }} />
        </Box>
      </Box>

      {/* Count + unit */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
        <Typography
          sx={{
            fontSize: { xs: "1.75rem", sm: "2rem" },
            fontWeight: 700,
            // UPDATED: Use primary text color
            color: "text.primary",
            lineHeight: 1,
          }}
        >
          {typeof count === "number" ? count.toLocaleString() : count}
        </Typography>
        {unit && (
          <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", fontWeight: 500 }}>
            {unit}
          </Typography>
        )}
      </Box>

      {/* Subtitle */}
      {subtitle && (
        <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mt: 0.8 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default StatCard;