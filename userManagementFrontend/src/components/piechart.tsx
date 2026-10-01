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
    <Box sx={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PieChart
          series={[{
            data: [
              { id: 0, value: activeCount, label: "Online", color: BRAND_GREEN },
              { id: 1, value: inactiveCount, label: "Offline", color: BRAND_ORANGE },
            ],
            innerRadius: 52,
            outerRadius: 78,
            paddingAngle: 3,
            cornerRadius: 4,
            highlightScope: { fade: "global", highlight: "item" },
          }]}
          width={180}
          height={180}
          slotProps={{ legend: { sx: { display: "none" } } }}
          margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
        />
        {/* Center label */}
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center", pointerEvents: "none",
        }}>
          <Typography sx={{ fontSize: "1.45rem", fontWeight: 700, lineHeight: 1, color: "text.primary" }}>
            {pct}%
          </Typography>
          <Typography sx={{ fontSize: "0.62rem", color: "text.secondary", letterSpacing: "0.05em", textTransform: "uppercase", mt: 0.3 }}>
            online
          </Typography>
        </Box>
      </Box>

      {/* Legend with counts and percentages */}
      <Box sx={{ display: "flex", gap: { xs: 2, sm: 2.5 }, mt: 2, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "Online", color: BRAND_GREEN, count: activeCount },
          { label: "Offline", color: BRAND_ORANGE, count: inactiveCount },
        ].map((item) => {
          const itemPct = total ? ((item.count / total) * 100).toFixed(0) : "0";
          return (
            <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: item.color, flexShrink: 0 }} />
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                {item.label}{" "}
                <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {item.count}
                </Box>{" "}
                <Box component="span" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                  ({itemPct}%)
                </Box>
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default DeviceStatusChart;