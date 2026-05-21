import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';
import { AccesoFuncionalDocenteGuard } from './acceso-funcional-docente.guard';

/**
 * Permite acceso si el usuario tiene acceso funcional al panel docente
 * o si cumple el guard de módulos RBAC (admin / roles con módulo foros).
 */
@Injectable()
export class PanelOModulosGuard implements CanActivate {
  constructor(
    private readonly panelGuard: AccesoFuncionalDocenteGuard,
    private readonly modulesGuard: ModulesGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException('No autenticado');
    }

    try {
      if (await this.panelGuard.canActivate(context)) {
        return true;
      }
    } catch {
      // intentar módulos RBAC
    }

    return this.modulesGuard.canActivate(context);
  }
}
