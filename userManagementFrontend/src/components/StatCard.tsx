import { Box, Typography, alpha, useTheme } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

// Your custom color palette constants
const COLOR_PURPLE = "#7B76B5";
const COLOR_GREEN = "#93D251";
const COLOR_BLUE = "#00B8FB";
const COLOR_YELLOW = "#FBC84B";

interface StatCardProps {
  title: string;
  count: number | string;
  onClick?: () => void;
  icon: SvgIconComponent;
  iconColor?: string; // Pass COLOR_PURPLE, COLOR_GREEN, etc. here
  subtitle?: string;
  unit?: string;
  trendValue?: string;
  trendColor?: string;
}

function StatCard({
  title,
  count,
  onClick,
  icon: Icon,
  iconColor = COLOR_PURPLE,
  subtitle,
  unit,
  trendValue,
  trendColor,
}: StatCardProps) {
  const theme = useTheme();
  
  // Fallback to the main icon color for the trend text if no explicit trendColor is provided
  const finalTrendColor = trendColor || iconColor;

  return (
    <Box
      onClick={onClick}
      sx={{
        flex: "1 1 180px",
        minWidth: { xs: "calc(50% - 8px)", sm: 160 },
        position: "relative",
        overflow: "hidden",
        p: { xs: 1.8, sm: 2.2 },
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.18s ease",
        "&:hover": onClick ? { 
          borderColor: iconColor,
          boxShadow: `0 4px 12px ${alpha(iconColor, 0.08)}`
        } : {},
        // This handles the top colored accent border layer
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "4px", 
          bgcolor: iconColor, 
          borderRadius: "8px 8px 0 0",
        },
      }}
    >
      {/* Top Header Row (Title and Icon Badge) */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5, mt: 0.5 }}>
        <Typography sx={{
          fontSize: "0.67rem", 
          fontWeight: 700, // Made bold and prominent
          letterSpacing: "0.07em", 
          textTransform: "uppercase",
          color: "text.secondary", 
          lineHeight: 1.3, 
          maxWidth: "72%",
        }}>
          {title}
        </Typography>
        
        {/* Dynamic Light Colored Icon Container */}
        <Box sx={{
          width: 28, height: 28, borderRadius: 1.5,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: alpha(iconColor, theme.palette.mode === "dark" ? 0.2 : 0.1),
          flexShrink: 0,
        }}>
          <Icon sx={{ fontSize: 14, color: iconColor }} />
        </Box>
      </Box>

      {/* Main Metric Value Row */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
        <Typography sx={{
          fontSize: { xs: "1.6rem", sm: "1.8rem" },
          fontWeight: 800, // Maximized visual weight for the main inner number
          color: "text.primary",
          lineHeight: 1, 
          fontVariantNumeric: "tabular-nums",
        }}>
          {typeof count === "number" ? count.toLocaleString() : count}
        </Typography>
        {unit && (
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 700 }}>
            {unit}
          </Typography>
        )}
      </Box>

      {/* Footer Row (Trend Indicator and Subtitle) */}
      {(trendValue || subtitle) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.7 }}>
          {trendValue && (
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: finalTrendColor }}>
              {trendValue}
            </Typography>
          )}
          {subtitle && (
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 600 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

export default StatCard;
export { COLOR_PURPLE, COLOR_GREEN, COLOR_BLUE, COLOR_YELLOW };