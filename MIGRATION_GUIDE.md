# 🚀 Guía de Migración: De Electron a Alternativas Nativas

## 📋 Resumen de la Situación Actual

Tu proyecto PathOut actualmente usa:
- ✅ **React Native + Expo** (funcionando perfectamente)
- ✅ **Web build** (funcionando perfectamente)
- ❌ **Electron** (problemas de empaquetado y recursos)

## 🎯 Objetivo

Migrar de Electron a una solución nativa que:
- ✅ Ejecute React Native en desktop
- ✅ Tenga mejor rendimiento
- ✅ Sea más ligera
- ✅ Sea más fácil de mantener

## 🛠️ Opciones Disponibles

### 1. **Tauri** (Recomendado) 🌟
- **Ventajas**: Multiplataforma, muy ligero, moderno
- **Desventajas**: Requiere Rust
- **Tamaño**: ~10MB vs ~100MB de Electron

### 2. **React Native Windows** (Solo Windows)
- **Ventajas**: Nativo, excelente rendimiento
- **Desventajas**: Solo Windows, setup complejo
- **Tamaño**: ~50MB

### 3. **React Native macOS** (Solo macOS)
- **Ventajas**: Nativo, excelente rendimiento
- **Desventajas**: Solo macOS, setup complejo
- **Tamaño**: ~50MB

## 🚀 Plan de Migración Recomendado: Tauri

### Paso 1: Instalar Rust (Requerido para Tauri)

**Windows:**
```bash
# Opción 1: Usando winget
winget install Rust.Rust

# Opción 2: Descargar manualmente
# Ir a https://rustup.rs/ y descargar el instalador
```

**Verificar instalación:**
```bash
rustc --version
cargo --version
```

### Paso 2: Instalar Tauri CLI

```bash
npm install -g @tauri-apps/cli
```

### Paso 3: Inicializar Tauri en el proyecto

```bash
# Desde la raíz del proyecto
tauri init
```

**Respuestas recomendadas:**
- Project name: `pathout`
- Window title: `PathOut - Guía de Ciudad`
- Web assets location: `../dist`
- Dev server URL: `http://localhost:19006`
- Frontend dev command: `npm run export`
- Frontend build command: `npm run export`

### Paso 4: Configurar Tauri para usar Expo

Editar `src-tauri/tauri.conf.json`:
```json
{
  "build": {
    "beforeDevCommand": "npm run export",
    "beforeBuildCommand": "npm run export",
    "devPath": "../dist",
    "distDir": "../dist"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.pathout.cityguide",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "PathOut - Guía de Ciudad",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

### Paso 5: Copiar iconos

```bash
# Crear carpeta de iconos
mkdir src-tauri\icons

# Copiar iconos desde assets
copy assets\icon.png src-tauri\icons\32x32.png
copy assets\icon.png src-tauri\icons\128x128.png
copy assets\icon.png src-tauri\icons\128x128@2x.png
copy assets\icon.png src-tauri\icons\icon.icns
copy assets\icon.png src-tauri\icons\icon.ico
```

### Paso 6: Probar en desarrollo

```bash
# Generar build web
npm run export

# Ejecutar Tauri en desarrollo
npm run desktop:dev
```

### Paso 7: Build para producción

```bash
# Crear aplicación ejecutable
npm run desktop:build
```

## 🔧 Adaptaciones Necesarias

### 1. APIs de Archivos

**Antes (Electron):**
```typescript
import { ipcRenderer } from 'electron';
```

**Después (Tauri):**
```typescript
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
```

### 2. Almacenamiento

**Antes (Electron):**
```typescript
localStorage.setItem('key', 'value');
```

**Después (Tauri):**
```typescript
import { setItem, getItem } from '@tauri-apps/api/storage';

await setItem('key', 'value');
const value = await getItem('key');
```

### 3. Diálogos de Archivo

**Antes (Electron):**
```typescript
const { dialog } = require('electron');
```

**Después (Tauri):**
```typescript
import { open } from '@tauri-apps/api/dialog';

const selected = await open({
  multiple: false,
  filters: [{
    name: 'GPX Files',
    extensions: ['gpx']
  }]
});
```

## 📁 Estructura Final del Proyecto

```
PathOut/
├── src/                    # Código React Native (sin cambios)
├── assets/                 # Assets (sin cambios)
├── dist/                   # Build web de Expo
├── src-tauri/             # Código Rust de Tauri
│   ├── src/
│   │   └── main.rs        # Punto de entrada
│   ├── Cargo.toml         # Dependencias Rust
│   ├── tauri.conf.json    # Configuración
│   └── icons/             # Iconos de la app
├── package.json           # Scripts actualizados
├── app.json              # Configuración Expo (sin cambios)
└── README.md
```

## 🎯 Comandos de Uso

### Desarrollo:
```bash
npm run desktop:dev
```

### Build para producción:
```bash
npm run desktop:build
```

### Limpiar archivos temporales:
```bash
npm run desktop:clean
```

## 🚀 Beneficios de la Migración

1. **Tamaño**: De ~100MB a ~10MB
2. **Rendimiento**: Mejor rendimiento nativo
3. **Memoria**: Menor uso de RAM
4. **Seguridad**: Mejor modelo de seguridad
5. **Actualizaciones**: Sistema automático más eficiente
6. **Multiplataforma**: Una sola base de código

## 🐛 Solución de Problemas

### Error de Rust no encontrado:
```bash
# Reinstalar Rust
rustup update
```

### Error de dependencias de Windows:
```bash
# Instalar Visual Studio Build Tools
winget install Microsoft.VisualStudio.2022.BuildTools
```

### Error de WebView2:
```bash
# Se instala automáticamente con Tauri
# Si hay problemas, descargar manualmente desde Microsoft
```

## ✅ Checklist de Migración

- [ ] Instalar Rust
- [ ] Instalar Tauri CLI
- [ ] Inicializar Tauri
- [ ] Configurar tauri.conf.json
- [ ] Copiar iconos
- [ ] Probar en desarrollo
- [ ] Adaptar APIs específicas
- [ ] Build de producción
- [ ] Eliminar configuración de Electron

¿Estás listo para comenzar la migración? ¡Empecemos con Tauri! 