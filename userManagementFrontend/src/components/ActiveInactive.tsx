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

  // --- Optimized Proportions for High-Density Scaling ---
  const W = 500;
  const H = 220;
  const PAD = { l: 45, r: 20, t: 25, b: 35 };
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexGrow: 1 }}>
        <CircularProgress size={32} sx={{ color: BRAND_GREEN }} />
      </Box>
    );

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', mb: 0.3 }}>
            Battery Discharge
          </Typography>
          {todayVal !== null && (
            <Typography sx={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
              {todayVal}
            </Typography>
          )}
          {diff !== null && (
            <Typography sx={{ fontSize: '0.75rem', color: parseFloat(diff) >= 0 ? BRAND_ORANGE : BRAND_GREEN, mt: 0.5, fontWeight: 500 }}>
              {parseFloat(diff) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(diff))} vs yesterday
            </Typography>
          )}
        </Box>
        <Box sx={{ fontSize: '0.7rem', background: BRAND_GREEN, color: '#fff', px: '10px', py: '3px', borderRadius: '20px', fontWeight: 600 }}>
          Live
        </Box>
      </Box>

      {/* Responsive Graph Container */}
      <Box sx={{ width: '100%', flexGrow: 1, my: 1 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="batt-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity="0.22" />
              <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Y-Axis Grid Engine */}
          {gridYs.map(({ v, y }) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke={theme.palette.divider} strokeWidth="0.75" strokeDasharray="3 3" />
              <text x={PAD.l - 8} y={y + 3} fontSize="11" fill={theme.palette.text.secondary} textAnchor="end" fontFamily={theme.typography.fontFamily}>
                {v}
              </text>
            </g>
          ))}
          
          {/* SVG Geometric Render Paths */}
          {points.length > 1 && <path d={areaPath} fill="url(#batt-area)" />}
          {points.length > 1 && (
            <polyline points={polyline} fill="none" stroke={BRAND_GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
          
          {/* Node Point Anchors */}
          {points.map((p, i) =>
            p.isToday ? (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="14" fill="none" stroke={BRAND_ORANGE} strokeWidth="1.5">
                  <animate attributeName="r" values="8;16;8" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0;0.7" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={p.x} cy={p.y} r="5" fill={BRAND_GREEN} stroke="#fff" strokeWidth="2" />
              </g>
            ) : (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill={BRAND_GREEN} />
            )
          )}
          
          {/* X-Axis Labels */}
          {points.map((p, i) => (
            <text key={i} x={p.x} y={H - 12} fontSize="11" fill={p.isToday ? BRAND_ORANGE : theme.palette.text.secondary} textAnchor="middle" fontWeight={p.isToday ? 600 : 400} fontFamily={theme.typography.fontFamily}>
              {p.isToday ? 'Today' : p.dayLabel}
            </text>
          ))}
        </svg>
      </Box>

      {/* Legend Block */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ width: 12, height: 3, background: BRAND_GREEN, borderRadius: '2px' }} />
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 500 }}>Avg discharge</Typography>
      </Box>
    </Box>
  );
}