import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ModulesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredModules = this.reflector.get<string[]>('modules', context.getHandler()) || 
                            this.reflector.get<string[]>('modules', context.getClass());
    if (!requiredModules || requiredModules.length === 0) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.roles?.length) {
      throw new ForbiddenException('No roles assigned');
    }

    // Verificamos que al menos un rol tenga acceso (ya sea por ser admin o por tener el módulo asignado)
    const hasAccess = user.roles.some(role => {
      // Si el rol es 'admin', tiene acceso total
      if (role.name === 'admin') return true;

      // Si no es admin, verificamos si tiene el módulo habilitado
      return role.modules?.some(m => requiredModules.includes(m.name));
    });

    if (!hasAccess) {
      throw new ForbiddenException(`Access denied. Missing required modules: ${requiredModules.join(', ')}`);
    }

    return true;
  }
}