import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { getHomePannelsCleandata } from '../services/User.service';

export default function CleaningHistoryChart() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const BRAND_GREEN = '#169647';
  const BRAND_ORANGE = '#E07B2A';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getHomePannelsCleandata();
        const rawData = response.data.data.last5day;
        const todayData = response.data.data.today;
        const combined = [...rawData, todayData];
        setChartData(
          combined.map((item: any, i: number) => ({
            ...item,
            isToday: i === combined.length - 1,
            label: i === combined.length - 1
              ? 'Today'
              : new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const W = 280;
  const H = 100;
  const PAD = { l: 28, r: 8, t: 14, b: 24 };
  const chartH = H - PAD.t - PAD.b;

  const maxVal = Math.max(...chartData.map((d) => d.totalCleaned ?? 0), 1);
  const barW = chartData.length > 0 ? ((W - PAD.l - PAD.r) / chartData.length) * 0.55 : 20;
  const slotW = chartData.length > 0 ? (W - PAD.l - PAD.r) / chartData.length : 40;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    label: Math.round(maxVal * pct),
    y: PAD.t + chartH - pct * chartH,
  }));

  const total = chartData.reduce((s, d) => s + (d.totalCleaned ?? 0), 0);
  const todayVal = chartData[chartData.length - 1]?.totalCleaned ?? null;
  const prevVal = chartData[chartData.length - 2]?.totalCleaned ?? null;
  const diff = todayVal !== null && prevVal !== null ? todayVal - prevVal : null;

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
        <CircularProgress size={28} sx={{ color: BRAND_GREEN }} />
      </Box>
    );

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.3 }}>
            Cleaning History
          </Typography>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 500, lineHeight: 1, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
            {total.toLocaleString()}
          </Typography>
          {diff !== null && (
            <Typography sx={{ fontSize: '0.7rem', color: diff >= 0 ? BRAND_GREEN : BRAND_ORANGE, mt: 0.3 }}>
              {diff >= 0 ? '↑' : '↓'} {Math.abs(diff)} panels today
            </Typography>
          )}
        </Box>
        <Box sx={{ fontSize: '0.65rem', background: BRAND_ORANGE, color: '#fff', px: '8px', py: '2px', borderRadius: '20px', fontWeight: 500 }}>
          6 days
        </Box>
      </Box>

     <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: '100%', display: 'block' }}>
        {gridLines.map(({ label, y }) => (
          <g key={label}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke={theme.palette.divider} strokeWidth="0.5" />
            <text x={PAD.l - 4} y={y + 3} fontSize="7" fill={theme.palette.text.secondary} textAnchor="end">{label}</text>
          </g>
        ))}
        {chartData.map((d, i) => {
          const barH = ((d.totalCleaned ?? 0) / maxVal) * chartH;
          const cx = PAD.l + i * slotW + slotW / 2;
          const x = cx - barW / 2;
          const y = PAD.t + chartH - barH;
          const fill = d.isToday ? BRAND_ORANGE : BRAND_GREEN;
          const opacity = d.isToday ? 1 : 0.55 + (i / chartData.length) * 0.35;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx="3" fill={fill} opacity={opacity} />
              <text x={cx} y={y - 3} fontSize="7" fill={d.isToday ? BRAND_ORANGE : theme.palette.text.secondary as string} textAnchor="middle" fontWeight={d.isToday ? 600 : 400}>
                {d.totalCleaned}
              </text>
              <text x={cx} y={H + 8} fontSize="8" fill={d.isToday ? BRAND_ORANGE : theme.palette.text.secondary as string} textAnchor="middle" fontWeight={d.isToday ? 600 : 400}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', mt: 1 }}>
        {[{ color: BRAND_GREEN, label: 'History' }, { color: BRAND_ORANGE, label: 'Today' }].map(({ color, label }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Box sx={{ width: 8, height: 8, background: color, borderRadius: '2px' }} />
            <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}