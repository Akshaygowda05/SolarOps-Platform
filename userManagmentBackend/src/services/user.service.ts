import bcrypt from 'bcryptjs'; // Fixed consistent typo "bycrypt" -> "bcrypt"
import jwt from 'jsonwebtoken';
import { prisma } from '../config/primsaConfig';
import envconfig from '../config/envConfig';
import AppError from '../utils/AppError';
import { StatusCodes } from 'http-status-codes';
import apiClient from '../config/apiclient';
import { syncChirpstackData } from '../seed/applicationAndTenantId.repo';
import { Role } from "@prisma/client";
import loggers from '../config/logger';

interface userData {
  name: string;
  email: string;
  siteName: string;
  password: string;
  role: Role;
  applicationId: number | undefined;
}

export class UserService {

  // =========================================================================
  // FIX: Added missing getUserById method so frontend can load profile details
  // =========================================================================
  static async getUserById(id: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id },
        select: {
          id: true,
          name: true,
          email: true,
          siteName: true,
          role: true,
          isActive: true,
          applicationId: true,
        }
      });

      if (!user) {
        throw new AppError('User account not found', StatusCodes.NOT_FOUND);
      }

      return user;
    } catch (error) {
      loggers.error(`Error retrieving user payload for ID ${id}:`, error);
      throw error;
    }
  }

  static async CreateUser(data: userData) {
    try {
      if (!data.email || !data.password) {
        throw new AppError('Missing required fields', StatusCodes.BAD_REQUEST);
      }

      const email = data.email.trim().toLowerCase();
      const applicationIdInput = data.applicationId ? String(data.applicationId).trim() : null;

      loggers.info(`Creating user processing: ${email}, Role: ${data.role}`);

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      let appId: string | null = null;

      if (data.role === Role.USER) {
        if (!applicationIdInput) {
          throw new AppError('Application ID is required for standard USER role models.', StatusCodes.BAD_REQUEST);
        }

        const dbApp = await prisma.chirpstackApplication.findUnique({
          where: { chirpstackId: applicationIdInput },
          select: { chirpstackId: true },
        });

        if (dbApp) {
          appId = dbApp.chirpstackId;
        } else {
          const result = await apiClient.get(`/api/applications/${applicationIdInput}`);
          
          if (!result?.data?.application) {
            throw new AppError('Invalid application ID referenced from Chirpstack platform provider.', StatusCodes.BAD_REQUEST);
          }

          await syncChirpstackData();
          appId = String(result.data.application.id).trim();
        }
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      if (existingUser) {
        if (existingUser.isActive) {
          throw new AppError('User account already exists and is active.', StatusCodes.BAD_REQUEST);
        }

        const updatedUser = await prisma.user.update({
          where: { email },
          data: {
            name: data.name?.trim(),
            password: hashedPassword,
            role: data.role,
            isActive: true,
            applicationId: appId,
            siteName: data.siteName?.trim(),
          },
        });

        return {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          applicationId: updatedUser.applicationId,
        };
      }

      const newUser = await prisma.user.create({
        data: {
          name: data.name?.trim(),
          email,
          siteName: data.siteName?.trim(),
          password: hashedPassword,
          role: data.role,
          applicationId: appId,
        },
      });

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        applicationId: newUser.applicationId,
      };

    } catch (error) {
      loggers.error('Error within CreateUser database transaction:', error);
      throw error;
    }
  }

  static async deletUser(id: number): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id }
      });

      if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
      }
      
      await prisma.user.update({
        where: { id: id },
        data: { isActive: false }
      });

    } catch (error) {
      loggers.error('Error soft-deleting user:', error);
      throw error;
    }
  }

  static async userLogin(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
        select: {
          password: true,
          id: true,
          role: true,
          name: true,
          siteName: true,
          applicationId: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        throw new AppError('Invalid email credentials, please try again.', StatusCodes.UNAUTHORIZED);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new AppError('Invalid password validation match.', StatusCodes.UNAUTHORIZED);
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          applicationId: user.applicationId,
        }, 
        envconfig.getTokenSecret(), 
        { expiresIn: '1day' }
      );

      return {
        token: token,
        name: user.name,
        role: user.role,
        siteName: user.siteName,
      };
    } catch (error) {
      loggers.error('Error during security authentication workflow context:', error);
      throw error;
    }
  }

  static async updateUser(userId: number, data: {
  name?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
}) {
  try {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name?.trim();
    }

    // CRITICAL FIX: Block null, undefined, or empty emails
    if (data.email !== undefined) {
      const cleanEmail = data.email?.trim().toLowerCase();
      
      if (!cleanEmail || cleanEmail === "") {
        throw new AppError('Email address cannot be empty or null.', StatusCodes.BAD_REQUEST);
      }

      // Check if another user is already using this email address
      const emailConflict = await prisma.user.findUnique({
        where: { email: cleanEmail }
      });

      if (emailConflict && emailConflict.id !== userId) {
        throw new AppError('This email address is already in use by another account.', StatusCodes.BAD_REQUEST);
      }

      updateData.email = cleanEmail;
    }

    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    // Prevent Prisma from crashing if data object turns out empty
    if (Object.keys(updateData).length === 0) {
      throw new AppError('No valid update data provided.', StatusCodes.BAD_REQUEST);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: true,
      },
    });

    return updatedUser;
  } catch (error) {
    loggers.error("Error updating targeted database entity properties:", error);
    throw error;
  }
}

  static async updateuserPassword(userid: number, newPassword: string): Promise<void> {
    try {
      const oldPassword = await prisma.user.findUnique({
        where: { id: userid },
        select: { password: true }
      });

      if (oldPassword) {
        const isSamePassword = await bcrypt.compare(newPassword, oldPassword.password);

        if (isSamePassword) {
          throw new AppError('New password cannot be the same as the old password credentials.', StatusCodes.BAD_REQUEST);
        }
      }

      const hashpassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userid },
        data: { password: hashpassword }
      });

    } catch (error) {
      loggers.error('Error updating user configuration password entry:', error);
      throw error;
    }
  }

  static async getAllUsers(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            application: {
              select: {
                chirpstackId: true,
                name: true,
              },
            },
          },
        }),
        prisma.user.count(),
      ]);

      return {
        data: users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          role: user.role,
          application: user.application,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

    } catch (error) {
      loggers.error('Error fetching global application dataset layout logs:', error);
      throw error;
    }
  }

  static async deleteUserProfile(userId: number) {
    try {
      await prisma.user.delete({
        where: { id: userId }
      });
    } catch (error) {
      loggers.error('Error deleting user profile:', error);
      throw error;
    }
  }
}

export const userService = UserService;