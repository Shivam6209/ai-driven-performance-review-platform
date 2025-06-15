import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<
      [string, string]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // If no permissions required, allow access
    if (!requiredPermissions) {
      return true;
    }

    const [resource, action] = requiredPermissions;
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user, deny access
    if (!user) {
      return false;
    }

    // Get context ID if available (e.g., from params or query)
    let contextId: string | undefined;
    const params = request.params;
    
    if (params.id) {
      contextId = params.id;
    } else if (params.employeeId) {
      contextId = params.employeeId;
    } else if (params.departmentId) {
      contextId = params.departmentId;
    } else if (params.teamId) {
      contextId = params.teamId;
    }

    // Check if user has the required permission
    return this.rbacService.hasPermission(user.id, resource, action, contextId);
  }
} 