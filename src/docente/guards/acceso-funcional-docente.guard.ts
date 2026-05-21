import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Docente } from '../entities/docente.entity';
import { userHasDocentePanelAccess } from '../utils/docente-panel-access.util';

@Injectable()
export class AccesoFuncionalDocenteGuard implements CanActivate {
  constructor(
    @InjectRepository(Docente)
    private readonly docenteRepository: Repository<Docente>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException(
        'Debe estar autenticado para acceder a esta funcionalidad',
      );
    }

    if (!userHasDocentePanelAccess(user)) {
      throw new ForbiddenException(
        'No tiene acceso al panel docente. Se requiere perfil docente o permisos de módulo equivalentes.',
      );
    }

    let docenteId: number | null =
      typeof user.docente?.id === 'number' ? user.docente.id : null;

    if (!docenteId && typeof user.id === 'number') {
      const docenteByUser = await this.docenteRepository.findOne({
        where: { user: { id: user.id } },
        relations: ['user'],
      });
      docenteId = docenteByUser?.id ?? null;
    }

    if (docenteId) {
      const docente = await this.docenteRepository.findOne({
        where: { id: docenteId },
        relations: ['user'],
      });

      if (!docente) {
        throw new ForbiddenException('Perfil de docente no encontrado');
      }

      request.docente = docente;
      request.docenteId = docente.id;
    }

    request.userId = user.id;
    return true;
  }
}
