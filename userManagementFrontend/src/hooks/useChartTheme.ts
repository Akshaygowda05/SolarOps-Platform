// hooks/useChartTheme.ts
import { useTheme } from "@mui/material";

export function useChartTheme() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return {
    theme, // passes the full theme if needed for custom components
    isDark,
    brandColor: theme.palette.primary.main,    // Your primary brand color
    textColor: theme.palette.text.primary,     // Dark text in light mode, white in dark mode
    secondaryText: theme.palette.text.secondary, // Subtle gray text
    bgColor: theme.palette.background.paper,   // Card background surface color
    borderColor: theme.palette.divider,        // Perfect matching border line color
    cursorFill: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)",
  };
}