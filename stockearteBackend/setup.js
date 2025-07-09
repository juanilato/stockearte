#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando StockearteBackend...\n');

// Verificar si existe el archivo .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Archivo .env ya existe');
} else {
  console.log('❌ Archivo .env no encontrado');
  console.log(
    '📝 Por favor, crea el archivo .env con el siguiente contenido:\n',
  );

  const envContent = `# Database Configuration (Supabase)
DATABASE_URL="postgresql://postgres:[TU-PASSWORD]@db.cfpuhteaijbvetbcjhea.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[TU-PASSWORD]@db.cfpuhteaijbvetbcjhea.supabase.co:5432/postgres"

# Application Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu-super-secret-jwt-key-cambia-esto-en-produccion
JWT_EXPIRES_IN=24h

# API Configuration
API_PREFIX=api`;

  console.log(envContent);
  console.log(
    '\n⚠️  IMPORTANTE: Reemplaza [TU-PASSWORD] con tu contraseña real de Supabase\n',
  );
  process.exit(1);
}

// Verificar si node_modules existe
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Instalando dependencias...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencias instaladas correctamente');
  } catch (error) {
    console.error('❌ Error instalando dependencias:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencias ya instaladas');
}

// Generar cliente de Prisma
console.log('🔧 Generando cliente de Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente de Prisma generado correctamente');
} catch (error) {
  console.error('❌ Error generando cliente de Prisma:', error.message);
  process.exit(1);
}

// Verificar conexión a la base de datos
console.log('🔍 Verificando conexión a la base de datos...');
try {
  execSync('npx prisma db pull', { stdio: 'inherit' });
  console.log('✅ Conexión a la base de datos exitosa');
} catch (error) {
  console.error('❌ Error conectando a la base de datos:', error.message);
  console.log('💡 Verifica que:');
  console.log('   1. Las credenciales en .env sean correctas');
  console.log('   2. La base de datos esté activa en Supabase');
  console.log('   3. El password en DATABASE_URL sea el correcto');
  process.exit(1);
}

console.log('\n🎉 ¡Configuración completada exitosamente!');
console.log('\n📋 Próximos pasos:');
console.log('   1. Ejecuta: npm run start:dev');
console.log('   2. El servidor estará en: http://localhost:3000/api');
console.log('   3. Revisa setup.md para más información');
console.log('\n🚀 ¡Listo para desarrollar!');
