import { Request, Response } from "express";
import DashboardService from "../adminservices/RobotData.service";

export class DashboardController {
  static async getDashboardCounts(req: Request, res: Response) {
    try {
      const data = await DashboardService.getDashboardCounts();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error fetching dashboard counts:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard counts",
      });
    }
  }


  static async getHistoryPanelsCleaned(req: Request, res: Response) {
    try {
      const data = await DashboardService.getHistoryPannelsCleand();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error fetching history panels cleaned:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch history panels cleaned",
      });
    }
  }


  static async getTodayPanelsCleaned(req: Request, res: Response) {
    try {
      const data = await DashboardService.getTodayPannelsCleaned();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error fetching today's panels cleaned:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch today's panels cleaned",
      });
    }
  }


  static async getGatewayData(req: Request, res: Response) {
    try {
      const data = await DashboardService.getGatewayData();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error fetching gateway data:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch gateway data",
      });
    }
  }


  static async getTrueApplication(req: Request, res: Response) {
    try {
      const data = await DashboardService.getTrueApplication();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
      });
    }
  }
}