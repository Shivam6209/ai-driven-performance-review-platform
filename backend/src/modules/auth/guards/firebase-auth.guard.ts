import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class FirebaseAuthGuard extends AuthGuard('firebase-jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser, _info: any): TUser {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      console.error('Firebase authentication error:', err || 'No user found');
      throw err || new UnauthorizedException('Firebase authentication required');
    }
    return user;
  }
} 