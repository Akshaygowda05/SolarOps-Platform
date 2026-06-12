import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { getAvgBatteryDischarge } from '../services/User.service';

export default function ActiveInactiveStatusChart() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ dayLabel: string; avgDischarge: number }[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getAvgBatteryDischarge();
        const raw = res.data?.data?.last5days || [];
        const todayData = res.data?.data?.todayData;
        const combined = todayData ? [...raw, todayData] : raw;
        setData(
          combined.map((d: any) => ({
            dayLabel: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
            avgDischarge: d.avgDischarge ? parseFloat(d.avgDischarge.toFixed(1)) : 0,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const BRAND_GREEN = '#169647';
  const BRAND_ORANGE = '#E07B2A';
  const W = 280;
  const H = 100;
  const PAD = { l: 28, r: 12, t: 10, b: 24 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const points = data.map((d, i) => ({
    x: PAD.l + (i / Math.max(data.length - 1, 1)) * chartW,
    y: PAD.t + (1 - d.avgDischarge / 100) * chartH,
    ...d,
    isToday: i === data.length - 1,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `M${points[0].x},${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L${p.x},${p.y}`)
          .join(' ') +
        ` L${points[points.length - 1].x},${PAD.t + chartH} L${points[0].x},${PAD.t + chartH} Z`
      : '';

  const gridYs = [0, 25, 50, 75, 100].map((v) => ({
    v,
    y: PAD.t + (1 - v / 100) * chartH,
  }));

  const todayVal = data[data.length - 1]?.avgDischarge ?? null;
  const prevVal = data[data.length - 2]?.avgDischarge ?? null;
  const diff = todayVal !== null && prevVal !== null ? (todayVal - prevVal).toFixed(1) : null;

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
            Battery Discharge
          </Typography>
          {todayVal !== null && (
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 500, lineHeight: 1, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
              {todayVal}%
            </Typography>
          )}
          {diff !== null && (
            <Typography sx={{ fontSize: '0.7rem', color: parseFloat(diff) >= 0 ? BRAND_ORANGE : BRAND_GREEN, mt: 0.3 }}>
              {parseFloat(diff) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(diff))}% vs yesterday
            </Typography>
          )}
        </Box>
        <Box sx={{ fontSize: '0.65rem', background: BRAND_GREEN, color: '#fff', px: '8px', py: '2px', borderRadius: '20px', fontWeight: 500 }}>
          Live
        </Box>
      </Box>

      <svg viewBox={`0 0 ${W} ${H + 20}`} style={{ width: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="batt-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity="0.18" />
            <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridYs.map(({ v, y }) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke={theme.palette.divider} strokeWidth="0.5" />
            <text x={PAD.l - 4} y={y + 3} fontSize="7" fill={theme.palette.text.secondary} textAnchor="end">{v}</text>
          </g>
        ))}
        {points.length > 1 && <path d={areaPath} fill="url(#batt-area)" />}
        {points.length > 1 && (
          <polyline points={polyline} fill="none" stroke={BRAND_GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {points.map((p, i) =>
          p.isToday ? (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="8" fill="none" stroke={BRAND_ORANGE} strokeWidth="1.5">
                <animate attributeName="r" values="5;11;5" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="1.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={p.x} cy={p.y} r="4" fill={BRAND_GREEN} stroke="#fff" strokeWidth="1.5" />
            </g>
          ) : (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={BRAND_GREEN} />
          )
        )}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={H + 8} fontSize="8" fill={p.isToday ? BRAND_ORANGE : theme.palette.text.secondary as string} textAnchor="middle" fontWeight={p.isToday ? 600 : 400}>
            {p.isToday ? 'Today' : p.dayLabel}
          </text>
        ))}
      </svg>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', mt: 1 }}>
        <Box sx={{ width: 10, height: 2, background: BRAND_GREEN, borderRadius: 1 }} />
        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Avg discharge (%)</Typography>
      </Box>
    </Box>
  );
}