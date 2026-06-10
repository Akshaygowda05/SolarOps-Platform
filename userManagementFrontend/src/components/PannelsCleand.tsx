import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { getHomePannelsCleandata } from '../services/User.service';

export default function CleaningHistoryChart() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getHomePannelsCleandata()
        const rawData = response.data.data.last5day;
        const todayData: any[] = response.data.data.today;
     const combinedData = [...rawData, todayData];
        console.log("this is somethng new to me to check it out ", combinedData);

        // Transform data: Format the date string for the chart labels
        const formattedData = combinedData.map((item: any) => ({
          ...item,
          formattedDate: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching panel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 350 }}>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 2, color: 'text.secondary' }}>
        Cleaning Performance (Last 5 Days)
      </Typography>
      
      <BarChart
        dataset={chartData}
        // Switch to vertical layout for better mobile readability
        xAxis={[{ 
          scaleType: 'band', 
          dataKey: 'formattedDate',
          tickLabelStyle: { fontSize: 10, fill: theme.palette.text.secondary } 
        }]}
        series={[
          { 
            dataKey: 'totalCleaned', 
            label: 'Panels Cleaned', 
            color: theme.palette.primary.main,
            valueFormatter: (value) => `${value} units` 
          }
        ]}
        height={300}
        margin={{ left: 40, right: 10, top: 20, bottom: 30 }}
        // Ensure the grid/axis lines use theme colors
        slotProps={{
          legend: {}
        }}
        sx={{
          '& .MuiChartsLegend-root': {
            fontSize: 12,
            color: theme.palette.text.primary
          }
        }}
      />
    </Box>
  );
}