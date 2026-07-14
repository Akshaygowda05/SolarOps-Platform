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
        p: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        minWidth: 240,
      }}
    >
      {/* Title / Label */}
      <Typography
        variant="caption"
        fontWeight={700}
        color="text.secondary"
        sx={{ letterSpacing: "0.05em", textTransform: "uppercase" }}
      >
        {label}
      </Typography>

      {/* Main Metric Value */}
      <Typography
        variant="h3"
        fontWeight={700}
        color="text.primary"
        sx={{ lineHeight: 1 }}
      >
        {value}
      </Typography>

      {/* Trend Indicator */}
      <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
        <TrendIcon sx={{ color: trendColor, fontSize: 18 }} />
        
        <Typography
          fontSize={13}
          fontWeight={600}
          color={trendColor}
          component="span"
        >
          {changeValue}
        </Typography>

        <Typography
          fontSize={13}
          fontWeight={500}
          color="text.secondary"
          component="span"
        >
          {changeLabel}
        </Typography>
      </Box>
    </Paper>
  );
}