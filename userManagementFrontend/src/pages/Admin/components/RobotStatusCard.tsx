import { Paper, Typography, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface MetricCardProps {
  label: string;
  value: string | number;
  changeValue: string;
  changeLabel: string;
  isPositive?: boolean;
}

export default function MetricCard({
  label,
  value,
  changeValue,
  changeLabel,
  isPositive = true,
}: MetricCardProps) {
  const trendColor = isPositive ? "success.main" : "error.main";
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        minWidth: 180,
      }}
    >
      {/* Title / Label */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700, fontSize: 11 }}
      >
        {label}
      </Typography>

      {/* Main Metric Value */}
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, lineHeight: 1 }}
        color="text.primary"
      >
        {value}
      </Typography>

      {/* Trend Indicator */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
        <TrendIcon sx={{ color: trendColor, fontSize: 15 }} />

        <Typography sx={{ fontSize: 12, fontWeight: 600 }} color={trendColor} component="span">
          {changeValue}
        </Typography>

        <Typography sx={{ fontSize: 12, fontWeight: 600 }} color="text.secondary" component="span">
          {changeLabel}
        </Typography>
      </Box>
    </Paper>
  );
}