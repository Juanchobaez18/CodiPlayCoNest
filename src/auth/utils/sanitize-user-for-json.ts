/**
 * Evita referencias circulares User ↔ Docente / User ↔ Estudiante
 * al hacer JSON.stringify en login, check-status o respuestas HTTP.
 * Lee roles y módulos explícitamente por nombre para no depender de enumerabilidad.
 */
export function sanitizeUserForJsonResponse(
  user: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null | undefined {
  if (user == null) return user;

  const raw = user as {
    password?: unknown;
    docente?: { id?: number } | null;
    estudiante?: { id?: number } | null;
    roles?: unknown;
    [key: string]: unknown;
  };

  const { password, docente, estudiante, roles: _roles, ...rest } = raw;

  const roles = Array.isArray(raw.roles)
    ? raw.roles.map((r: unknown) => {
        const role = r as Record<string, unknown>;
        const rawMods = role['modules'];
        return {
          id: role['id'],
          name: role['name'],
          description: role['description'],
          modules: Array.isArray(rawMods)
            ? rawMods.map((m: unknown) => {
                const mod = m as Record<string, unknown>;
                return { id: mod['id'], name: mod['name'] };
              })
            : [],
        };
      })
    : [];

  return {
    ...rest,
    roles,
    docente:
      docente != null && typeof docente.id === 'number'
        ? { id: docente.id }
        : null,
    estudiante:
      estudiante != null && typeof estudiante.id === 'number'
        ? { id: estudiante.id }
        : null,
  };
}
