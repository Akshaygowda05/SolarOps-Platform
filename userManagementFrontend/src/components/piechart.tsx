import { PieChart } from "@mui/x-charts/PieChart";

function DeviceStatusChart({
  activeCount,
  inactiveCount,
}: {
  activeCount: number;
  inactiveCount: number;
}) {
  const data = [
    { id: 0, value: activeCount, label: "Active", color: "#47ba4b" },
  { id: 1, value: inactiveCount, label: "Inactive", color: "#e9594f" },
  ];

  return (
    <PieChart
      series={[
        {
          data,
          highlightScope: { fade: "global", highlight: "item" },
          faded: { innerRadius: 30, additionalRadius: -30 },
        },
      ]}
      height={250}
    />
  );
}

export default DeviceStatusChart; 