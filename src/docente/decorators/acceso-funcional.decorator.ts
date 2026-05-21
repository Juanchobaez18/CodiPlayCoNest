import { SetMetadata } from '@nestjs/common';

/**
 * Decorador para marcar rutas/métodos que requieren acceso funcional al panel docente
 * 
 * El modelo de acceso funcional permite que cualquier usuario con perfil de docente
 * pueda acceder a cualquier funcionalidad, sin restricciones de rol rígidas.
 * 
 * @example
 * @RequiereAccesoDocente()
 * @Post('tareas')
 * crearTarea() { ... }
 */
export const RequiereAccesoDocente = () =>
  SetMetadata('requireAccesoDocente', true);

/**
 * Decorador para marcar funcionalidades que requieren autenticación
 */
export const RequiereAutenticacion = () =>
  SetMetadata('requireAutenticacion', true);

/**
 * Decorador para marcar operaciones que deben ser registradas
 */
export const RegistrarActividad = (accion: string, descripcion?: string) =>
  SetMetadata('registrarActividad', { accion, descripcion });

/**
 * Decorador para marcar endpoints que pueden ser accedidos por docentes
 */
export const AccesoFuncional = (...funcionalidades: string[]) =>
  SetMetadata('accesoFuncional', funcionalidades);
