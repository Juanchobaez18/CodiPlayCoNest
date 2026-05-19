import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { ModuleEntity } from '../modules/entities/module.entity';
import { Permission } from '../permissions/entities/permission.entity';

async function bootstrap() {
  console.log('Iniciando seeder...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const roleRepo = dataSource.getRepository(Role);
  const moduleRepo = dataSource.getRepository(ModuleEntity);
  const permRepo = dataSource.getRepository(Permission);

  // Sincronizar secuencias para evitar conflictos de llave primaria si se insertaron datos manualmente
  console.log('Sincronizando secuencias de la base de datos...');
  try {
    await dataSource.query(`SELECT setval(pg_get_serial_sequence('role', 'id'), coalesce(max(id), 0) + 1, false) FROM role`);
    await dataSource.query(`SELECT setval(pg_get_serial_sequence('modules', 'id'), coalesce(max(id), 0) + 1, false) FROM modules`);
    await dataSource.query(`SELECT setval(pg_get_serial_sequence('permissions', 'id'), coalesce(max(id), 0) + 1, false) FROM permissions`);
  } catch (e) {
    console.log('Nota: no se pudieron sincronizar algunas secuencias, continuando...', e.message);
  }

  // 1. Módulos del sistema requeridos
  const moduleNames = [
    'Panel de administración',
    'Usuarios',
    'Roles',
    'Permisos',
    'Módulos del sistema',
    'Cursos',
    'Docentes',
    'Estudiantes',
    'Lecciones',
    'Foros',
    'Mensajes',
    'Pagos',
  ];

  const modulesMap = new Map<string, ModuleEntity>();

  console.log('Validando e insertando módulos...');
  for (const name of moduleNames) {
    let mod = await moduleRepo.findOneBy({ name });
    if (!mod) {
      mod = moduleRepo.create({ name, description: `Módulo de ${name}` });
      await moduleRepo.save(mod);
    }
    modulesMap.set(name, mod);
  }

  // 2. Configuración de Roles y sus accesos
  const rolesConfig = [
    {
      name: 'admin',
      description: 'Administrador del sistema con acceso total',
      modules: moduleNames,
    },
    {
      name: 'docente',
      description: 'Docente con acceso a Cursos, Lecciones y Foros',
      modules: ['Cursos', 'Lecciones', 'Foros'],
    },
    {
      name: 'estudiante',
      description: 'Estudiante con acceso a Cursos, Foros y Pagos',
      modules: ['Cursos', 'Foros', 'Pagos'],
    },
  ];

  console.log('Validando e insertando roles y permisos...');
  for (const rc of rolesConfig) {
    let role = await roleRepo.findOne({ 
      where: { name: rc.name }, 
      relations: ['modules', 'permissions'] 
    });
    
    if (!role) {
      role = roleRepo.create({ name: rc.name, description: rc.description });
    }
    
    // Asignar módulos al rol
    role.modules = rc.modules.map(m => modulesMap.get(m)!);
    
    // Crear/Asignar permisos al rol (Ejemplo: Permiso de 'acceso' por cada módulo)
    const perms: Permission[] = [];
    for (const mName of rc.modules) {
      const mod = modulesMap.get(mName)!;
      // Generar nombre de permiso único (ej. access_cursos)
      const permName = `access_${mName.replace(/ /g, '_').toLowerCase()}`;
      
      let perm = await permRepo.findOneBy({ name: permName });
      if (!perm) {
        perm = permRepo.create({ 
          name: permName, 
          module: mod, 
          description: `Permiso de acceso a ${mName}` 
        });
        await permRepo.save(perm);
      }
      perms.push(perm);
    }
    
    role.permissions = perms;
    
    await roleRepo.save(role);
    console.log(`✅ Rol "${rc.name}" configurado con ${rc.modules.length} módulos y ${perms.length} permisos.`);
  }

  // 3. Crear Usuario Administrador
  console.log('Validando e insertando usuario administrador...');
  const userRepo = dataSource.getRepository(User);
  const adminEmail = 'admin@codiplay.co';
  let adminUser = await userRepo.findOne({ where: { email: adminEmail }, relations: ['roles'] });
  
  if (!adminUser) {
    const adminRole = await roleRepo.findOneBy({ name: 'admin' });
    if (adminRole) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = userRepo.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador',
        lastName: 'Sistema',
        docType: 'CC',
        docNumber: '0000000000',
        avatar: 'default.png',
        roles: [adminRole]
      });
      await userRepo.save(adminUser);
      console.log(`✅ Usuario administrador creado: ${adminEmail} (Contraseña: admin123)`);
    } else {
      console.error('❌ No se pudo crear el usuario admin porque el rol "admin" no fue encontrado.');
    }
  } else {
    console.log(`✅ Usuario administrador ya existe: ${adminEmail}`);
  }

  console.log('¡Seeding completado con éxito!');
  await app.close();
}

bootstrap().catch(err => {
  console.error('Error ejecutando el seeder:', err);
  process.exit(1);
});
