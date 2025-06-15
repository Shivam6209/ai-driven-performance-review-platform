import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  organizationId?: string;
  user?: {
    userId: string;
    email: string;
    employeeId?: string;
    organizationId?: string;
    role?: string;
    id: string;
  };
}

@Injectable()
export class TenantIsolationMiddleware implements NestMiddleware {
  use(req: TenantRequest, _res: Response, next: NextFunction) {
    // Extract organizationId from authenticated user
    if (req.user && req.user.organizationId) {
      req.organizationId = req.user.organizationId;
    }
    
    next();
  }
} 