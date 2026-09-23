import { Role } from "../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: Role;
      tenantId?: string; 
      applicationId?: string;   

    }
  }
}

