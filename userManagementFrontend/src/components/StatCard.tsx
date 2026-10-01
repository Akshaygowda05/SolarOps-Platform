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
        width: "100%",
        height: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.18s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "&:hover": onClick ? { 
          borderColor: iconColor,
          boxShadow: `0 4px 12px ${alpha(iconColor, 0.08)}`
        } : {},
        // This handles the top colored accent border layer
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "3.5px", 
          bgcolor: iconColor, 
          borderRadius: "8px 8px 0 0",
        },
      }}
    >
      {/* Top Header Row (Title and Icon Badge) */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1, mt: 0.2 }}>
        <Typography 
          noWrap
          title={title}
          sx={{
            fontSize: { xs: "0.62rem", sm: "0.68rem" }, 
            fontWeight: 700,
            letterSpacing: "0.06em", 
            textTransform: "uppercase",
            color: "text.secondary", 
            lineHeight: 1.3, 
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </Typography>
        
        {/* Dynamic Light Colored Icon Container */}
        <Box sx={{
          width: { xs: 26, sm: 28 }, 
          height: { xs: 26, sm: 28 }, 
          borderRadius: 1.5,
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          bgcolor: alpha(iconColor, theme.palette.mode === "dark" ? 0.2 : 0.1),
          flexShrink: 0,
        }}>
          <Icon sx={{ fontSize: { xs: 13, sm: 14 }, color: iconColor }} />
        </Box>
      </Box>

      {/* Main Metric Value Row */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, my: { xs: 0.2, sm: 0.5 } }}>
        <Typography sx={{
          fontSize: { xs: "1.35rem", sm: "1.7rem", md: "1.85rem" },
          fontWeight: 800,
          color: "text.primary",
          lineHeight: 1.1, 
          fontVariantNumeric: "tabular-nums",
        }}>
          {typeof count === "number" ? count.toLocaleString() : count}
        </Typography>
        {unit && (
          <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" }, color: "text.secondary", fontWeight: 700 }}>
            {unit}
          </Typography>
        )}
      </Box>

      {/* Footer Row (Trend Indicator and Subtitle) */}
      {(trendValue || subtitle) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.5, minWidth: 0, overflow: "hidden" }}>
          {trendValue && (
            <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.7rem" }, fontWeight: 700, color: finalTrendColor, flexShrink: 0 }}>
              {trendValue}
            </Typography>
          )}
          {subtitle && (
            <Typography 
              noWrap
              title={subtitle}
              sx={{ 
                fontSize: { xs: "0.64rem", sm: "0.7rem" }, 
                color: "text.secondary", 
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
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