/**
 * Acceso al panel docente por capacidad (perfil docente, módulos RBAC o rol),
 * alineado con el frontend Angular.
 */
export interface DocentePanelUserLike {
  isActive?: boolean;
  docente?: { id?: number } | null;
  roles?: Array<{
    name?: string;
    modules?: Array<{ name?: string }>;
  }>;
}

const PANEL_MODULE_NAMES = new Set([
  'paneldocente',
  'panel_docente',
  'docente panel',
  'panel de docente',
  'gestión docente',
  'gestion docente',
  'docentes',
  'cursos',
  'foros',
  'mensajes',
  'lecciones',
]);

const PANEL_ROLE_NAMES = new Set([
  'docente',
  'profesor',
  'teacher',
  'instructor',
  'admin',
]);

function normalize(value: string | undefined | null): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function userHasDocenteProfile(
  user: DocentePanelUserLike | null | undefined,
): boolean {
  const id = user?.docente?.id;
  return typeof id === 'number' && id > 0;
}

export function userHasDocentePanelModuleAccess(
  user: DocentePanelUserLike | null | undefined,
): boolean {
  if (!user?.roles?.length) return false;
  for (const role of user.roles) {
    for (const mod of role.modules ?? []) {
      const name = normalize(mod.name);
      if (name && PANEL_MODULE_NAMES.has(name)) {
        return true;
      }
    }
  }
  return false;
}

export function userHasDocenteRoleNameFallback(
  user: DocentePanelUserLike | null | undefined,
): boolean {
  if (!user?.roles?.length) return false;
  for (const role of user.roles) {
    const name = normalize(role.name);
    if (name && PANEL_ROLE_NAMES.has(name)) {
      return true;
    }
  }
  return false;
}

export function userHasDocentePanelAccess(
  user: DocentePanelUserLike | null | undefined,
): boolean {
  if (!user) return false;
  if (user.isActive === false) return false;
  if (userHasDocenteProfile(user)) return true;
  if (userHasDocentePanelModuleAccess(user)) return true;
  return userHasDocenteRoleNameFallback(user);
}
