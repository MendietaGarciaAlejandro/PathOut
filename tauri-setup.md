# 🚀 Configuración de Tauri para PathOut

Tauri es una alternativa moderna y ligera a Electron que permite crear aplicaciones de escritorio nativas usando tecnologías web.

## 📋 Ventajas de Tauri vs Electron

- **Tamaño**: ~10MB vs ~100MB+ de Electron
- **Rendimiento**: Mejor rendimiento nativo
- **Seguridad**: Mejor modelo de seguridad
- **Memoria**: Menor uso de RAM
- **Actualizaciones**: Sistema de actualizaciones automáticas

## 🛠️ Instalación de Tauri

### 1. Instalar Rust (requerido para Tauri)
```bash
# Windows
winget install Rust.Rust
# o descargar desde https://rustup.rs/

# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 2. Instalar dependencias del sistema

**Windows:**
- Microsoft Visual Studio C++ Build Tools
- WebView2 (se instala automáticamente)

**macOS:**
```bash
xcode-select --install
```

**Linux:**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### 3. Instalar Tauri CLI
```bash
npm install -g @tauri-apps/cli
```

### 4. Inicializar Tauri en el proyecto
```bash
# Desde la raíz del proyecto
tauri init
```

### 5. Configurar Tauri para usar el build de Expo

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
        "height": 800
      }
    ]
  }
}
```

### 6. Scripts para Tauri

Agregar al `package.json`:
```json
{
  "scripts": {
    "tauri": "tauri",
    "desktop:dev": "npm run export && tauri dev",
    "desktop:build": "npm run export && tauri build"
  }
}
```

## 🎯 Uso

### Desarrollo:
```bash
npm run desktop:dev
```

### Build para producción:
```bash
npm run desktop:build
```

## 📁 Estructura del proyecto con Tauri

```
PathOut/
├── src/                    # Código React Native
├── dist/                   # Build web de Expo
├── src-tauri/             # Código Rust de Tauri
│   ├── src/
│   │   └── main.rs        # Punto de entrada
│   ├── Cargo.toml         # Dependencias Rust
│   └── tauri.conf.json    # Configuración
└── package.json
```

## 🔧 Migración desde Electron

1. **Eliminar carpeta electron/**
2. **Instalar Tauri**
3. **Configurar build scripts**
4. **Adaptar APIs específicas de Electron**

## 🚀 Beneficios para PathOut

- **Mejor rendimiento** para mapas y navegación
- **Menor tamaño** de descarga para usuarios
- **Actualizaciones automáticas** más eficientes
- **Mejor integración** con el sistema operativo 