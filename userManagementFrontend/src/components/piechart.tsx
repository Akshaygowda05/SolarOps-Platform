import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography } from "@mui/material";

const BRAND_GREEN = "#169647";
const BRAND_ORANGE = "#E07B2A";

function DeviceStatusChart({
  activeCount,
  inactiveCount,
}: {
  activeCount: number;
  inactiveCount: number;
}) {
  const total = activeCount + inactiveCount;
  const pct = total ? ((activeCount / total) * 100).toFixed(0) : "0";

  return (
    <Box sx={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{ position: "relative", width: 180, height: 180 }}>
        <PieChart
          series={[{
            data: [
              { id: 0, value: activeCount, label: "Online", color: BRAND_GREEN },
              { id: 1, value: inactiveCount, label: "Offline", color: BRAND_ORANGE },
            ],
            innerRadius: 52,
            outerRadius: 80,
            paddingAngle: 3,
            cornerRadius: 4,
            highlightScope: { fade: "global", highlight: "item" },
          }]}
          width={180}
          height={180}
          slotProps={{ legend: { sx: { display: "none" } } }}
          margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
        />
        {/* Center label */}
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center", pointerEvents: "none",
        }}>
          <Typography sx={{ fontSize: "1.4rem", fontWeight: 500, lineHeight: 1, color: "text.primary" }}>
            {pct}%
          </Typography>
          <Typography sx={{ fontSize: "0.62rem", color: "text.secondary", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            online
          </Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", gap: 2.5, mt: 1 }}>
        {[
          { label: "Online", color: BRAND_GREEN, count: activeCount },
          { label: "Offline", color: BRAND_ORANGE, count: inactiveCount },
        ].map((item) => (
          <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "2px", bgcolor: item.color }} />
            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
              {item.label}{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {item.count}
              </Box>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default DeviceStatusChart;