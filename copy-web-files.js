const fs = require('fs');
const path = require('path');

// Rutas
const webDistPath = path.join(__dirname, 'dist');
const electronResourcesPath = path.join(__dirname, 'dist', 'win-unpacked', 'resources');

// Verificar que existe la carpeta de recursos de Electron
if (!fs.existsSync(electronResourcesPath)) {
  console.log('❌ No se encontró la carpeta de recursos de Electron');
  process.exit(1);
}

// Crear carpeta dist dentro de resources si no existe
const webFilesPath = path.join(electronResourcesPath, 'dist');
if (!fs.existsSync(webFilesPath)) {
  fs.mkdirSync(webFilesPath, { recursive: true });
}

// Función para copiar directorio recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copiar archivos de la app web
try {
  copyDir(webDistPath, webFilesPath);
  console.log('✅ Archivos de la app web copiados correctamente a resources/dist/');
} catch (error) {
  console.error('❌ Error al copiar archivos:', error.message);
  process.exit(1);
} 