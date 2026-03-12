/* eslint-disable prettier/prettier */
// import * as prompts from 'prompts';
import prompts from 'prompts';
import { execSync } from 'child_process';
import { join } from 'path';

(async () => {
  // 1️⃣ Preguntar por el ambiente
  const { environment } = await prompts({
    type: 'select',
    name: 'environment',
    message: '🌍 Selecciona el ambiente:',
    choices: [
      { title: 'Development', value: 'dev' },
      // { title: 'Staging', value: 'stg' },
      // { title: 'Production', value: 'prod' },
    ],
  });

  if (!environment) {
    console.log('Operación cancelada.');
    process.exit(0);
  }

  // Asignar NODE_ENV para que data-source lea el .env correcto
  process.env.NODE_ENV = environment;

  // 2️⃣ Preguntar por el nombre de la migración
  const { migrationName } = await prompts({
    type: 'text',
    name: 'migrationName',
    message: '📝 Ingresa el nombre de la migración (ej: AddNewColumn):',
    validate: (name: string) =>
      name.trim() === '' ? 'El nombre no puede estar vacío' : true,
  });

  if (!migrationName) {
    console.log('Operación cancelada.');
    process.exit(0);
  }

  console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Entities pattern:', join(__dirname, '..', '**', '*.entity.{ts,js}'));

  // 3️⃣ Ejecutar el comando TypeORM
  try {
    console.log(`🔄 Generando migración "${migrationName}" en ambiente "${environment}"...`);
    execSync(
      `npm run typeorm -- migration:generate ./src/database/migrations/${migrationName} -d ./src/database/data-source.ts`,
      { stdio: 'inherit' } // Muestra la salida en consola
    );
    console.log('✅ ¡Migración generada con éxito!');
  } catch (error: any) {
    console.error('❌ Error al generar la migración:', error.message);
    process.exit(1);
  }
})();