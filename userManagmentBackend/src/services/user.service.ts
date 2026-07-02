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

  static async deletUser(id: number,adminUserID: number): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: id }
      });

      if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
      }

      if (user.id == adminUserID) {
        throw new AppError('You are the owner of this user account.', StatusCodes.FORBIDDEN);
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

static async updateUser(
  userId: number,
  data: {
    name?: string;
    email?: string;
    role?: Role;
    isActive?: boolean;
    applicationId?: string;
    siteName?: string;
  }
) {
  try {
    const updateData: any = {};

    // Name
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) throw new AppError("Name cannot be empty.", StatusCodes.BAD_REQUEST);
      updateData.name = name;
    }

    // Email
    if (data.email !== undefined) {
      const email = data.email.trim().toLowerCase();
      if (!email) throw new AppError("Email cannot be empty.", StatusCodes.BAD_REQUEST);

      const emailConflict = await prisma.user.findUnique({ where: { email } });

      if (emailConflict && emailConflict.id !== userId) {
        throw new AppError("Email already in use.", StatusCodes.BAD_REQUEST);
      }

      updateData.email = email;
    }

    // Role
    if (data.role !== undefined) {
      updateData.role = data.role;
    }

    // Active
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    // Site Name
    if (data.siteName !== undefined) {
      const siteName = data.siteName.trim();
      if (!siteName) throw new AppError("Site name cannot be empty.", StatusCodes.BAD_REQUEST);
      updateData.siteName = siteName;
    }

    // Application ID
    if (data.applicationId !== undefined) {
      const app = await prisma.chirpstackApplication.findUnique({
        where: { chirpstackId: data.applicationId },
      });

      if (!app) {
        await syncChirpstackData();
        throw new AppError("Invalid application ID.", StatusCodes.BAD_REQUEST);
      }

      updateData.applicationId = data.applicationId;
    }

    // Prevent empty update
    if (Object.keys(updateData).length === 0) {
      throw new AppError("No valid update data provided.", StatusCodes.BAD_REQUEST);
    }

    // Final validation based on intended role
    const finalRole = updateData.role ?? (await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }))?.role;

    if (
      finalRole === Role.USER &&
      (!updateData.applicationId || !updateData.siteName)
    ) {
      throw new AppError(
        "Application ID and Site Name are required for USER role.",
        StatusCodes.BAD_REQUEST
      );
    }

    if (finalRole === Role.ADMIN) {
  updateData.applicationId = null;
  updateData.siteName = null;
}

    return await prisma.user.update({
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

  } catch (error) {
    loggers.error("User update failed", { userId, error });
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

  static async deleteUserProfile(userId: number, adminUserID: number) {
    try {

      if (userId === adminUserID) {
        throw new AppError('You cannot delete your own user profile.', StatusCodes.FORBIDDEN);  
      }
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', StatusCodes.NOT_FOUND);
      }

      if(user.role === Role.ADMIN) {
        const adminCount = await prisma.user.count({
          where: { role: Role.ADMIN, isActive: true }
        })
        if (adminCount <= 1) {
          throw new AppError('At least one admin user must remain.', StatusCodes.FORBIDDEN);
        }
      }

      try{
        await prisma.user.delete({
          where: { id: userId }
        })
      }catch(error){
        loggers.error('Error deleting user profile:', error);
        throw new AppError('Failed to delete user profile. Please try again later.', StatusCodes.INTERNAL_SERVER_ERROR);
      }
    } catch (error) {
      loggers.error('Error deleting user profile:', error);
      throw error;
    }
  }
}

export const userService = UserService;