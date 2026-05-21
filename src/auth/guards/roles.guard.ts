// src/auth/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) ||
                          this.reflector.get<string[]>('roles', context.getClass());

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.roles?.length) {
      throw new ForbiddenException('No roles assigned');
    }

    const hasRole = user.roles.some(role =>
      requiredRoles.includes(role.name)
    );

    if (!hasRole) {
      throw new ForbiddenException(`Required roles: ${requiredRoles}`);
    }

    return true;
  }
}