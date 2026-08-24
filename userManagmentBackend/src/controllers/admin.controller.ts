import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import DashboardService from "../adminservices/RobotData.service";
import loggers from "../config/logger";

export class DashboardController {
  // =========================================================
  // Dashboard (All Active & Pending Applications)
  // =========================================================

  static async getDashboardDeviceCounts(req: Request, res: Response) {
    try {
      const data = await DashboardService.getDashboardDeviceCounts();

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching dashboard device counts:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch dashboard device counts.",
      });
    }
  }

  static async getDashboardDailyPanelsCleaned(req: Request, res: Response) {
    try {
      const data = await DashboardService.getDashboardDailyPanelsCleaned();

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching dashboard daily panels cleaned:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch dashboard daily panels cleaned.",
      });
    }
  }

  static async getDashboardTodayPanelsCleaned(req: Request, res: Response) {
    try {
      const data = await DashboardService.getDashboardTodayPanelsCleaned();

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching dashboard today panels cleaned:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch dashboard today panels cleaned.",
      });
    }
  }

  static async getDashboardMonthlyPanelsCleaned(req: Request, res: Response) {
    try {
      const data = await DashboardService.getDashboardMonthlyPanelsCleaned();

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching dashboard monthly panels cleaned:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch dashboard monthly panels cleaned.",
      });
    }
  }

  static async getDashboardYearlyPanelsCleaned(req: Request, res: Response) {
    try {
      const data = await DashboardService.getDashboardYearlyPanelsCleaned();

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching dashboard yearly panels cleaned:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch dashboard yearly panels cleaned.",
      });
    }
  }

  // =========================================================
  // Application Specific
  // =========================================================

  static async getApplicationDeviceCounts(req: Request, res: Response) {
    const { applicationId } = req.params as { applicationId: string };

    if (!applicationId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    try {
      const data = await DashboardService.getApplicationDeviceCounts(applicationId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching application device counts:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch application device counts.",
      });
    }
  }

  static async getApplicationDailyPanelsCleaned(req: Request, res: Response) {
    const { applicationId } = req.params as { applicationId: string };

    if (!applicationId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    try {
      const data = await DashboardService.getApplicationDailyPanelsCleaned(applicationId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching application daily panels cleaned:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch application daily panels cleaned.",
      });
    }
  }

  static async getApplicationTodayPanelsCleaned(req: Request, res: Response) {
    const { applicationId } = req.params as { applicationId: string };

    if (!applicationId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    try {
      const data = await DashboardService.getApplicationTodayPanelsCleaned(applicationId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching application today panels cleaned:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch application today panels cleaned.",
      });
    }
  }

  static async getApplicationMonthlyPanelsCleaned(req: Request, res: Response) {
    const { applicationId } = req.params as { applicationId: string };

    if (!applicationId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    try {
      const data = await DashboardService.getApplicationMonthlyPanelsCleaned(applicationId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching application monthly panels cleaned:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch application monthly panels cleaned.",
      });
    }
  }

  static async getApplicationYearlyPanelsCleaned(req: Request, res: Response) {
    const { applicationId } = req.params as { applicationId: string };

    if (!applicationId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    try {
      const data = await DashboardService.getApplicationYearlyPanelsCleaned(applicationId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching application yearly panels cleaned:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch application yearly panels cleaned.",
      });
    }
  }

  // =========================================================
  // Gateway & Applications
  // =========================================================

  static async getGatewayStates(req: Request, res: Response) {
    try {
      const data = await DashboardService.getGatewayStates();

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching gateway states:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch gateway states.",
      });
    }
  }

  static async getActiveApplications(req: Request, res: Response) {
    try {
      const data = await DashboardService.getActiveApplications();

      return res.status(StatusCodes.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      loggers.error("Error fetching active applications:", error);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch active applications.",
      });
    }
  }
}