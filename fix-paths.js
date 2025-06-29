const fs = require('fs');
const path = require('path');

// Ruta al archivo index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');

// Leer el archivo
let content = fs.readFileSync(indexPath, 'utf8');

// Reemplazar rutas absolutas por relativas
content = content.replace(/href="\//g, 'href="');
content = content.replace(/src="\//g, 'src="');

// Escribir el archivo corregido
fs.writeFileSync(indexPath, content, 'utf8');

console.log('✅ Rutas corregidas en index.html para Electron'); 