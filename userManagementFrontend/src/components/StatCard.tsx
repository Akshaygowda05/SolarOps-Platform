import { Box, Typography, alpha, useTheme } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

const BRAND_GREEN = "#169647";
const BRAND_ORANGE = "#E07B2A";

interface StatCardProps {
  title: string;
  count: number | string;
  onClick?: () => void;
  icon: SvgIconComponent;
  iconColor?: string;
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
  iconColor = BRAND_GREEN,
  subtitle,
  unit,
  trendValue,
  trendColor = BRAND_GREEN,
}: StatCardProps) {
  const theme = useTheme();

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
        transition: "border-color 0.18s ease",
        "&:hover": onClick ? { borderColor: iconColor } : {},
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "3px",
          bgcolor: iconColor,
          borderRadius: "8px 8px 0 0",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5, mt: 0.5 }}>
        <Typography sx={{
          fontSize: "0.67rem", fontWeight: 500,
          letterSpacing: "0.07em", textTransform: "uppercase",
          color: "text.secondary", lineHeight: 1.3, maxWidth: "72%",
        }}>
          {title}
        </Typography>
        <Box sx={{
          width: 28, height: 28, borderRadius: 1.5,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: alpha(iconColor, theme.palette.mode === "dark" ? 0.2 : 0.1),
          flexShrink: 0,
        }}>
          <Icon sx={{ fontSize: 14, color: iconColor }} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
        <Typography sx={{
          fontSize: { xs: "1.6rem", sm: "1.8rem" },
          fontWeight: 500, color: "text.primary",
          lineHeight: 1, fontVariantNumeric: "tabular-nums",
        }}>
          {typeof count === "number" ? count.toLocaleString() : count}
        </Typography>
        {unit && (
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 500 }}>
            {unit}
          </Typography>
        )}
      </Box>

      {(trendValue || subtitle) && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.7 }}>
          {trendValue && (
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: trendColor }}>
              {trendValue}
            </Typography>
          )}
          {subtitle && (
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

export default StatCard;
export { BRAND_GREEN, BRAND_ORANGE };