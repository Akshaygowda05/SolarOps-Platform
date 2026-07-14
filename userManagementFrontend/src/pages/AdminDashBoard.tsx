import GatewayMapDashboard from "../pages/Admin/components/map"
import BestApplicationsDashboard from "./Admin/components/Applicationchart"
import DailyEfficiencyMetrics from "./Admin/components/DailyEfficiencyMetrics"
import PanelsCleanedHistory from "./Admin/components/historyPannelsCleans"
import RobotStatusBreakdownCard from "./Admin/components/RobotStatusBreakdownCard"
//import ApplicationMetricsDashboard from "./Admin/components/Applicationchart"
export default function AdminDashboard() {
  return (
    <>
    <DailyEfficiencyMetrics />
    <RobotStatusBreakdownCard />
    <BestApplicationsDashboard />
    <GatewayMapDashboard />
    <PanelsCleanedHistory />

    </>
    
  )
}