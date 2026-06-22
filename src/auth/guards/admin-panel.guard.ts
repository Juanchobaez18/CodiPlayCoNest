import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { userHasAdminPanelAccess } from '../config/admin-panel-access.config';

/**
 * Sustituye a @Roles(...) en el controlador admin: admite varios nombres de rol
 * y también roles que tengan módulos configurados en `admin-panel-access.config.ts`.
 */
@Injectable()
export class AdminPanelGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('No autenticado.');
    }
    if (userHasAdminPanelAccess(user)) {
      return true;
    }
    throw new ForbiddenException(
      'Tu rol no tiene permiso para el panel de administración. Pide que te asignen un rol autorizado o el módulo correspondiente.',
    );
  }
}
