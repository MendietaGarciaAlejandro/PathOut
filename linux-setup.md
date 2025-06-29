# 🐧 Configuración de React Native para Linux

React Native para Linux permite ejecutar aplicaciones React Native nativamente en sistemas Linux.

## 📋 Requisitos Previos

### Instalar dependencias del sistema (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y \
  build-essential \
  cmake \
  git \
  libgtk-3-dev \
  libwebkit2gtk-4.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  pkg-config \
  curl \
  wget
```

### Instalar Node.js y npm
```bash
# Usar nvm para instalar Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

## 🛠️ Configuración del Proyecto

### 1. Instalar React Native CLI
```bash
npm install -g @react-native-community/cli
```

### 2. Agregar soporte para Linux al proyecto
```bash
# Desde la raíz del proyecto
npx react-native init PathOutLinux --template react-native-template-typescript
cd PathOutLinux
npx react-native run-linux
```

### 3. Configurar el proyecto existente para Linux

Agregar al `package.json`:
```json
{
  "dependencies": {
    "react-native-linux": "^0.79.0"
  },
  "scripts": {
    "linux": "npx react-native run-linux",
    "linux:build": "npx react-native run-linux --release"
  }
}
```

### 4. Configurar Metro para Linux

Crear `metro.config.js`:
```javascript
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  
  config.resolver.platforms = ['native', 'linux', 'web'];
  
  return config;
})();
```

## 🎯 Uso

### Desarrollo:
```bash
npm run linux
```

### Build para producción:
```bash
npm run linux:build
```

## 📁 Estructura del proyecto

```
PathOut/
├── src/                    # Código React Native
├── linux/                  # Código específico de Linux
│   ├── CMakeLists.txt
│   ├── main.cpp
│   └── react-native-linux/
├── package.json
└── metro.config.js
```

## 🔧 Adaptaciones necesarias

### 1. Navegación
```typescript
// Usar react-navigation con soporte para Linux
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();
```

### 2. Mapas
```typescript
// Usar react-native-maps con soporte para Linux
import MapView from 'react-native-maps';
```

### 3. Base de datos
```typescript
// Usar SQLite con soporte para Linux
import * as SQLite from 'expo-sqlite';
```

## 🚀 Ventajas para PathOut

- **Rendimiento nativo** en Linux
- **Integración completa** con el sistema
- **Menor uso de recursos** que Electron
- **Actualizaciones del sistema** automáticas
- **Acceso completo** a APIs del sistema

## 🐛 Solución de problemas comunes

### Error de dependencias faltantes:
```bash
sudo apt install --reinstall libgtk-3-dev
```

### Error de compilación:
```bash
# Limpiar cache
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

### Error de permisos:
```bash
chmod +x linux/build.sh
``` 