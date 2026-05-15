/**
 * Evita referencias circulares User ↔ Docente / User ↔ Estudiante
 * al hacer JSON.stringify en login, check-status o respuestas HTTP.
 */
export function sanitizeUserForJsonResponse(
  user: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null | undefined {
  if (user == null) return user;

  const { password, docente, estudiante, ...rest } = user as {
    password?: unknown;
    docente?: { id?: number } | null;
    estudiante?: { id?: number } | null;
  };

  return {
    ...rest,
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
