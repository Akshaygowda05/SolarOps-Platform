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
        const rawData = response.data.data.last5day || [];
        const todayData = response.data.data.today || { totalCleaned: 0, date: new Date() };
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

  // --- Optimized SVG Dimensions for Beautiful Scaling ---
  const W = 500;
  const H = 220;
  const PAD = { l: 45, r: 15, t: 25, b: 35 };
  const chartH = H - PAD.t - PAD.b;

  const maxVal = Math.max(...chartData.map((d) => d.totalCleaned ?? 0), 1);
  const barW = chartData.length > 0 ? ((W - PAD.l - PAD.r) / chartData.length) * 0.45 : 30;
  const slotW = chartData.length > 0 ? (W - PAD.l - PAD.r) / chartData.length : 60;

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexGrow: 1 }}>
        <CircularProgress size={32} sx={{ color: BRAND_GREEN }} />
      </Box>
    );

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.3 }}>
            Cleaning History
          </Typography>
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
            {total.toLocaleString()}
          </Typography>
          {diff !== null && (
            <Typography sx={{ fontSize: '0.75rem', color: diff >= 0 ? BRAND_GREEN : BRAND_ORANGE, mt: 0.5, fontWeight: 500 }}>
              {diff >= 0 ? '↑' : '↓'} {Math.abs(diff).toLocaleString()} panels today
            </Typography>
          )}
        </Box>
        <Box sx={{ fontSize: '0.7rem', background: BRAND_ORANGE, color: '#fff', px: '10px', py: '3px', borderRadius: '20px', fontWeight: 600 }}>
          6 days
        </Box>
      </Box>

      {/* Main SVG Render Engine */}
      <Box sx={{ width: '100%', flexGrow: 1, my: 1 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          {/* Grid lines */}
          {gridLines.map(({ label, y }) => (
            <g key={label}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke={theme.palette.divider} strokeWidth="0.75" strokeDasharray="3 3" />
              <text x={PAD.l - 8} y={y + 3} fontSize="11" fill={theme.palette.text.secondary} textAnchor="end" fontFamily={theme.typography.fontFamily}>
                {label.toLocaleString()}
              </text>
            </g>
          ))}
          
          {/* Chart Bars */}
          {chartData.map((d, i) => {
            const value = d.totalCleaned ?? 0;
            const barH = (value / maxVal) * chartH;
            const cx = PAD.l + i * slotW + slotW / 2;
            const x = cx - barW / 2;
            const y = PAD.t + chartH - barH;
            const fill = d.isToday ? BRAND_ORANGE : BRAND_GREEN;
            const opacity = d.isToday ? 1 : 0.65 + (i / chartData.length) * 0.35;
            
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={Math.max(barH, 2)} rx="4" fill={fill} opacity={opacity} />
                
                {/* Value labels (Only display if value > 0 to prevent baseline clustering) */}
                {value > 0 && (
                  <text x={cx} y={y - 6} fontSize="11" fill={d.isToday ? BRAND_ORANGE : theme.palette.text.primary} textAnchor="middle" fontWeight={600} fontFamily={theme.typography.fontFamily}>
                    {value.toLocaleString()}
                  </text>
                )}
                
                {/* Bottom X-axis Date Labels */}
                <text x={cx} y={H - 12} fontSize="11" fill={d.isToday ? BRAND_ORANGE : theme.palette.text.secondary} textAnchor="middle" fontWeight={d.isToday ? 600 : 400} fontFamily={theme.typography.fontFamily}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>

      {/* Legend Block */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        {[{ color: BRAND_GREEN, label: 'History' }, { color: BRAND_ORANGE, label: 'Today' }].map(({ color, label }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Box sx={{ width: 10, height: 10, background: color, borderRadius: '3px' }} />
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}